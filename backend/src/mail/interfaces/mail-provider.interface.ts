export interface MailProvider {
  sendOtp(email: string, otp: string, type: string): Promise<void>;
}
