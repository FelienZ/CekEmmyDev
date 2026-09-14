import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MailProvider } from '../interfaces/mail-provider.interface';

@Injectable()
export class ResendMailProvider implements MailProvider {
  private readonly logger = new Logger(ResendMailProvider.name);
  private readonly resend: Resend;
  private readonly defaultFrom: string;

  constructor(resendClient?: Resend) {
    if (resendClient) {
      this.resend = resendClient;
    } else {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        throw new Error(
          'Konfigurasi RESEND_API_KEY wajib tersedia ketika EMAIL_OTP_PROVIDER=resend.',
        );
      }
      this.resend = new Resend(apiKey.trim());
    }

    this.defaultFrom =
      process.env.RESEND_FROM ||
      process.env.EMAIL_FROM ||
      'CekEmmy <onboarding@resend.dev>';
  }

  async sendOtp(email: string, otp: string, type: string): Promise<void> {
    const subject =
      type === 'email-verification'
        ? 'Kode Verifikasi Email Akun CekEmmy'
        : `Kode Verifikasi OTP (${type}) - CekEmmy`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333333; margin-bottom: 16px;">Verifikasi Akun Kedai CekEmmy</h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          Halo, silahkan gunakan kode OTP berikut untuk menyelesaikan proses verifikasi Anda:
        </p>
        <div style="margin: 24px 0; padding: 16px; background-color: #f4f6f8; border-radius: 6px; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #228B22;">${otp}</span>
        </div>
        <p style="color: #777777; font-size: 12px; line-height: 1.4;">
          Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun termasuk pihak CekEmmy.
        </p>
      </div>
    `.trim();

    const text = `Halo, kode OTP verifikasi CekEmmy Anda adalah: ${otp}. Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`;

    const { error } = await this.resend.emails.send({
      from: this.defaultFrom,
      to: [email],
      subject,
      html,
      text,
    });

    if (error) {
      this.logger.error(
        `Gagal mengirim email OTP via Resend: ${error.message}`,
      );
      throw new Error(`Gagal mengirim email OTP: ${error.message}`);
    }

    this.logger.log(
      `Email OTP (${type}) berhasil dikirim via Resend ke ${email}`,
    );
  }
}
