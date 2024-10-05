import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INSTAGRAM_BASE_URL } from 'src/config';
import { IMessageType } from 'src/types';
import { delay } from 'src/utils';
import { GraphQLFields, MAX_INSTAGRAM_MESSAGE_LENGTH } from './constants';
import {
  ConversationMessagesDto,
  ConversationResponseDto,
  SendMessageDTO,
} from './dto';
import { FetchService } from './fetch.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  private defaultAccessToken = null;

  constructor(
    private configService: ConfigService,
    private readonly fetchService: FetchService,
  ) {
    this.defaultAccessToken = this.configService.get(
      'INSTA_ACCOUNT_ACCESS_TOKEN',
    );
  }

  private divideMessageText = (text: string) => {
    const messages: string[] = [];
    const loopCount = Math.ceil(text.length / MAX_INSTAGRAM_MESSAGE_LENGTH);
    for (let i = 0; i < loopCount; i++) {
      const start = i * MAX_INSTAGRAM_MESSAGE_LENGTH;
      const end = (i + 1) * MAX_INSTAGRAM_MESSAGE_LENGTH;
      const slice = text.slice(start, end);
      messages.push(slice);
    }
    return messages;
  };

  private formatMessageTexts = (
    slices: string[],
    recipientId: string | number,
  ): SendMessageDTO[] => {
    return slices.map((slice) => ({
      recipient: {
        id: recipientId,
      },
      message: {
        text: slice,
      },
    }));
  };

  getDefaultHeaders(accessToken = this.defaultAccessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(
    recipientId: string,
    message: IMessageType,
    userId: string = 'me',
    access_token?: string,
  ) {
    let messages: SendMessageDTO[] = [];
    if (!message?.text && !message.attachment) {
      throw new Error('Message or attachment is required');
    }

    if (message.attachment) {
      messages.push({
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: message.attachment,
        },
      });
    }

    if (!!message?.text) {
      // If message is longer than the instagram's max message length
      const slices = this.divideMessageText(message.text);
      messages.push(...this.formatMessageTexts(slices, recipientId));
    }

    // Send each message
    // TODO: research on bulk send
    const responsePromises = messages.map(async (message, i) => {
      const { data } = await this.fetchService.post(
        `${INSTAGRAM_BASE_URL}/${userId}/messages`,
        message,
        {
          headers: this.getDefaultHeaders(access_token),
        },
      );
      // Avoid spamming
      await delay(0.4);
      return data;
    });
    const responses = await Promise.all(responsePromises);
    this.logger.log(`Response: `, responses);
    return responses;
  }

  async getUserInfo(userId: string = 'me', access_token?: string) {
    const query_fields = `fields=${GraphQLFields.profile}&access_token=${access_token ?? this.defaultAccessToken}`;
    const { data } = await this.fetchService.get(
      `${INSTAGRAM_BASE_URL}/${userId}?${query_fields}`,
    );
    this.logger.log(`Data: `, data);
    return data;
  }

  async getUserPosts(userId: string = 'me', access_token?: string) {
    const query_fields = `access_token=${access_token ?? this.defaultAccessToken}`;
    // const userProfile = await this.getUserInfo();
    const { data } = await this.fetchService.get(
      `${INSTAGRAM_BASE_URL}/${userId}/media?${query_fields}`,
    );
    this.logger.log(`Data: `, data);
    return data;
  }

  async getUserConversations(
    userId: string = 'me',
    recipientId?: string,
    access_token?: string,
  ) {
    let query_fields = `platform=instagram&access_token=${access_token ?? this.defaultAccessToken}`;
    if (recipientId) {
      query_fields += `&user_id=${recipientId}`;
    }
    const { data } = await this.fetchService.get<{
      data: ConversationResponseDto[];
    }>(`${INSTAGRAM_BASE_URL}/${userId}/conversations?${query_fields}`);
    this.logger.log(`Data: `, data?.data?.length);
    return data.data ?? [];
  }

  async getConversationMessages(
    conversationId: string,
    userId: string = 'me',
    access_token?: string,
  ) {
    const query_fields = `fields=${GraphQLFields.messages}&access_token=${access_token ?? this.defaultAccessToken}`;
    const { data } = await this.fetchService.get<{
      data: ConversationMessagesDto;
    }>(`${INSTAGRAM_BASE_URL}/${conversationId}?${query_fields}`);
    this.logger.log(`Data: `, data);
    return data;
  }

  async getMessageContent(
    messageId: string,
    userId: string = 'me',
    access_token?: string,
  ) {
    const query_fields = `fields=${GraphQLFields.messageContent}&access_token=${access_token ?? this.defaultAccessToken}`;
    const { data } = await this.fetchService.get(
      `${INSTAGRAM_BASE_URL}/${messageId}?${query_fields}`,
    );
    this.logger.log(`Data: `, data);
    return data;
  }
}
