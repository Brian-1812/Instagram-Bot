import { ProjectCreationAttributes } from 'src/database/models/project.model';
import { AttachmentType, MessageType } from 'src/types';

export interface GenerateResponseDataDto {
  client_id: string;
  instagram_id: string;
  message?: string;
  sender_id: string;
  receiver_id: string;
  message_id: string;
  message_type: MessageType;
  attachments?: {
    type: AttachmentType;
    payload: string;
  }[];
}

export interface PreGeneratedProjectDto extends ProjectCreationAttributes {}
