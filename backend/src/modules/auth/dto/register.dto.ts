import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber, IsOptional, Min, Max, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName!: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @IsOptional()
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age cannot exceed 120' })
  age?: number;

  @IsString()
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender must be MALE, FEMALE, or OTHER' })
  gender?: string;
}
