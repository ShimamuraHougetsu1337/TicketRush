import { Module } from '@nestjs/common';
import { SeatTimeoutCron } from './seat-timeout.cron';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  providers: [SeatTimeoutCron],
})
export class CronModule {}
