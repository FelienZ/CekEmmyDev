import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.OWNER]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.CUSTOMER]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: UserResponseDto }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Akses ditolak: role tidak ditemukan');
    }

    const userRank = ROLE_RANK[user.role] ?? 0;
    const isAuthorized = requiredRoles.some(
      (role) => user.role === role || userRank >= (ROLE_RANK[role] ?? 0),
    );

    if (!isAuthorized) {
      throw new ForbiddenException('Akses ditolak: wewenang tidak mencukupi');
    }

    return true;
  }
}
