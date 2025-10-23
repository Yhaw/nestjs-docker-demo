import { Controller, Get, Delete, Patch, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { AdminUserResponse, UpdateUserRoleResponse, DeleteUserResponse } from './interfaces/admin.interfaces';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard, ApiKeyGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'X-API-KEY',
  description: 'API key for admin endpoints',
})
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          username: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin', 'org_admin'] },
          organizationId: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string' }
        }
      }
    }
  })
  async getAllUsers(): Promise<AdminUserResponse[]> {
    return this.usersService.getAllUsers();
  }

  @Delete(':id')
  @Roles('admin')
  @ApiResponse({
    status: 200,
    description: 'User deletion status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  })
  async deleteUser(@Param('id') id: string): Promise<DeleteUserResponse> {
    const success = await this.usersService.deleteUser(id);
    return { success };
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiResponse({
    status: 200,
    description: 'User role update status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string', nullable: true },
        user: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin', 'org_admin'] },
            organizationId: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' }
          }
        }
      }
    }
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: 'user' | 'admin' | 'org_admin',
  ): Promise<UpdateUserRoleResponse> {
    const user = await this.usersService.updateUserRole(id, role);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return { success: true, user };
  }
}