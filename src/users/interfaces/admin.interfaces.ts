import { User } from '../users.service';

export type AdminUserResponse = Omit<User, 'password' | 'refreshToken'>;

export interface UpdateUserRoleResponse {
  success: boolean;
  message?: string;
  user?: AdminUserResponse;
}

export interface DeleteUserResponse {
  success: boolean;
}