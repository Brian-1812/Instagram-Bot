import { WebhookEntryType } from './types';

export interface WebhookIncomingDataDto {
  object: 'instagram' | 'page';
  entry: WebhookEntryType[];
}
