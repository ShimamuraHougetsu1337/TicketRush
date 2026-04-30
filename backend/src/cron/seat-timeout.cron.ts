import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SeatsGateway } from '../booking/seats.gateway';

/* ──────────────────────────────────────────────────────────────
   SeatTimeoutCron
   Runs every 60 s — releases any seat that has been LOCKED
   for longer than 10 minutes (configurable via LOCK_TTL_MIN).
   ────────────────────────────────────────────────────────────── */

@Injectable()
export class SeatTimeoutCron {
  private readonly logger = new Logger(SeatTimeoutCron.name);
  private readonly LOCK_TTL_MINUTES = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly seatsGateway: SeatsGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredLocks() {
    const cutoff = new Date(Date.now() - this.LOCK_TTL_MINUTES * 60_000);

    // 1) Find expired locked seats
    const expiredSeats = await this.prisma.seat.findMany({
      where: {
        status: 'LOCKED',
        lockedAt: { lt: cutoff },
      },
      select: { id: true, eventId: true },
    }) as { id: number; eventId: number }[];

    if (expiredSeats.length === 0) return;

    const expiredIds = expiredSeats.map((s) => s.id);

    // 2) Bulk-release them
    const result = await this.prisma.seat.updateMany({
      where: { id: { in: expiredIds }, status: 'LOCKED' },
      data: {
        status: 'AVAILABLE',
        lockedById: null,
        lockedAt: null,
      },
    });

    this.logger.warn(
      `Released ${result.count} expired locks (IDs: ${expiredIds.join(', ')})`,
    );

    // 3) Broadcast to each affected event room
    const groupedByEvent = expiredSeats.reduce(
      (acc: Record<number, number[]>, s) => {
        (acc[s.eventId] ??= []).push(s.id);
        return acc;
      },
      {} as Record<number, number[]>,
    );

    for (const [eventId, seatIds] of Object.entries(groupedByEvent) as [string, number[]][]) {
      this.seatsGateway.broadcastSeatUpdate(
        Number(eventId),
        seatIds.map((id) => ({
          id,
          status: 'AVAILABLE',
          lockedById: null,
        })),
      );
    }
  }
}
