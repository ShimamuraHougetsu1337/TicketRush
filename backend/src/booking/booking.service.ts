import {
  Injectable,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeatStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { SeatsGateway } from './seats.gateway';

/* ──────────────────────────────────────────────────────────────
   BookingService – race-condition-safe seat locking & checkout
   Uses MySQL pessimistic locking via SELECT … FOR UPDATE inside
   a raw $transaction to guarantee single-writer semantics.
   ────────────────────────────────────────────────────────────── */

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seatsGateway: SeatsGateway,
  ) { }

  /* ================================================================
     1.  LOCK SEATS  (AVAILABLE ➜ LOCKED)
     ================================================================
     Uses SELECT … FOR UPDATE inside a raw transaction so the row
     is exclusively locked at the DB level.  If two requests hit the
     same seat simultaneously, the second will block on the row lock,
     then see status = LOCKED and the conflict is detected cleanly. */

  async lockSeats(userId: number, eventId: number, seatIds: number[]) {
    const MAX_SEATS_PER_LOCK = 4;

    if (seatIds.length > MAX_SEATS_PER_LOCK) {
      throw new BadRequestException(
        `Cannot lock more than ${MAX_SEATS_PER_LOCK} seats at once`,
      );
    }

    const uniqueIds = [...new Set(seatIds)];
    const placeholders = uniqueIds.map(() => '?').join(',');

    /* ---- begin pessimistic-lock transaction ---- */
    const lockedSeats = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1) Acquire exclusive row locks on the requested seats
        const rows: any[] = await tx.$queryRawUnsafe(
          `SELECT id, status, locked_by
             FROM seats
            WHERE id IN (${placeholders})
              AND event_id = ?
            FOR UPDATE`,
          ...uniqueIds,
          eventId,
        );

        // 2) Validate all seats exist
        if (rows.length !== uniqueIds.length) {
          const foundIds = new Set(rows.map((r) => r.id));
          const missing = uniqueIds.filter((id) => !foundIds.has(id));
          throw new BadRequestException(
            `Seats not found for this event: ${missing.join(', ')}`,
          );
        }

        // 3) Check every seat is AVAILABLE
        const unavailable = rows.filter((r) => r.status !== SeatStatus.AVAILABLE);
        if (unavailable.length > 0) {
          throw new ConflictException({
            message: 'Some seats are no longer available',
            seatIds: unavailable.map((r) => r.id),
          });
        }

        // 4) Atomically mark as LOCKED (still inside FOR UPDATE scope)
        const now = new Date();
        await tx.$executeRawUnsafe(
          `UPDATE seats
              SET status    = 'LOCKED',
                  locked_by = ?,
                  locked_at = ?
            WHERE id IN (${placeholders})
              AND event_id = ?`,
          userId,
          now,
          ...uniqueIds,
          eventId,
        );

        return uniqueIds.map((id) => ({
          id,
          status: SeatStatus.LOCKED,
          lockedById: userId,
          lockedAt: now,
        }));
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    // Broadcast to connected clients
    this.seatsGateway.broadcastSeatUpdate(eventId, lockedSeats);

    this.logger.log(
      `User ${userId} locked seats [${uniqueIds}] for event ${eventId}`,
    );

    return { locked: lockedSeats };
  }

  /* ================================================================
     2.  CONFIRM BOOKING  (LOCKED ➜ SOLD)
     ================================================================ */

  async confirmBooking(userId: number, eventId: number, seatIds: number[]) {
    const uniqueIds = [...new Set(seatIds)];
    const placeholders = uniqueIds.map(() => '?').join(',');

    const order = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1) Lock rows
        const rows: any[] = await tx.$queryRawUnsafe(
          `SELECT s.id, s.status, s.locked_by, z.price
             FROM seats s
             JOIN zones z ON z.id = s.zone_id
            WHERE s.id IN (${placeholders})
              AND s.event_id = ?
            FOR UPDATE`,
          ...uniqueIds,
          eventId,
        );

        if (rows.length !== uniqueIds.length) {
          throw new BadRequestException('Some seats were not found');
        }

        // 2) Ensure all seats are LOCKED *by this user*
        const invalid = rows.filter(
          (r) =>
            r.status !== SeatStatus.LOCKED || Number(r.locked_by) !== userId,
        );
        if (invalid.length > 0) {
          throw new ConflictException({
            message: 'Some seats are not locked by you or no longer available',
            seatIds: invalid.map((r) => r.id),
          });
        }

        // 3) Calculate total
        const totalAmount = rows.reduce(
          (sum, r) => sum + Number(r.price),
          0,
        );

        // 4) Create order via Prisma Client (inside same tx)
        const createdOrder = await tx.order.create({
          data: {
            userId,
            eventId,
            totalAmount,
          },
        });

        // 5) Mark seats as SOLD and attach order + ticket codes
        for (const seatId of uniqueIds) {
          const ticketCode = `TKT-${eventId}-${seatId}-${randomUUID().slice(0, 8).toUpperCase()}`;
          await tx.$executeRawUnsafe(
            `UPDATE seats
                SET status      = 'SOLD',
                    order_id    = ?,
                    ticket_code = ?,
                    locked_by   = NULL,
                    locked_at   = NULL
              WHERE id = ?
                AND event_id = ?`,
            createdOrder.id,
            ticketCode,
            seatId,
            eventId,
          );
        }

        return createdOrder;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      },
    );

    // Broadcast sold status
    const soldSeats = uniqueIds.map((id) => ({
      id,
      status: SeatStatus.SOLD,
      lockedById: null,
      lockedAt: null,
    }));
    this.seatsGateway.broadcastSeatUpdate(eventId, soldSeats);

    this.logger.log(
      `Order #${order.id} confirmed – seats [${uniqueIds}] for event ${eventId}`,
    );

    return {
      orderId: order.id,
      totalAmount: order.totalAmount,
      seats: uniqueIds,
    };
  }

  /* ================================================================
     3.  RELEASE / UNLOCK SEATS  (LOCKED ➜ AVAILABLE)
     ================================================================ */

  async releaseSeats(userId: number, eventId: number, seatIds: number[]) {
    const uniqueIds = [...new Set(seatIds)];
    const placeholders = uniqueIds.map(() => '?').join(',');

    await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const rows: any[] = await tx.$queryRawUnsafe(
          `SELECT id, status, locked_by
             FROM seats
            WHERE id IN (${placeholders})
              AND event_id = ?
            FOR UPDATE`,
          ...uniqueIds,
          eventId,
        );

        const lockedByUser = rows.filter(
          (r) =>
            r.status === SeatStatus.LOCKED && Number(r.locked_by) === userId,
        );

        if (lockedByUser.length === 0) return;

        const releaseIds = lockedByUser.map((r) => r.id);
        const relPlaceholders = releaseIds.map(() => '?').join(',');

        await tx.$executeRawUnsafe(
          `UPDATE seats
              SET status    = 'AVAILABLE',
                  locked_by = NULL,
                  locked_at = NULL
            WHERE id IN (${relPlaceholders})
              AND event_id = ?`,
          ...releaseIds,
          eventId,
        );
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    const releasedSeats = uniqueIds.map((id) => ({
      id,
      status: SeatStatus.AVAILABLE,
      lockedById: null,
      lockedAt: null,
    }));
    this.seatsGateway.broadcastSeatUpdate(eventId, releasedSeats);

    return { released: uniqueIds };
  }

  /* ================================================================
     4.  FETCH SEATS FOR EVENT (for seat-map UI)
     ================================================================ */

  async getSeatsForEvent(eventId: number) {
    return this.prisma.seat.findMany({
      where: { eventId },
      include: { zone: true },
      orderBy: [{ zoneId: 'asc' }, { rowName: 'asc' }, { seatNumber: 'asc' }],
    });
  }

  /* ================================================================
     5.  ADMIN ANALYTICS
     ================================================================ */

  async getEventAnalytics(eventId: number) {
    const [totalSeats, soldSeats, lockedSeats, revenue] = await Promise.all([
      this.prisma.seat.count({ where: { eventId } }),
      this.prisma.seat.count({ where: { eventId, status: SeatStatus.SOLD } }),
      this.prisma.seat.count({ where: { eventId, status: SeatStatus.LOCKED } }),
      this.prisma.order.aggregate({
        where: { eventId },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalSeats,
      soldSeats,
      lockedSeats,
      availableSeats: totalSeats - soldSeats - lockedSeats,
      fillRate: totalSeats > 0 ? ((soldSeats / totalSeats) * 100).toFixed(2) : '0.0',
      totalRevenue: revenue._sum.totalAmount ?? 0,
    };
  }

  async getAllEventsAnalytics() {
    const events = await this.prisma.event.findMany({
      include: {
        _count: { select: { seats: true, orders: true } },
      },
    });

    const analytics = await Promise.all(
      events.map(async (event) => {
        const stats = await this.getEventAnalytics(event.id);
        return { ...event, ...stats };
      }),
    );

    return analytics;
  }

  /* ================================================================
     6.  USER TICKETS
     ================================================================ */

  async getUserTickets(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        event: true,
        seats: {
          include: { zone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserLocks(userId: number) {
    return this.prisma.seat.findMany({
      where: {
        status: SeatStatus.LOCKED,
        lockedById: userId
      },
      include: {
        event: true,
        zone: true
      },
      orderBy: { lockedAt: 'asc' }
    });
  }
}
