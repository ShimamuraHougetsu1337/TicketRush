import { IsInt, IsArray, ArrayMinSize } from 'class-validator';

export class LockSeatsDto {
  @IsInt()
  eventId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds!: number[];
}

export class ConfirmBookingDto {
  @IsInt()
  eventId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds!: number[];
}
