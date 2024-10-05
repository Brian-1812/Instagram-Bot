import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { ConfigModule } from '@nestjs/config';
import { TRANSCODE_QUEUE } from 'src/queue/constants';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [ConfigModule, BullModule.registerQueue({ name: TRANSCODE_QUEUE })],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
