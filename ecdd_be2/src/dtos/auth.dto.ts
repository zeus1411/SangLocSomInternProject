import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @IsOptional()
  fullname?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;
}

/**
 * DTO để cập nhật thông tin User Profile
 * Áp dụng 3 trường hợp JWT:
 * - Token hết hạn: Bắt login lại
 * - Token hợp lệ: Lấy updatedby từ token
 * - Không có token: Lấy IP address
 */
export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullname?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}