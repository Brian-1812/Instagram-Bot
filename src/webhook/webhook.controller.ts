import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  constructor(
    private configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {}

  @Get()
  async verification(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: number,
  ) {
    if (
      !mode ||
      !verifyToken ||
      mode !== 'subscribe' ||
      verifyToken !== this.configService.get('INSTA_VERIFY_TOKEN')
    )
      throw new ForbiddenException();
    this.logger.debug('WEBHOOK_VERIFIED');
    return challenge;
  }

  @Post()
  async webhook(@Req() req: Request, @Res() response: Response) {
    let body = req.body;
    this.logger.debug(`\u{1F7EA} Received webhook:`);
    this.logger.debug(body);
    if (body.object === 'instagram') {
      await this.webhookService.processWebhookData(body);
      response.status(200).send('EVENT_RECEIVED');
    } else {
      response.sendStatus(404);
    }
  }
}
