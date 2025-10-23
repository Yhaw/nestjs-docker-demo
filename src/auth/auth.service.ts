import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(
        { ...payload, tokenId: randomUUID() },
        { expiresIn: '7d' },
      ),
    };
  }

  // ✅ REGISTER
  async register(email: string, username: string, password: string) {
    // check if user already exists
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    // create user
    const newUser = await this.usersService.createUser(email, username, password);

    // build JWT payload
    const tokens = this.generateTokens(newUser);
    await this.usersService.setRefreshToken(newUser.id, tokens.refresh_token);

    return {
      message: 'Registration successful',
      ...tokens,
      user: newUser,
    };
  }

  // ✅ LOGIN
  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, decoded.sub);
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      await this.usersService.setRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
