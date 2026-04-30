import { Module } from '@nestjs/common';
import { SeatTimeoutCron } from './seat-timeout.cron';
import { EventStatusCron } from './event-status.cron';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  providers: [SeatTimeoutCron, EventStatusCron],
})
export class CronModule {}
