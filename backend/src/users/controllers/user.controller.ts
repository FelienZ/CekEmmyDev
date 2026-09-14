import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { ApiPaginatedResponse } from '@/helper/swagger.helper';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiCookieAuth('cookie')
@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Ambil profil pengguna yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil pengguna aktif',
    type: UserResponseDto,
  })
  async getMe(@CurrentUser() user: UserResponseDto) {
    return await this.userService.findById(user.id);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Perbarui data profil pengguna aktif' })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diperbarui',
    type: UserResponseDto,
  })
  async updateMe(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return await this.userService.updateProfile(user.id, dto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Daftar semua pengguna (paginated & filterable)' })
  @ApiPaginatedResponse(UserResponseDto, 'Daftar pengguna berhasil diambil')
  async findAll(@Query() query?: QueryUserDto) {
    return await this.userService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Provisioning akun customer baru oleh admin' })
  @ApiResponse({
    status: 201,
    description: 'Customer provisioning berhasil dibuat',
  })
  async createCustomer(@Body() dto: CreateUserDto) {
    const data = await this.userService.createCustomerProvisioning(dto);
    return {
      message: 'Customer provisioning berhasil dibuat',
      data,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ambil detail pengguna berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail pengguna ditemukan',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pengguna tidak ditemukan' })
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Perbarui profil pengguna berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Profil user berhasil diperbarui',
    type: UserResponseDto,
  })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const data = await this.userService.updateProfile(id, dto);
    return {
      message: 'Profil user berhasil diperbarui',
      data,
    };
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Perbarui role pengguna (khusus OWNER)' })
  @ApiResponse({ status: 200, description: 'Role user berhasil diperbarui' })
  @ApiResponse({ status: 403, description: 'Akses ditolak' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const data = await this.userService.updateUserRole(id, dto, user);
    return {
      message: 'Role user berhasil diperbarui',
      data,
    };
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Perbarui status aktifasi/suspensi pengguna' })
  @ApiResponse({ status: 200, description: 'Status user berhasil diperbarui' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const data = await this.userService.updateUserStatus(id, dto, user);
    return {
      message: 'Status user berhasil diperbarui',
      data,
    };
  }
}
