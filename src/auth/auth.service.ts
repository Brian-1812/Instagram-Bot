import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JOB_NAMES, TRANSCODE_QUEUE } from 'src/queue/constants';
import { PreGeneratedProjectDto } from 'src/queue/types/dtos';
import { PreGeneratedProjecttDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(@InjectQueue(TRANSCODE_QUEUE) private transcodeQueue: Queue) {}

  async preGenerateProjectChatrooms(options: PreGeneratedProjecttDto) {
    const {
      name,
      instagramId,
      documProjectId,
      accessToken,
      access_token_expires,
    } = options;
    const projectOptions: PreGeneratedProjectDto = {
      name,
      instagram_id: instagramId,
      project_id: documProjectId,
      access_token: accessToken,
      // Not Implemented yet
      access_token_expires: access_token_expires ?? new Date(),
    };
    await this.transcodeQueue.add(JOB_NAMES.populateData, projectOptions);
    return {
      message:
        'Account created. Your chats & conversations will appear shortly',
    };
  }
}
