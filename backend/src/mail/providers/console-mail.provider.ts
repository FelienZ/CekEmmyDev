import { Injectable, Logger } from '@nestjs/common';
import { MailProvider } from '../interfaces/mail-provider.interface';

@Injectable()
export class ConsoleMailProvider implements MailProvider {
  private readonly logger = new Logger(ConsoleMailProvider.name);
  private readonly sentOtps = new Map<string, string>();

  async sendOtp(email: string, otp: string, type: string): Promise<void> {
    this.sentOtps.set(email, otp);
    this.logger.log(
      `[DEV ONLY] Sent ${type} OTP ${otp} to email address ${email}`,
    );
    await Promise.resolve();
  }

  getLatestOtp(email: string): string | undefined {
    return this.sentOtps.get(email);
  }

  clear(): void {
    this.sentOtps.clear();
  }
}
