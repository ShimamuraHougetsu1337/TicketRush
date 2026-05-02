import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) { }

  async getDemographics() {
    const usersWithOrders = await this.prisma.user.findMany({
      where: { orders: { some: {} } },
      select: { age: true, gender: true },
    });

    const genderStats = { MALE: 0, FEMALE: 0, OTHER: 0, UNKNOWN: 0 };
    const ageBrackets = { 'Under 18': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0, 'Unknown': 0 };

    usersWithOrders.forEach((user) => {
      if (user.gender) {
        const g = user.gender.toUpperCase();
        if (g === 'MALE') genderStats.MALE++;
        else if (g === 'FEMALE') genderStats.FEMALE++;
        else genderStats.OTHER++;
      } else genderStats.UNKNOWN++;

      if (user.age !== null && user.age !== undefined) {
        if (user.age < 18) ageBrackets['Under 18']++;
        else if (user.age <= 24) ageBrackets['18-24']++;
        else if (user.age <= 34) ageBrackets['25-34']++;
        else if (user.age <= 44) ageBrackets['35-44']++;
        else ageBrackets['45+']++;
      } else ageBrackets['Unknown']++;
    });

    return { gender: genderStats, age: ageBrackets };
  }

  async getDetailedEventStats(eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        zones: true,
        seats: { select: { status: true, zoneId: true } }
      }
    });

    if (!event) return null;

    const totalSeats = event.seats.length;
    const soldSeats = event.seats.filter(s => s.status === 'SOLD').length;
    const lockedSeats = event.seats.filter(s => s.status === 'LOCKED').length;
    
    const revenue = await this.prisma.order.aggregate({
      where: { eventId },
      _sum: { totalAmount: true }
    });

    const zoneStats = event.zones.map(zone => {
      const zoneSeats = event.seats.filter(s => s.zoneId === zone.id);
      const zoneSold = zoneSeats.filter(s => s.status === 'SOLD').length;
      return {
        name: zone.name,
        price: zone.price,
        total: zoneSeats.length,
        sold: zoneSold,
        revenue: zoneSold * Number(zone.price)
      };
    });

    // Demographics
    const users = await this.prisma.user.findMany({
      where: { orders: { some: { eventId } } },
      select: { age: true, gender: true }
    });

    const genderStats = { MALE: 0, FEMALE: 0, OTHER: 0, UNKNOWN: 0 };
    const ageBrackets = { 'Under 18': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0, 'Unknown': 0 };

    users.forEach(user => {
      if (user.gender) {
        const g = user.gender.toUpperCase();
        if (g === 'MALE') genderStats.MALE++;
        else if (g === 'FEMALE') genderStats.FEMALE++;
        else genderStats.OTHER++;
      } else genderStats.UNKNOWN++;

      if (user.age !== null && user.age !== undefined) {
        if (user.age < 18) ageBrackets['Under 18']++;
        else if (user.age <= 24) ageBrackets['18-24']++;
        else if (user.age <= 34) ageBrackets['25-34']++;
        else if (user.age <= 44) ageBrackets['35-44']++;
        else ageBrackets['45+']++;
      } else ageBrackets['Unknown']++;
    });

    // Daily Revenue (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyOrders = await this.prisma.order.findMany({
      where: { eventId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' }
    });

    const dailyRevenueMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyRevenueMap.set(dateStr, 0);
    }

    dailyOrders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (dailyRevenueMap.has(dateStr)) {
        dailyRevenueMap.set(dateStr, dailyRevenueMap.get(dateStr) + Number(order.totalAmount));
      }
    });

    const salesOverTime = Array.from(dailyRevenueMap.entries())
      .map(([date, revenue]) => ({ date: date.slice(5), revenue }));

    return {
      event: { id: event.id, title: event.title, startTime: event.startTime, location: event.location },
      summary: {
        totalSeats, soldSeats, lockedSeats,
        availableSeats: totalSeats - soldSeats - lockedSeats,
        fillRate: totalSeats > 0 ? ((soldSeats / totalSeats) * 100).toFixed(2) : '0.0',
        totalRevenue: Number(revenue._sum.totalAmount ?? 0),
      },
      zones: zoneStats,
      salesOverTime,
      demographics: { gender: genderStats, age: ageBrackets }
    };
  }
}
