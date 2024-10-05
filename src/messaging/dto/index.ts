import {
  IResponseMessageRaw,
  ISenderRaw,
  MessageAttchmentType,
} from 'src/types';

export interface ConversationMessagesDto {
  messages: {
    data: IResponseMessageRaw[];
  };
  participants?: {
    data: ISenderRaw[];
  };
}

export interface ConversationResponseDto {
  id: string;
  updated_time: string;
}

export interface SendMessageDTO {
  recipient: {
    id: string | number;
  };
  message:
    | {
        attachment: MessageAttchmentType;
      }
    | {
        text: string;
      };
}
