import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attachment, ChatRoom, Message, Project } from 'src/database/models';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { FetchService } from './fetch.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    SequelizeModule.forFeature([Project, ChatRoom, Message, Attachment]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, FetchService],
  exports: [MessagingService, FetchService],
})
export class MessagingModule {}
