import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'arnold@example.com',
    description: 'Email used during registration',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'superSecret123',
    description: 'Password of the user account',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
