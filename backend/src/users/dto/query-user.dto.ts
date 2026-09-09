import { PaginationQueryDto } from '@/helper/pagination.dto';
import { UserRole, UserStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Filter role tidak valid' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Filter status tidak valid' })
  status?: UserStatus;
}
