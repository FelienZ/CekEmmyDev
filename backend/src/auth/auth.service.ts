import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isEmail as isEmailValidator } from 'class-validator';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { UserRepository } from '@/users/repositories/user.repository';
import { PrismaService } from 'prisma/prisma.service';
import { normalizeEmail, normalizePhoneNumber } from '@/helper/phone.helper';
import { AUTH_INSTANCE } from './auth.constants';
import type { BetterAuthInstance } from './auth.config';
import { AuthRateLimiterService } from './services/auth-rate-limiter.service';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RegisterPhoneDto } from './dto/register-phone.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';

function isUnauthorizedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as Record<string, unknown>;
  return (
    anyErr.status === 'UNAUTHORIZED' ||
    anyErr.statusCode === 401 ||
    anyErr.name === 'APIError'
  );
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_INSTANCE) private auth: BetterAuthInstance,
    private userRepository: UserRepository,
    private prisma: PrismaService,
    private rateLimiter: AuthRateLimiterService,
  ) {}

  async login(
    dto: LoginDto,
    headers?: Headers,
    clientIp = '127.0.0.1',
  ): Promise<Response> {
    const isEmail = dto.identifier.includes('@');
    let response: Response;

    if (isEmail) {
      const normalizedEmail = normalizeEmail(dto.identifier);
      if (!normalizedEmail || !isEmailValidator(normalizedEmail)) {
        throw new BadRequestException('Format email tidak valid');
      }

      this.rateLimiter.checkLoginRateLimit(clientIp, normalizedEmail, 'email');

      try {
        response = await this.auth.api.signInEmail({
          body: {
            email: normalizedEmail,
            password: dto.password,
          },
          headers,
          asResponse: true,
        });
      } catch (err: unknown) {
        if (err instanceof HttpException) throw err;
        if (isUnauthorizedError(err)) {
          throw new UnauthorizedException(
            'Email atau password yang Anda masukkan salah',
          );
        }
        throw err;
      }
    } else {
      const normalizedPhone = normalizePhoneNumber(dto.identifier);
      if (!normalizedPhone) {
        throw new BadRequestException('Format nomor telepon tidak valid');
      }

      this.rateLimiter.checkLoginRateLimit(clientIp, normalizedPhone, 'phone');

      try {
        response = await this.auth.api.signInPhoneNumber({
          body: {
            phoneNumber: normalizedPhone,
            password: dto.password,
          },
          headers,
          asResponse: true,
        });
      } catch (err: unknown) {
        if (err instanceof HttpException) throw err;
        if (isUnauthorizedError(err)) {
          throw new UnauthorizedException(
            'Nomor telepon atau password yang Anda masukkan salah',
          );
        }
        throw err;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedException(
          isEmail
            ? 'Email atau password yang Anda masukkan salah'
            : 'Nomor telepon atau password yang Anda masukkan salah',
        );
      }
      throw new UnauthorizedException('Gagal melakukan autentikasi');
    }

    // Identity verified! Now inspect domain status to enforce lifecycle without user enumeration
    const cloned = response.clone();
    const payload = (await cloned.json().catch(() => null)) as {
      token?: string;
      user?: { id: string };
    } | null;

    if (payload?.user?.id) {
      const user = await this.userRepository.findById(payload.user.id);
      if (user) {
        if (user.status === UserStatus.PENDING_ACTIVATION) {
          if (payload.token) {
            await this.prisma.session.deleteMany({
              where: { token: payload.token },
            });
          }
          throw new ForbiddenException(
            'Akun belum aktif. Selesaikan verifikasi dan pembuatan password',
          );
        }

        if (user.status === UserStatus.INACTIVE) {
          if (payload.token) {
            await this.prisma.session.deleteMany({
              where: { token: payload.token },
            });
          }
          throw new ForbiddenException(
            'Akun dinonaktifkan. Hubungi administrator',
          );
        }
      }
    }

    return response;
  }

  async setPassword(dto: SetPasswordDto, headers?: Headers, userId?: string) {
    const reqHeaders = headers ?? new Headers();

    let targetUserId = userId;
    if (!targetUserId) {
      const session = await this.auth.api.getSession({ headers: reqHeaders });
      if (!session || !session.user) {
        throw new UnauthorizedException('Sesi tidak valid atau telah berakhir');
      }
      targetUserId = session.user.id;
    }

    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException(
        'Akun sudah aktif. Gunakan fitur ubah password untuk mengganti password',
      );
    }

    if (user.status !== UserStatus.PENDING_ACTIVATION) {
      throw new BadRequestException(
        'Status akun tidak valid untuk aktivasi password',
      );
    }

    await this.auth.api.setPassword({
      body: {
        newPassword: dto.newPassword,
      },
      headers: reqHeaders,
    });

    await this.userRepository.updateStatus(user.id, UserStatus.ACTIVE);

    const updatedUser = await this.userRepository.findById(user.id);
    return {
      message: 'Password berhasil dibuat dan akun telah aktif',
      user: updatedUser,
    };
  }

  async registerPhone(dto: RegisterPhoneDto, clientIp = '127.0.0.1') {
    const normalizedPhone = normalizePhoneNumber(dto.phone);
    if (!normalizedPhone) {
      throw new BadRequestException('Format nomor telepon tidak valid');
    }

    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Nama tidak boleh kosong');
    }

    // Critical ordering: Rate limit BEFORE DB check/creation and BEFORE Better Auth OTP
    this.rateLimiter.checkOtpSendRateLimit(clientIp, normalizedPhone, 'phone');

    const existingUser = await this.userRepository.findByPhone(normalizedPhone);
    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE) {
        throw new ConflictException(
          'Nomor telepon sudah terdaftar dan aktif. Silakan login langsung',
        );
      }
    } else {
      try {
        await this.userRepository.create({
          name,
          phoneNumber: normalizedPhone,
          role: UserRole.CUSTOMER,
          status: UserStatus.PENDING_ACTIVATION,
        });
      } catch (err: unknown) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          const racedUser =
            await this.userRepository.findByPhone(normalizedPhone);
          if (racedUser?.status === UserStatus.ACTIVE) {
            throw new ConflictException(
              'Nomor telepon sudah terdaftar dan aktif. Silakan login langsung',
            );
          }
        } else {
          throw err;
        }
      }
    }
    await this.auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: normalizedPhone,
      },
    });

    return {
      message: 'Kode OTP telah dikirim ke nomor telepon',
      phone: normalizedPhone,
    };
  }

  async verifyPhoneOtp(
    dto: VerifyPhoneOtpDto,
    headers?: Headers,
    clientIp = '127.0.0.1',
  ): Promise<Response> {
    const normalizedPhone = normalizePhoneNumber(dto.phone);
    if (!normalizedPhone) {
      throw new BadRequestException('Format nomor telepon tidak valid');
    }

    this.rateLimiter.checkOtpVerifyRateLimit(
      clientIp,
      normalizedPhone,
      'phone',
    );

    const response = await this.auth.api.verifyPhoneNumber({
      body: {
        phoneNumber: normalizedPhone,
        code: dto.code,
      },
      headers,
      asResponse: true,
    });

    if (!response.ok) {
      throw new BadRequestException('Kode OTP salah atau telah kadaluarsa');
    }

    return response;
  }

  async registerEmail(dto: RegisterEmailDto, clientIp = '127.0.0.1') {
    const normalizedEmail = normalizeEmail(dto.email);
    if (!normalizedEmail || !isEmailValidator(normalizedEmail)) {
      throw new BadRequestException('Format email tidak valid');
    }

    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Nama tidak boleh kosong');
    }

    // Critical ordering: Rate limit BEFORE DB check/creation and BEFORE Better Auth OTP
    this.rateLimiter.checkOtpSendRateLimit(clientIp, normalizedEmail, 'email');

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE) {
        throw new ConflictException(
          'Email sudah terdaftar dan aktif. Silakan login langsung',
        );
      }
    } else {
      try {
        await this.userRepository.create({
          name,
          email: normalizedEmail,
          role: UserRole.CUSTOMER,
          status: UserStatus.PENDING_ACTIVATION,
        });
      } catch (err: unknown) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          const racedUser =
            await this.userRepository.findByEmail(normalizedEmail);
          if (racedUser?.status === UserStatus.ACTIVE) {
            throw new ConflictException(
              'Email sudah terdaftar dan aktif. Silakan login langsung',
            );
          }
        } else {
          throw err;
        }
      }
    }
    await this.auth.api.sendVerificationOTP({
      body: {
        email: normalizedEmail,
        type: 'email-verification',
      },
    });
    return {
      message: 'Permintaan kode OTP berhasil diproses',
      email: normalizedEmail,
    };
  }

  async verifyEmailOtp(
    dto: VerifyEmailOtpDto,
    headers?: Headers,
    clientIp = '127.0.0.1',
  ): Promise<Response> {
    const normalizedEmail = normalizeEmail(dto.email);
    if (!normalizedEmail || !isEmailValidator(normalizedEmail)) {
      throw new BadRequestException('Format email tidak valid');
    }

    this.rateLimiter.checkOtpVerifyRateLimit(
      clientIp,
      normalizedEmail,
      'email',
    );

    const response = await this.auth.api.verifyEmailOTP({
      body: {
        email: normalizedEmail,
        otp: dto.otp,
      },
      headers,
      asResponse: true,
    });

    if (!response.ok) {
      throw new BadRequestException('Kode OTP salah atau telah kadaluarsa');
    }

    return response;
  }

  async signOut(headers?: Headers): Promise<Response> {
    return await this.auth.api.signOut({
      headers: headers ?? new Headers(),
      asResponse: true,
    });
  }
}
