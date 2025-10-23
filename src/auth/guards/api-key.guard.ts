import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly API_KEY = 'your-secret-api-key'; // Move this to environment variables in production

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.header('X-API-KEY');

    if (!apiKey || apiKey !== this.API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}