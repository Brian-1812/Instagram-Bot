import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TRANSCODE_QUEUE } from './constants';
import { TranscodeConsumer } from './transcode.consumer';
import { HttpModule } from '@nestjs/axios';
import { Attachment, ChatRoom, Message, Project } from 'src/database/models';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessagingModule } from 'src/messaging/messaging.module';
import { TokenEncryptionService } from './encrypt.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password:
            configService.get('NODE_ENV') === 'production'
              ? configService.getOrThrow('REDIS_PASSWORD')
              : undefined,
        },
        prefix: 'instabot_',
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: TRANSCODE_QUEUE }),
    HttpModule,
    SequelizeModule.forFeature([Project, ChatRoom, Message, Attachment]),
    MessagingModule,
  ],
  controllers: [],
  providers: [TranscodeConsumer, TokenEncryptionService],
  exports: [TranscodeConsumer, TokenEncryptionService],
})
export class QueueModule {}
