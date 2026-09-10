export interface EmailVerificationProvider {
  sendOtp(email: string, otp: string, type: string): Promise<void>;
}
