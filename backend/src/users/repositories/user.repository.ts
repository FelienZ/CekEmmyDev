import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

export const userPublicSelect = {
  id: true,
  name: true,
  phoneNumber: true,
  email: true,
  role: true,
  status: true,
  phoneVerifiedAt: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type RawUserRecord = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;

export function mapUserToResponse(user: RawUserRecord): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    phone: user.phoneNumber,
    email: user.email,
    role: user.role,
    status: user.status,
    phoneVerifiedAt: user.phoneVerifiedAt,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
    return user ? mapUserToResponse(user) : null;
  }

  async findByPhoneNumber(
    phoneNumber: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      select: userPublicSelect,
    });
    return user ? mapUserToResponse(user) : null;
  }

  async findByPhone(phone: string): Promise<UserResponseDto | null> {
    return this.findByPhoneNumber(phone);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: userPublicSelect,
    });
    return user ? mapUserToResponse(user) : null;
  }

  async findMany(params: {
    skip: number;
    take: number;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<UserResponseDto[]> {
    const where: Prisma.UserWhereInput = {};
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;

    const users = await this.prisma.user.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: userPublicSelect,
    });

    return users.map(mapUserToResponse);
  }

  async count(params?: {
    role?: UserRole;
    status?: UserStatus;
  }): Promise<number> {
    const where: Prisma.UserWhereInput = {};
    if (params?.role) where.role = params.role;
    if (params?.status) where.status = params.status;

    return this.prisma.user.count({ where });
  }

  async countActiveOwners(): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: UserRole.OWNER,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data,
      select: userPublicSelect,
    });
    return mapUserToResponse(user);
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
    return mapUserToResponse(user);
  }

  async updateRole(id: string, role: UserRole): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: userPublicSelect,
    });
    return mapUserToResponse(user);
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: userPublicSelect,
    });
    return mapUserToResponse(user);
  }
}
