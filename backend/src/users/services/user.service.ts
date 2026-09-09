import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { normalizeEmail, normalizePhoneNumber } from '@/helper/phone.helper';
import { handlePrismaError } from '@/helper/prisma-error.helper';
import {
  createPaginatedResponse,
  normalizePagination,
  PaginatedResponse,
} from '@/helper/pagination.dto';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

export type UserActor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createCustomerProvisioning(
    dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const normalizedPhone = normalizePhoneNumber(dto.phone);
    const normalizedEmail = normalizeEmail(dto.email);

    if (!normalizedPhone && !normalizedEmail) {
      throw new BadRequestException(
        'Minimal salah satu dari nomor telepon atau email harus diisi',
      );
    }

    const createData: Prisma.UserCreateInput = {
      name: dto.name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      role: UserRole.CUSTOMER,
      status: UserStatus.PENDING_ACTIVATION,
    };

    try {
      return await this.userRepository.create(createData);
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'User',
        conflictMessage: 'Nomor telepon atau email sudah digunakan',
      });
    }
  }

  async updateProfile(
    id: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    if (dto.phone !== undefined) {
      const normalizedPhone = normalizePhoneNumber(dto.phone);
      if (normalizedPhone !== existingUser.phone) {
        updateData.phone = normalizedPhone;
        updateData.phoneVerifiedAt = null;
      }
    }

    if (dto.email !== undefined) {
      const normalizedEmail = normalizeEmail(dto.email);
      if (normalizedEmail !== existingUser.email) {
        updateData.email = normalizedEmail;
        updateData.emailVerifiedAt = null;
      }
    }

    try {
      return await this.userRepository.update(id, updateData);
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'User',
        conflictMessage: 'Nomor telepon atau email sudah digunakan',
      });
    }
  }

  async updateUserRole(
    id: string,
    dto: UpdateUserRoleDto,
    actor?: UserActor,
  ): Promise<UserResponseDto> {
    if (!actor) {
      throw new ForbiddenException(
        'Akses ditolak: identitas pengguna diperlukan',
      );
    }

    if (actor.role !== UserRole.OWNER) {
      throw new ForbiddenException('Hanya Owner yang berhak mengubah role');
    }

    const targetUser = await this.userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (dto.role === UserRole.OWNER && targetUser.role !== UserRole.OWNER) {
      const activeOwnerCount = await this.userRepository.countActiveOwners();
      if (activeOwnerCount >= 1) {
        throw new ConflictException('Sistem sudah memiliki satu Owner aktif');
      }
    }

    if (
      targetUser.role === UserRole.OWNER &&
      targetUser.status === UserStatus.ACTIVE &&
      dto.role !== UserRole.OWNER
    ) {
      const activeOwnerCount = await this.userRepository.countActiveOwners();
      if (activeOwnerCount <= 1) {
        throw new BadRequestException(
          'Tidak dapat mengubah role Owner aktif terakhir',
        );
      }
    }

    return await this.userRepository.updateRole(id, dto.role);
  }

  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    actor?: UserActor,
  ): Promise<UserResponseDto> {
    if (!actor) {
      throw new ForbiddenException(
        'Akses ditolak: identitas pengguna diperlukan',
      );
    }

    const targetUser = await this.userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (actor.role === UserRole.ADMIN) {
      if (
        targetUser.role === UserRole.ADMIN ||
        targetUser.role === UserRole.OWNER
      ) {
        throw new ForbiddenException(
          'Admin tidak berwenang mengelola status Admin atau Owner',
        );
      }
    } else if (actor.role !== UserRole.OWNER) {
      throw new ForbiddenException('Akses ditolak: wewenang tidak mencukupi');
    }

    if (
      targetUser.status === UserStatus.PENDING_ACTIVATION &&
      dto.status === UserStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Aktivasi akun harus melalui proses Auth verification',
      );
    }

    if (
      targetUser.role === UserRole.OWNER &&
      targetUser.status === UserStatus.ACTIVE &&
      dto.status === UserStatus.INACTIVE
    ) {
      const activeOwnerCount = await this.userRepository.countActiveOwners();
      if (activeOwnerCount <= 1) {
        throw new BadRequestException(
          'Owner aktif terakhir tidak dapat dinonaktifkan',
        );
      }
    }

    return await this.userRepository.updateStatus(id, dto.status);
  }

  async findAll(
    query?: QueryUserDto,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const { page, limit, skip } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.userRepository.findMany({
        skip,
        take: limit,
        role: query?.role,
        status: query?.status,
      }),
      this.userRepository.count({
        role: query?.role,
        status: query?.status,
      }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return user;
  }
}
