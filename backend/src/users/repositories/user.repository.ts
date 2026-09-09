import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const userPublicSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  status: true,
  phoneVerifiedAt: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      select: userPublicSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: userPublicSelect,
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;

    return this.prisma.user.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: userPublicSelect,
    });
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

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: userPublicSelect,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
  }

  async updateRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: userPublicSelect,
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: userPublicSelect,
    });
  }
}
