import { UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Role tidak valid' })
  @IsNotEmpty({ message: 'Role tidak boleh kosong' })
  role!: UserRole;
}
