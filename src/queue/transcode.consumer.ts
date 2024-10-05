import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bullmq';
import { Sequelize } from 'sequelize-typescript';
import { INSTAGRAM_BASE_URL } from 'src/config';
import { Attachment, ChatRoom, Message, Project } from 'src/database/models';
import { GraphQLFields } from 'src/messaging/constants';
import {
  ConversationMessagesDto,
  ConversationResponseDto,
} from 'src/messaging/dto';
import { FetchService } from 'src/messaging/fetch.service';
import { MessagingService } from 'src/messaging/messaging.service';
import { AttachmentType } from 'src/types';
import { delay } from 'src/utils';
import { JOB_NAMES, TRANSCODE_QUEUE } from './constants';
import { TokenEncryptionService } from './encrypt.service';
import { GenerateResponseDataDto, PreGeneratedProjectDto } from './types/dtos';

@Processor(TRANSCODE_QUEUE)
export class TranscodeConsumer extends WorkerHost {
  private readonly logger = new Logger(TranscodeConsumer.name);
  constructor(
    private readonly fetchService: FetchService,
    private readonly messagingService: MessagingService,
    private sequelize: Sequelize,
    private readonly tokenEncryptionService: TokenEncryptionService,
    @InjectModel(Project) private projectModel: typeof Project,
    @InjectModel(ChatRoom) private chatroomModel: typeof ChatRoom,
    @InjectModel(Message) private messageModel: typeof Message,
    @InjectModel(Attachment) private attachmentModel: typeof Attachment,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug('Transcoding message: ', job.id, job.name);
    switch (job.name) {
      case JOB_NAMES.populateData:
        return this.fetchAndStoreData(job.data);
      case JOB_NAMES.generateAiResponse:
        return this.generateAiResponse(job.data);
      default:
        break;
    }
    return;
  }

  async getUserConversations(
    userId: string = 'me',
    recipientId?: string,
    access_token?: string,
  ) {
    let query_fields = `platform=instagram&access_token=${access_token}`;
    if (recipientId) {
      query_fields += `&user_id=${recipientId}`;
    }
    const { data } = await this.fetchService.get<{
      data: ConversationResponseDto[];
    }>(`${INSTAGRAM_BASE_URL}/${userId}/conversations?${query_fields}`);
    this.logger.log(`Data: `, data?.data?.length);
    return data?.data ?? [];
  }

  async getConversationMessages(
    conversationId: string,
    userId?: string,
    access_token?: string,
  ) {
    const query_fields = `fields=${GraphQLFields.messages}&access_token=${access_token}`;
    const { data } = await this.fetchService.get<ConversationMessagesDto>(
      `${INSTAGRAM_BASE_URL}/${conversationId}?${query_fields}`,
    );
    this.logger.log(`Data: `, data?.messages?.data?.length);
    return {
      messages: data?.messages?.data ?? [],
      participants: data?.participants?.data ?? [],
    };
  }

  // TODO: Refactor
  async generateAiResponse(data: GenerateResponseDataDto) {
    try {
      this.logger.log('Generating AI response. Data: ');
      this.logger.debug(data);

      const project = await this.projectModel.findOne({
        where: { instagram_id: data.instagram_id },
      });

      if (!project?.id || !project?.project_id) {
        this.logger.error('Project not found or linked to any ai projects');
        throw new Error('Project not found or linked to any ai projects');
      }

      if (!project?.access_token) {
        this.logger.error('Access token not found');
        throw new Error('Access token not found');
      }

      // New user
      let [chatroom, created] = await this.chatroomModel.findOrCreate({
        where: { client_id: data.client_id, project_id: project.id },
        defaults: {
          instgram_conversation_id: '',
          project_id: project.id,
          client_id: data.client_id,
        },
        include: [{ model: Message, include: [Attachment] }],
      });

      this.logger.debug('Chatroom: ');
      this.logger.debug(chatroom.toJSON());

      if (!chatroom?.id) {
        this.logger.error('Failed to create conversation');
        throw new Error('Failed to create conversation');
      }

      if (created && !chatroom.messages?.length) {
        chatroom['messages'] = [];
      }

      // Add incoming data to messages
      const newMsg = await this.messageModel.create({
        type: !!data.message ? 'text' : 'attachment',
        text: data.message,
        instagram_id: data.message_id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        chat_room_id: chatroom.id,
      });
      if (data?.attachments?.length) {
        await this.attachmentModel.bulkCreate(
          data?.attachments?.map((att) => ({
            type: att.type ?? 'other',
            content: att.payload,
            message_id: newMsg.id,
          })),
        );
      }

      // Message creation is before this statement so that the message might include attachments other than text
      if (!data.message) {
        this.logger.error('Message is missing');
        return;
      }

      // TODO: Integrate LLMs & Generate AI response
      const aiResponse = '';

      // Send response to client
      const access_token_decrypted = this.tokenEncryptionService.decrypt(
        project.access_token,
      );
      const res = await this.messagingService.sendMessage(
        data.client_id,
        { text: aiResponse },
        project.instagram_id,
        access_token_decrypted,
      );
      this.logger.debug('Response sent to client: ');
      this.logger.debug(res);

      const newMsgInstance = await this.messageModel.create({
        type: 'text',
        text: aiResponse,
        sender_id: project.instagram_id,
        receiver_id: data.client_id,
        chat_room_id: chatroom.id,
      });

      this.logger.debug('Completed generating AI response');
      return newMsgInstance;
    } catch (error) {
      this.logger.error(error);
      return;
    }
  }

