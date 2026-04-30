import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateZoneDto } from './dto/zone.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // ================= EVENT CRUD =================

  async createEvent(data: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        status: data.status || 'UPCOMING',
      },
    });
  }

  async getAllEvents() {
    return this.prisma.event.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async getEventById(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { zones: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateEvent(id: number, data: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
      },
    });
  }

  async deleteEvent(id: number) {
    // Note: Due to foreign keys, you must delete seats, orders, zones first or use cascade delete
    // For now, we will delete seats, then zones, then the event in a transaction
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.seat.deleteMany({ where: { eventId: id } });
      await tx.zone.deleteMany({ where: { eventId: id } });
      await tx.order.deleteMany({ where: { eventId: id } });
      return tx.event.delete({ where: { id } });
    });
  }

  // ================= ZONE & SEAT GENERATION =================

  private getRowName(index: number): string {
    // Generate A, B, C... Z, AA, AB...
    let rowName = '';
    let temp = index;
    while (temp >= 0) {
      rowName = String.fromCharCode((temp % 26) + 65) + rowName;
      temp = Math.floor(temp / 26) - 1;
    }
    return rowName;
  }

  async createZoneWithSeats(eventId: number, data: CreateZoneDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create the Zone
      const zone = await tx.zone.create({
        data: {
          eventId,
          name: data.name,
          price: data.price,
          totalRows: data.totalRows,
          seatsPerRow: data.seatsPerRow,
        },
      });

      // 2. Generate Seats Matrix
      const seats: Prisma.SeatCreateManyInput[] = [];
      for (let r = 0; r < data.totalRows; r++) {
        const rowName = this.getRowName(r);
        for (let s = 1; s <= data.seatsPerRow; s++) {
          seats.push({
            eventId,
            zoneId: zone.id,
            rowName,
            seatNumber: s,
            status: 'AVAILABLE',
          });
        }
      }

      // 3. Bulk insert seats
      await tx.seat.createMany({ data: seats });

      return zone;
    });
  }

  async getZonesForEvent(eventId: number) {
    return this.prisma.zone.findMany({ where: { eventId } });
  }
}
