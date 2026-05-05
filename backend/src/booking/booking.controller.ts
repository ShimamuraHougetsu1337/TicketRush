import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { LockSeatsDto, ConfirmBookingDto } from './dto/lock-seats.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /** GET /api/booking/events/:eventId/seats */
  @Get('events/:eventId/seats')
  getSeats(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.bookingService.getSeatsForEvent(eventId);
  }

  /** POST /api/booking/lock */
  @UseGuards(JwtAuthGuard)
  @Post('lock')
  lockSeats(@Body() dto: LockSeatsDto, @CurrentUser() user: { id: number, role: string }) {
    return this.bookingService.lockSeats(user.id, dto.eventId, dto.seatIds);
  }

  /** POST /api/booking/confirm */
  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  confirmBooking(@Body() dto: ConfirmBookingDto, @CurrentUser() user: { id: number, role: string }) {
    return this.bookingService.confirmBooking(user.id, dto.eventId, dto.seatIds);
  }

  /** POST /api/booking/release */
  @UseGuards(JwtAuthGuard)
  @Post('release')
  releaseSeats(@Body() dto: LockSeatsDto, @CurrentUser() user: { id: number, role: string }) {
    return this.bookingService.releaseSeats(user.id, dto.eventId, dto.seatIds);
  }

  /** GET /api/booking/admin/analytics/:eventId */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/analytics/:eventId')
  getEventAnalytics(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.bookingService.getEventAnalytics(eventId);
  }

  /** GET /api/booking/admin/analytics */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/analytics')
  getAllAnalytics() {
    return this.bookingService.getAllEventsAnalytics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tickets')
  getMyTickets(@CurrentUser() user: { id: number, role: string }) {
    return this.bookingService.getUserTickets(user.id);
  }

  /** GET /api/booking/my-locks */
  @UseGuards(JwtAuthGuard)
  @Get('my-locks')
  getMyLocks(@CurrentUser() user: { id: number, role: string }) {
    return this.bookingService.getUserLocks(user.id);
  }

  /** GET /api/booking/admin/orders */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/orders')
  getAllOrders() {
    return this.bookingService.getAllOrders();
  }

  /** GET /api/booking/admin/tickets */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/tickets')
  getSoldTickets() {
    return this.bookingService.getSoldTickets();
  }
}
