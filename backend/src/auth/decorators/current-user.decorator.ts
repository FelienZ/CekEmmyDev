import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { AuthenticatedUserRequest } from '../guards/auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserResponseDto | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedUserRequest>();
    return request.user;
  },
);
