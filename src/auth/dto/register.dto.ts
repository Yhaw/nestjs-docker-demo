import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'arnold@example.com',
    description: 'User email address',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'ArnoldSylvian',
    description: 'Username chosen by the user',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'superSecret123',
    description: 'Password with at least 6 characters',
    required: true,
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
