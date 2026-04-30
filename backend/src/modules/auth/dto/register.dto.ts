import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(120)
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;
}
