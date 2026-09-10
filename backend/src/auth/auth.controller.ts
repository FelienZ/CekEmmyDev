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
import type { Request, Response as ExpressResponse } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { fromNodeHeaders } from './utils/headers.util';
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
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const headers = fromNodeHeaders(req.headers);
    const webResponse = await this.authService.login(dto, headers);
    return await forwardWebResponse(webResponse, res);
  }

  @Post('auth/set-password')
  @UseGuards(AuthGuard)
  @AllowPendingActivation()
  async setPassword(
    @Body() dto: SetPasswordDto,
    @Req() req: Request,
    @CurrentUser() user: UserResponseDto,
  ) {
    const headers = fromNodeHeaders(req.headers);
    return await this.authService.setPassword(dto, headers, user.id);
  }

  @Post('auth/register/phone')
  async registerPhone(@Body() dto: RegisterPhoneDto) {
    return await this.authService.registerPhone(dto);
  }

  @Post('auth/verify/phone')
  async verifyPhoneOtp(
    @Body() dto: VerifyPhoneOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const headers = fromNodeHeaders(req.headers);
    const webResponse = await this.authService.verifyPhoneOtp(dto, headers);
    return await forwardWebResponse(webResponse, res);
  }

  @Post('auth/register/email')
  async registerEmail(@Body() dto: RegisterEmailDto) {
    return await this.authService.registerEmail(dto);
  }

  @Post('auth/verify/email')
  async verifyEmailOtp(
    @Body() dto: VerifyEmailOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const headers = fromNodeHeaders(req.headers);
    const webResponse = await this.authService.verifyEmailOtp(dto, headers);
    return await forwardWebResponse(webResponse, res);
  }

  @Get('auth/me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: UserResponseDto) {
    return { user };
  }

  @Post('auth/logout')
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
  async handleBetterAuthNative(
    @Req() req: Request,
    @Res() res: ExpressResponse,
  ) {
    return this.nodeHandler(req, res);
  }
}
