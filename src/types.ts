export type MessageAttchmentType =
  | {
      type: Omit<AttachmentType, 'MEDIA_SHARE' | 'other'>;
      payload: {
        url: string;
      };
    }
  | {
      type: 'MEDIA_SHARE';
      payload: {
        id: string;
      };
    }
  | {
      type: string;
    };

export type IMessageType = {
  text?: string;
  attachment?: MessageAttchmentType;
};

export type MessageType = 'text' | 'attachment';

export type AttachmentType =
  | 'image'
  | 'video'
  | 'audio'
  | 'MEDIA_SHARE'
  | 'file'
  | 'reel'
  | 'ig_reel'
  | 'story_mention'
  | 'share'
  | 'other';

export interface IImageDataRaw extends IVideoDataRaw {
  max_height?: number;
  max_width?: number;
  animated_gif_url?: string;
  animated_gif_preview_url?: string;
  render_as_sticker?: boolean;
}

export interface IVideoDataRaw {
  width?: number;
  height?: number;
  url?: string;
  preview_url?: string;
}

export interface ISenderRaw {
  id: string;
  username: string;
}

export interface IResponseMessageRaw {
  id: string;
  created_time: string;
  from: ISenderRaw;
  to: {
    data: ISenderRaw[];
  };
  message?: string;
  attachments?: {
    data: {
      image_data?: IImageDataRaw;
      video_data?: IImageDataRaw;
    }[];
  };
  shares?: {
    data: {
      link: string;
    }[];
  };
  is_unsupported?: boolean;
}

export interface IProjectModel {
  id: number;
  name: string;
  access_token: string;
  access_token_expires: Date;
  project_id: string;
  instagram_id: string;
  chatrooms?: IChatRoomModel[];

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IChatRoomModel {
  id: number;
  project_id: number;
  client_id: string;
  instgram_conversation_id: string;
  messages?: IMessageModel[];

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IMessageModel {
  id: number;
  instagram_id: string;
  type: MessageType;
  text?: string;
  sender_id: string;
  receiver_id: string;
  chat_room_id: number;
  attachments?: IAttachmentModel[];

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IAttachmentModel {
  id: number;
  type: AttachmentType;
  content?: string;
  message_id: number;

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IChatMessage {
  text: string;
  sender: 'assistant' | 'user';
}

export interface AIRequestParamsType {
  history: IChatMessage[];
  question: string;
  projectId: string;
}

export interface AIResponseType {
  message: string;
}
