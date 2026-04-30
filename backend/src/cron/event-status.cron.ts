import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventStatusCron {
  private readonly logger = new Logger(EventStatusCron.name);
  private readonly EVENT_DURATION_HOURS = 4; // Giả định mỗi sự kiện kéo dài 4 tiếng

  constructor(private readonly prisma: PrismaService) {}

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

    // 2. Tự động chuyển từ ONGOING sang ENDED
    const finishCutoff = new Date(now.getTime() - this.EVENT_DURATION_HOURS * 60 * 60 * 1000);
    const ongoingToEnded = await this.prisma.event.updateMany({
      where: {
        status: EventStatus.ONGOING,
        startTime: { lte: finishCutoff },
      },
      data: {
        status: EventStatus.ENDED,
      },
    });

    if (ongoingToEnded.count > 0) {
      this.logger.warn(`Auto-ended ${ongoingToEnded.count} events (ONGOING -> ENDED)`);
    }
  }
}
