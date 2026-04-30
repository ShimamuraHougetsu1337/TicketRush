import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SeatsGateway } from './seats.gateway';

@Module({
  controllers: [BookingController],
  providers: [BookingService, SeatsGateway],
  exports: [BookingService, SeatsGateway],
})
export class BookingModule {}
