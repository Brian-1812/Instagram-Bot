import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attachment, ChatRoom, Message, Project } from 'src/database/models';
import { TRANSCODE_QUEUE } from 'src/queue/constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    SequelizeModule.forFeature([Project, ChatRoom, Message, Attachment]),
    BullModule.registerQueue({ name: TRANSCODE_QUEUE }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
