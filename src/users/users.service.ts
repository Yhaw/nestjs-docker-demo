import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto'; // Node built-in UUID generator

// In-memory user model (will later map to PostgreSQL table)
export interface User {
  id: string; // UUID
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin' | 'org_admin'; // could expand later
  organizationId: string; // also a UUID
  isActive: boolean;
  createdAt: string;
  refreshToken?: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  // ✅ Create new user
  async createUser(email: string, username: string, password: string, role: 'user' | 'admin' | 'org_admin' = 'user') {
    // check for existing email
    const existing = this.users.find((u) => u.email === email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user: User = {
      id: randomUUID(),
      email,
      username,
      password: hashed,
      role,
      organizationId: randomUUID(), // temporary — later this will come from the org record
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.users.push(user);
    return { id: user.id, email: user.email, username: user.username, role: user.role, organizationId: user.organizationId };
  }

  // ✅ Find user by email
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  // ✅ Validate login credentials
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, email: user.email, username: user.username, role: user.role, organizationId: user.organizationId };
    }
    return null;
  }

  // ✅ (Optional) For later role checks
  async findById(userId: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === userId);
  }

  async setRefreshToken(userId: string, refreshToken?: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.refreshToken = refreshToken;
    }
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken) return null;
    if (user.refreshToken === refreshToken) {
      return user;
    }
    return null;
  }

  // Admin methods
  async getAllUsers(): Promise<Pick<User, 'id' | 'email' | 'username' | 'role' | 'organizationId' | 'isActive' | 'createdAt'>[]> {
    return this.users.map(({ password, refreshToken, ...rest }) => rest);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'org_admin'): Promise<Pick<User, 'id' | 'email' | 'username' | 'role' | 'organizationId' | 'isActive' | 'createdAt'> | null> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;
    user.role = role;
    const { password, refreshToken, ...rest } = user;
    return rest;
  }
}
