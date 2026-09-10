import { Injectable, Logger } from '@nestjs/common';
import { EmailVerificationProvider } from '../interfaces/email-verification-provider.interface';

@Injectable()
export class ConsoleEmailVerificationProvider implements EmailVerificationProvider {
  private readonly logger = new Logger(ConsoleEmailVerificationProvider.name);
  private sentOtps: Map<string, string> = new Map();

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
