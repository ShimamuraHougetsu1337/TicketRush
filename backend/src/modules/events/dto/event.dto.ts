import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  startTime!: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
