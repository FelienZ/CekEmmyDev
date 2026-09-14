import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { UsersModule } from '@/users/users.module';
import { ConsolePhoneVerificationProvider } from './providers/console-phone-verification.provider';
import { ConsoleEmailVerificationProvider } from './providers/console-email-verification.provider';
import { PhoneVerificationProvider } from './interfaces/phone-verification-provider.interface';
import { EmailVerificationProvider } from './interfaces/email-verification-provider.interface';
import { AUTH_INSTANCE, createBetterAuth } from './auth.config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthRateLimiterService } from './services/auth-rate-limiter.service';
import { MailModule } from '../mail/mail.module';
import { EmailVerificationAdapter } from './providers/email-verification.adapter';
import { MemoryRateLimitStore } from './services/memory-rate-limit.store';
import { RATE_LIMIT_STORE } from './services/rate-limit-store.interface';

@Module({
  imports: [PrismaModule, forwardRef(() => UsersModule), MailModule],
  controllers: [AuthController],
  providers: [
    ConsolePhoneVerificationProvider,
    ConsoleEmailVerificationProvider,
    EmailVerificationAdapter,
    {
      provide: 'PHONE_VERIFICATION_PROVIDER',
      useExisting: ConsolePhoneVerificationProvider,
    },
    {
      provide: 'EMAIL_VERIFICATION_PROVIDER',
      useExisting: EmailVerificationAdapter,
    },
    {
      provide: AUTH_INSTANCE,
      useFactory: (
        prisma: PrismaService,
        phoneProvider: PhoneVerificationProvider,
        emailProvider: EmailVerificationProvider,
      ) => createBetterAuth(prisma, phoneProvider, emailProvider),
      inject: [
        PrismaService,
        'PHONE_VERIFICATION_PROVIDER',
        'EMAIL_VERIFICATION_PROVIDER',
      ],
    },
    AuthService,
    AuthGuard,
    RolesGuard,
    MemoryRateLimitStore,
    {
      provide: RATE_LIMIT_STORE,
      useExisting: MemoryRateLimitStore,
    },
    AuthRateLimiterService,
  ],
  exports: [
    AuthService,
    AuthRateLimiterService,
    AuthGuard,
    RolesGuard,
    AUTH_INSTANCE,
    'PHONE_VERIFICATION_PROVIDER',
    'EMAIL_VERIFICATION_PROVIDER',
    forwardRef(() => UsersModule),
  ],
})
export class AuthModule {}
