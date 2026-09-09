import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  name!: string;
  phone!: string | null;
  email!: string | null;
  role!: UserRole;
  status!: UserStatus;
  phoneVerifiedAt!: Date | null;
  emailVerifiedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
