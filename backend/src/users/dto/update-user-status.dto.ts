import { UserStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Status tidak valid' })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status!: UserStatus;
}
