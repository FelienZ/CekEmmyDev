import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserActor, UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: UserActor;
}

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: UserResponseDto) {
    return await this.userService.findById(user.id);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return await this.userService.updateProfile(user.id, dto);
  }

  @Get()
  async findAll(@Query() query?: QueryUserDto) {
    return await this.userService.findAll(query);
  }

  @Post()
  async createCustomer(@Body() dto: CreateUserDto) {
    const data = await this.userService.createCustomerProvisioning(dto);
    return {
      message: 'Customer provisioning berhasil dibuat',
      data,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Put(':id')
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
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.userService.updateUserRole(id, dto, req.user);
    return {
      message: 'Role user berhasil diperbarui',
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.userService.updateUserStatus(id, dto, req.user);
    return {
      message: 'Status user berhasil diperbarui',
      data,
    };
  }
}
