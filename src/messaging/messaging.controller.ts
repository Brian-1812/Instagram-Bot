import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { IMessageType } from 'src/types';

@Controller('messaging')
export class MessagingController {
  private readonly logger = new Logger(MessagingController.name);
  constructor(private readonly messagingService: MessagingService) {}

  @Get('profile')
  async getUserInfo(@Query('userId') userId: string) {
    return this.messagingService.getUserInfo(userId);
  }

  @Get('posts')
  async getUserPosts() {
    return this.messagingService.getUserPosts();
  }

  @Post('send')
  async sendMessage(
    @Body('recipientId') recipientId: string,
    @Body('message') message: IMessageType,
  ) {
    this.logger.debug(
      `\u{1F7EA} Sending message to ${recipientId}:\n`,
      message,
    );
    return this.messagingService.sendMessage(recipientId, message);
  }

  @Get('conversations')
  async getConversations(@Query('clientId') clientId: string | undefined) {
    return this.messagingService.getUserConversations(undefined, clientId);
  }

  @Get('conversation-messages')
  async getConversationMessages(
    @Query('conversationId') conversationId: string,
  ) {
    return this.messagingService.getConversationMessages(conversationId);
  }

  @Get('message')
  async getMessageContent(@Query('messageId') messageId: string) {
    return this.messagingService.getMessageContent(messageId);
  }
}
