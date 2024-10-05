import { ISenderRaw } from 'src/types';

export interface WebhookEntryType {
  time: number;
  id: string; // The ID of your app user's Instagram Professional account
  messaging?: WebhookMessagingType[];
  changes?: WebhookChangesType[];
}

// Messaging
export interface WebhookMessagingType {
  sender: { id: string }; // Instagram-scoped ID for the Instagram user
  recipient: { id: string }; // ID of your app user's Instagram Professional account
  timestamp: number;
  message?: WebhookMessageType;
  reaction?: WebhookReactionType;
  read?: WebhookReadType;
  postback?: WebhookMessaginPostbackType;
  referral?: WebhookMessaginReferralType;
}

export interface WebhookMessageType {
  mid: string; // ID of the message sent
  is_echo?: boolean;
  is_deleted?: boolean;
  is_unsupported?: boolean;
  text?: string;
  attachments?: WebhookAttachmentType[];
  reply_to?: InstaReplyToType;
  quick_reply?: WebhookQuickReplyType;
  referral?: WebhookReferralType;
}

export interface WebhookAttachmentType {
  type:
    | 'ig_reel'
    | 'image'
    | 'audio'
    | 'video'
    | 'file'
    | 'reel'
    | 'story_mention'
    | 'share';
  payload?: InstaReelPayloadType | InstaMediaPayloadType;
}

export interface InstaReelPayloadType {
  reel_video_id?: string;
  title?: string;
  url?: string;
}

export interface InstaMediaPayloadType {
  url: string;
}

export interface InstaReplyToType {
  mid?: string; // Inline reply
  story?: {
    id: string;
    url: string;
  };
}

export interface WebhookReadType {
  mid: string;
}

export interface WebhookReactionType {
  mid: string;
  action: 'react' | 'unreact';
  reaction?: string;
  emoji?: string;
}

export interface WebhookQuickReplyType {
  payload: string;
}

export interface WebhookReferralType {
  product?: { id: string };
  ref?: string;
  ad_id?: string;
  source?: string;
  type?: string;
  ads_context_data?: {
    ad_title: string;
    photo_url: string;
    video_url: string;
  };
}

export interface WebhookMessaginPostbackType {
  mid: string; // ID for the message sent to your app user
  title: string;
  payload: any; // The payload with the option selected by the Instagram user
}

export interface WebhookMessaginReferralType {
  ref: string;
  source: string;
  type: 'OPEN_THREAD'; // Included when a message is part of an existing conversation
}

// Changes
export interface WebhookChangesType {
  field: string;
  value: WebhookChangesValueType;
}

export interface WebhookChangesValueType {
  from: ISenderRaw;
  id: string;
  text: string;
  media: {
    id: string;
    media_product_type: string;
  };
}
