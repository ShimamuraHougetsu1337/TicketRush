import { Module, forwardRef } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SeatsGateway } from './seats.gateway';
import { DashboardGateway } from './dashboard.gateway';

@Module({
  controllers: [BookingController],
  providers: [BookingService, SeatsGateway, DashboardGateway],
  exports: [BookingService, SeatsGateway, DashboardGateway],
})
export class BookingModule {}
