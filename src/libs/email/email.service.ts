import { Injectable, Logger } from '@nestjs/common';
import { EmailAddress } from './email-address';

export interface SendEmailInput {
  to: EmailAddress;
  subject: string;
  body: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(input: SendEmailInput): Promise<void> {
    this.logger.debug(
      `Enviando email para ${input.to.toString()} com assunto: ${input.subject}`,
    );
  }
}
