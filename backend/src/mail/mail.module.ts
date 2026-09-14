import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MAIL_PROVIDER } from './mail.constants';
import { ConsoleMailProvider } from './providers/console-mail.provider';
import { ResendMailProvider } from './providers/resend-mail.provider';

@Module({
  providers: [
    ConsoleMailProvider,
    {
      provide: MAIL_PROVIDER,
      useFactory: () => {
        const provider = (process.env.EMAIL_OTP_PROVIDER || 'console')
          .toLowerCase()
          .trim();
        if (provider === 'console') {
          return new ConsoleMailProvider();
        }
        if (provider === 'resend') {
          return new ResendMailProvider();
        }
        throw new Error(
          `Konfigurasi EMAIL_OTP_PROVIDER invalid: "${provider}". Nilai yang diizinkan hanya "console" atau "resend".`,
        );
      },
    },
    MailService,
  ],
  exports: [MailService, MAIL_PROVIDER, ConsoleMailProvider],
})
export class MailModule {}
