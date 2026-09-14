import { Injectable, Logger } from '@nestjs/common';
import { EmailVerificationProvider } from '../interfaces/email-verification-provider.interface';
import { MailService } from '../../mail/mail.service';

/**
 * Adapter connecting Better Auth's EmailVerificationProvider contract to MailService.
 * Keeps Better Auth decoupled from mail delivery providers.
 */
@Injectable()
export class EmailVerificationAdapter implements EmailVerificationProvider {
  private readonly logger = new Logger(EmailVerificationAdapter.name);
  constructor(private readonly mailService: MailService) {}

  // ini diinject dari module auth untuk createInstance betterAuth
  async sendOtp(email: string, otp: string, type: string): Promise<void> {
    await this.mailService.sendOtp(email, otp, type);
  }
}
