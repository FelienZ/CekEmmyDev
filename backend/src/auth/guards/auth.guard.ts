import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from '../utils/headers.util';
import { Request } from 'express';
import { UserStatus } from '@prisma/client';
import { UserRepository } from '@/users/repositories/user.repository';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { AUTH_INSTANCE } from '../auth.constants';
import type { BetterAuthInstance } from '../auth.config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_PENDING_KEY } from '../decorators/allow-pending.decorator';

export interface AuthenticatedUserRequest extends Request {
  user?: UserResponseDto;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AUTH_INSTANCE) private auth: BetterAuthInstance,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedUserRequest>();
    const headers = fromNodeHeaders(request.headers);

    const session = await this.auth.api.getSession({ headers });
    if (!session || !session.user) {
      throw new UnauthorizedException('Sesi tidak valid atau telah berakhir');
    }

    // Authoritative fresh user lookup from domain repository
    const freshUser = await this.userRepository.findById(session.user.id);
    if (!freshUser) {
      throw new UnauthorizedException('User tidak ditemukan di sistem');
    }

    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (freshUser.status === UserStatus.PENDING_ACTIVATION) {
      if (!allowPending) {
        throw new ForbiddenException(
          'Akun belum aktif. Selesaikan verifikasi dan pembuatan password',
        );
      }
    } else if (freshUser.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Akun dinonaktifkan. Hubungi administrator');
    }

    request.user = freshUser;
    return true;
  }
}
