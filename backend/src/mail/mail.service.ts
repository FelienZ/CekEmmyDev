import { Inject, Injectable } from '@nestjs/common';
import { MAIL_PROVIDER } from './mail.constants';
import { type MailProvider } from './interfaces/mail-provider.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_PROVIDER) private readonly mailProvider: MailProvider,
  ) {}

  async sendOtp(email: string, otp: string, type: string): Promise<void> {
    await this.mailProvider.sendOtp(email, otp, type);
  }
}
