import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateZoneDto } from './dto/zone.dto';
import { Prisma, EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  private getRowName(index: number): string {
    let rowName = '';
    let temp = index;
    while (temp >= 0) {
      rowName = String.fromCharCode((temp % 26) + 65) + rowName;
      temp = Math.floor(temp / 26) - 1;
    }
    return rowName;
  }

  async createEvent(dto: CreateEventDto) {
    const { zones, ...eventData } = dto;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Event
      const event = await tx.event.create({
        data: {
          title: eventData.title,
          startTime: new Date(eventData.startTime),
          status: eventData.status || EventStatus.UPCOMING,
        },
      });

      // 2. Create Zones and Generate Seats
      for (const zoneDto of zones) {
        const zone = await tx.zone.create({
          data: {
            eventId: event.id,
            name: zoneDto.name,
            price: zoneDto.price,
            totalRows: zoneDto.totalRows,
            seatsPerRow: zoneDto.seatsPerRow,
          },
        });

        const seats: Prisma.SeatCreateManyInput[] = [];
        for (let r = 0; r < zoneDto.totalRows; r++) {
          const rowName = this.getRowName(r);
          for (let s = 1; s <= zoneDto.seatsPerRow; s++) {
            seats.push({
              eventId: event.id,
              zoneId: zone.id,
              rowName,
              seatNumber: s,
              status: 'AVAILABLE',
            });
          }
        }

        // Bulk insert seats for the zone
        await tx.seat.createMany({ data: seats });
      }

      // 3. Return the created event with zones using the transaction client
      return tx.event.findUnique({
        where: { id: event.id },
        include: { zones: true },
      });
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
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.seat.deleteMany({ where: { eventId: id } });
      await tx.zone.deleteMany({ where: { eventId: id } });
      await tx.order.deleteMany({ where: { eventId: id } });
      return tx.event.delete({ where: { id } });
    });
  }

  async createZoneWithSeats(eventId: number, data: CreateZoneDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const zone = await tx.zone.create({
        data: {
          eventId,
          name: data.name,
          price: data.price,
          totalRows: data.totalRows,
          seatsPerRow: data.seatsPerRow,
        },
      });

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

      await tx.seat.createMany({ data: seats });
      return zone;
    });
  }

  async getZonesForEvent(eventId: number) {
    return this.prisma.zone.findMany({ where: { eventId } });
  }
}