  // TODO: Refactor
  async fetchAndStoreData(projectOptions: PreGeneratedProjectDto) {
    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        this.logger.log('Creating project with options: ');
        const { access_token, ...projectOptionsRest } = projectOptions;
        this.logger.debug(projectOptionsRest);

        if (!projectOptions.instagram_id || !projectOptions.access_token) {
          this.logger.error('Instagram id & access_token are required');
          throw new Error('Instagram id & access_token are required');
        }

        const encryptedToken =
          this.tokenEncryptionService.encrypt(access_token);
        const project = await this.projectModel.create(
          { ...projectOptionsRest, access_token: encryptedToken },
          transactionHost,
        );

        if (!project) {
          this.logger.error('Failed to create project');
          throw new Error('Failed to create project');
        }
        this.logger.log('Fetching and storing data for project: ', project.id);

        const conversations = await this.getUserConversations(
          project.instagram_id,
          undefined,
          access_token,
        );
        this.logger.log('Conversations count: ');
        this.logger.debug(conversations?.length);

        for (const conversation of conversations) {
          const { messages, participants } = await this.getConversationMessages(
            conversation.id,
            undefined,
            access_token,
          );
          const client = participants.find(
            (p) =>
              p.id?.toString()?.trim() !==
              project.instagram_id?.toString()?.trim(),
          );
          this.logger.log('Client: ');
          this.logger.debug(client);
          if (!client) {
            this.logger.error('Client not found in participants');
            continue;
          }
          const chatroom = await this.chatroomModel.create(
            {
              project_id: project.id,
              client_id: client.id,
              instgram_conversation_id: conversation?.id,
            },
            transactionHost,
          );
          if (!chatroom) {
            this.logger.error('Failed to create chatroom');
            continue;
          }

          for (const message of messages) {
            let hasAttachments = !!message.attachments?.data?.length;
            const newMsgInstance = await this.messageModel.create(
              {
                type: hasAttachments ? 'attachment' : 'text',
                text: message.message,
                instagram_id: message.id,
                sender_id: message.from?.id,
                receiver_id: message.to?.data?.[0]?.id,
                chat_room_id: chatroom.id,
              },
              transactionHost,
            );
            if (!newMsgInstance) {
              this.logger.warn('Message cannot be created');
              continue;
            }
            if (hasAttachments) {
              if (message.attachments?.data?.length) {
                for (const att of message.attachments.data) {
                  let attachmentType: AttachmentType = 'other';
                  if (!!att.image_data) {
                    attachmentType = 'image';
                  } else if (!!att.video_data) {
                    attachmentType = 'video';
                  }
                  let content = att.image_data?.url ?? att.video_data?.url;
                  await this.attachmentModel.create(
                    {
                      type: attachmentType,
                      content,
                      message_id: newMsgInstance.id,
                    },
                    transactionHost,
                  );
                }
              } else if (message.shares?.data?.length) {
                let attachmentType: AttachmentType = 'MEDIA_SHARE';
                for (const share of message.shares.data) {
                  let content = share?.link;
                  await this.attachmentModel.create(
                    {
                      type: attachmentType,
                      content,
                      message_id: newMsgInstance.id,
                    },
                    transactionHost,
                  );
                }
              }
            }
          }

          this.logger.log(`Fetched ${messages?.length} messages`);
          await delay(2);
        }

        this.logger.debug(
          'Completed fetching and storing data for project: ',
          project.id,
        );
      });
    } catch (error) {
      this.logger.error(error);
      return;
    }
  }
}
