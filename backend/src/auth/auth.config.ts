import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { phoneNumber, emailOTP } from 'better-auth/plugins';
import { PrismaService } from 'prisma/prisma.service';
import { PhoneVerificationProvider } from './interfaces/phone-verification-provider.interface';
import { EmailVerificationProvider } from './interfaces/email-verification-provider.interface';
import { AUTH_INSTANCE } from './auth.constants';

export { AUTH_INSTANCE };

export function createBetterAuth(
  prisma: PrismaService,
  phoneProvider: PhoneVerificationProvider,
  emailProvider: EmailVerificationProvider,
) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'Konfigurasi BETTER_AUTH_SECRET wajib tersedia. Pastikan environment variable BETTER_AUTH_SECRET telah diatur di .env',
    );
  }

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    secret,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    basePath: '/api/auth',
    advanced: {
      cookiePrefix: 'cekemmy',
    },
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      afterEmailVerification: async (user) => {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerifiedAt: new Date(),
          },
        });
      },
    },
    plugins: [
      phoneNumber({
        sendOTP: async ({ phoneNumber, code }) => {
          await phoneProvider.sendOtp(phoneNumber, code);
        },
        signUpOnVerification: {
          getTempEmail: (phone: string) =>
            `${phone}@phone-auth.internal.cekemmy.local`,
          getTempName: (phone: string) => phone,
        },
        callbackOnVerification: async ({ user }) => {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              phoneVerifiedAt: new Date(),
            },
          });
        },
      }),
      emailOTP({
        sendVerificationOTP: async ({ email, otp, type }) => {
          await emailProvider.sendOtp(email, otp, type);
        },
      }),
    ],
  });
}

export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;
