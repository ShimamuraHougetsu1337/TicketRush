import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  totalRows!: number;

  @IsNumber()
  @Min(1)
  seatsPerRow!: number;
}
