import {
  All,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response as ExpressResponse } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { fromNodeHeaders } from './utils/headers.util';
import { getClientIp } from './utils/client-ip.util';
import { RateLimitException } from './services/auth-rate-limiter.service';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { AUTH_INSTANCE } from './auth.constants';
import type { BetterAuthInstance } from './auth.config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RegisterPhoneDto } from './dto/register-phone.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { AuthGuard } from './guards/auth.guard';
import { AllowPendingActivation } from './decorators/allow-pending.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

async function forwardWebResponse(
  webRes: Response,
  expressRes: ExpressResponse,
): Promise<unknown> {
  const getSetCookie = (
    webRes.headers as unknown as { getSetCookie?: () => string[] }
  ).getSetCookie;
  const cookies: string[] =
    typeof getSetCookie === 'function'
      ? (getSetCookie.call(webRes.headers) as string[])
      : [];

  if (cookies.length > 0) {
    expressRes.setHeader('Set-Cookie', cookies);
  } else {
    const singleCookie = webRes.headers.get('set-cookie');
    if (singleCookie) {
      expressRes.setHeader('Set-Cookie', singleCookie);
    }
  }

  const data: unknown = await webRes.json().catch(() => ({}));
  return data;
}

@ApiTags('Auth')
@Controller()
export class AuthController {
  private nodeHandler: (req: Request, res: ExpressResponse) => Promise<void>;

  constructor(
    @Inject(AUTH_INSTANCE) private auth: BetterAuthInstance,
    private authService: AuthService,
  ) {
    this.nodeHandler = toNodeHandler(this.auth);
  }

  @Post('auth/login')
  @ApiOperation({
    summary: 'Login dengan identifier (email/telepon) dan password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, cookie sesi diterbitkan',
  })
  @ApiResponse({ status: 401, description: 'Kredensial login tidak valid' })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak permintaan (Rate limit)',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const clientIp = getClientIp(req);
    const headers = fromNodeHeaders(req.headers);
    try {
      const webResponse = await this.authService.login(dto, headers, clientIp);
      return await forwardWebResponse(webResponse, res);
    } catch (err: unknown) {
      if (err instanceof RateLimitException) {
        res.setHeader('Retry-After', String(err.retryAfter));
      }
      throw err;
    }
  }

  @Post('auth/set-password')
  @UseGuards(AuthGuard)
  @AllowPendingActivation()
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Setel password pertama kali atau perbarui password pengguna',
  })
  @ApiResponse({ status: 200, description: 'Password berhasil disetel' })
  @ApiResponse({ status: 401, description: 'Tidak terotentikasi' })
  async setPassword(
    @Body() dto: SetPasswordDto,
    @Req() req: Request,
    @CurrentUser() user: UserResponseDto,
  ) {
    const headers = fromNodeHeaders(req.headers);
    return await this.authService.setPassword(dto, headers, user.id);
  }

  @Post('auth/register/phone')
  @ApiOperation({ summary: 'Registrasi atau minta kode OTP ke nomor telepon' })
  @ApiResponse({ status: 200, description: 'Kode OTP berhasil dikirim' })
  @ApiResponse({ status: 400, description: 'Format nomor telepon tidak valid' })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak permintaan (Rate limit)',
  })
  async registerPhone(
    @Body() dto: RegisterPhoneDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const clientIp = getClientIp(req);
    try {
      return await this.authService.registerPhone(dto, clientIp);
    } catch (err: unknown) {
      if (err instanceof RateLimitException) {
        res.setHeader('Retry-After', String(err.retryAfter));
      }
      throw err;
    }
  }

  @Post('auth/verify/phone')
  @ApiOperation({ summary: 'Verifikasi kode OTP nomor telepon' })
  @ApiResponse({ status: 200, description: 'Verifikasi berhasil' })
  @ApiResponse({ status: 400, description: 'Kode OTP salah atau kedaluwarsa' })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak permintaan (Rate limit)',
  })
  async verifyPhoneOtp(
    @Body() dto: VerifyPhoneOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const clientIp = getClientIp(req);
    const headers = fromNodeHeaders(req.headers);
    try {
      const webResponse = await this.authService.verifyPhoneOtp(
        dto,
        headers,
        clientIp,
      );
      return await forwardWebResponse(webResponse, res);
    } catch (err: unknown) {
      if (err instanceof RateLimitException) {
        res.setHeader('Retry-After', String(err.retryAfter));
      }
      throw err;
    }
  }

  @Post('auth/register/email')
  @ApiOperation({ summary: 'Registrasi atau minta kode OTP ke alamat email' })
  @ApiResponse({ status: 200, description: 'Kode OTP email berhasil dikirim' })
  @ApiResponse({ status: 400, description: 'Format email tidak valid' })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak permintaan (Rate limit)',
  })
  async registerEmail(
    @Body() dto: RegisterEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const clientIp = getClientIp(req);
    try {
      return await this.authService.registerEmail(dto, clientIp);
    } catch (err: unknown) {
      if (err instanceof RateLimitException) {
        res.setHeader('Retry-After', String(err.retryAfter));
      }
      throw err;
    }
  }

  @Post('auth/verify/email')
  @ApiOperation({ summary: 'Verifikasi kode OTP email' })
  @ApiResponse({ status: 200, description: 'Verifikasi email berhasil' })
  @ApiResponse({ status: 400, description: 'Kode OTP salah atau kedaluwarsa' })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak permintaan (Rate limit)',
  })
  async verifyEmailOtp(
    @Body() dto: VerifyEmailOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const clientIp = getClientIp(req);
    const headers = fromNodeHeaders(req.headers);
    try {
      const webResponse = await this.authService.verifyEmailOtp(
        dto,
        headers,
        clientIp,
      );
      return await forwardWebResponse(webResponse, res);
    } catch (err: unknown) {
      if (err instanceof RateLimitException) {
        res.setHeader('Retry-After', String(err.retryAfter));
      }
      throw err;
    }
  }

  @Get('auth/me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Ambil profil pengguna yang sedang login' })
  @ApiResponse({ status: 200, description: 'Data pengguna aktif' })
  @ApiResponse({ status: 401, description: 'Tidak terotentikasi' })
  getMe(@CurrentUser() user: UserResponseDto) {
    return { user };
  }

  @Post('auth/logout')
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Logout sesi pengguna' })
  @ApiResponse({ status: 200, description: 'Berhasil logout' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const headers = fromNodeHeaders(req.headers);
    const webResponse = await this.authService.signOut(headers);
    await forwardWebResponse(webResponse, res);
    return { message: 'Berhasil logout' };
  }

  @All('api/auth/*')
  @ApiExcludeEndpoint()
  async handleBetterAuthNative(
    @Req() req: Request,
    @Res() res: ExpressResponse,
  ) {
    const rawPath = (req.originalUrl || req.url || req.path)
      .split('?')[0]
      .toLowerCase();
    const blockedNativePrefixes = [
      '/api/auth/sign-up',
      '/api/auth/sign-in',
      '/api/auth/set-password',
      '/api/auth/phone-number/send-otp',
      '/api/auth/email-otp/send-verification-otp',
      '/api/auth/phone-number/verify',
      '/api/auth/email-otp/verify-email',
    ];

    const isBlocked = blockedNativePrefixes.some((prefix) =>
      rawPath.startsWith(prefix),
    );

    if (isBlocked) {
      return res.status(403).json({
        statusCode: 403,
        error: 'Forbidden',
        message:
          'Akses langsung ke endpoint native ini ditolak. Gunakan endpoint resmi /auth FinPro',
      });
    }

    return this.nodeHandler(req, res);
  }
}
