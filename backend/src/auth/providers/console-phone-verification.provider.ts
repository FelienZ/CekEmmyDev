import { Injectable, Logger } from '@nestjs/common';
import { PhoneVerificationProvider } from '../interfaces/phone-verification-provider.interface';

@Injectable()
export class ConsolePhoneVerificationProvider implements PhoneVerificationProvider {
  private readonly logger = new Logger(ConsolePhoneVerificationProvider.name);
  private sentOtps: Map<string, string> = new Map();

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    this.sentOtps.set(phoneNumber, code);
    this.logger.log(
      `[DEV ONLY] Sent OTP ${code} to phone number ${phoneNumber}`,
    );
    await Promise.resolve();
  }

  getLatestOtp(phoneNumber: string): string | undefined {
    return this.sentOtps.get(phoneNumber);
  }

  clear(): void {
    this.sentOtps.clear();
  }
}
