export interface PhoneVerificationProvider {
  sendOtp(phoneNumber: string, code: string): Promise<void>;
}
