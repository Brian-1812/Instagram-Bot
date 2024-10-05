import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JOB_NAMES, TRANSCODE_QUEUE } from 'src/queue/constants';
import { WebhookIncomingDataDto } from './types/dtos';
import { GenerateResponseDataDto } from 'src/queue/types/dtos';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(@InjectQueue(TRANSCODE_QUEUE) private transcodeQueue: Queue) {}

  async processWebhookData(data: WebhookIncomingDataDto) {
    this.logger.log('Processing incoming webhook data');
    this.logger.debug(data);
    for (const entry of data.entry) {
      let options: GenerateResponseDataDto = {
        instagram_id: '',
        sender_id: '',
        receiver_id: '',
        client_id: '',
        message: '',
        message_id: '',
        message_type: 'text',
      };
      if (!entry.id) continue;
      options['instagram_id'] = entry.id;
      const messaging = entry?.messaging?.[0];
      if (!messaging || !messaging?.message || messaging?.message?.is_echo) {
        continue;
      }
      options['sender_id'] = messaging.sender.id;
      options['receiver_id'] = messaging.recipient.id;
      options['client_id'] =
        messaging.sender.id !== entry.id
          ? messaging.sender.id
          : messaging.recipient.id;

      if (!messaging.message.text || messaging.message.is_unsupported) {
        this.logger.log('Unsupported message type');
        // TODO: Handle messages with attachments
        continue;
      }
      options['message'] = messaging.message.text;
      options['message_id'] = messaging.message.mid;
      options['attachments'] = messaging.message.attachments?.map((att) => ({
        type: att?.type ?? 'other',
        payload: att?.payload.url,
      }));
      this.logger.log('Adding job to the queue');
      this.logger.debug(options);
      await this.transcodeQueue.add(JOB_NAMES.generateAiResponse, options);
    }
  }
}
