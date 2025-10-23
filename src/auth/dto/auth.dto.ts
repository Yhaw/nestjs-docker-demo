import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @ApiProperty({
    example: 'arnold@example.com',
    description: 'Valid email address of the user',
    required: true,
  })
  @IsEmail({}, { message: 'Email must be a valid address' })
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
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
