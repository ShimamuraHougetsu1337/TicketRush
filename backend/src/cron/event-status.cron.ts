import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventStatusCron {
  private readonly logger = new Logger(EventStatusCron.name);

  constructor(private readonly prisma: PrismaService) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEventStatusUpdates() {
    const now = new Date();

    // 1. Tự động chuyển từ UPCOMING sang ONGOING
    const upcomingToOngoing = await this.prisma.event.updateMany({
      where: {
        status: EventStatus.UPCOMING,
        startTime: { lte: now },
      },
      data: {
        status: EventStatus.ONGOING,
      },
    });

    if (upcomingToOngoing.count > 0) {
      this.logger.log(`Auto-started ${upcomingToOngoing.count} events (UPCOMING -> ONGOING)`);
    }
  }
}
