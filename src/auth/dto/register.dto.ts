import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 8 characters)',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username (optional)',
    required: false,
    minLength: 3
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;
}
