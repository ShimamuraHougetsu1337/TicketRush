import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemographics() {
    // Fetch unique users who have placed at least one order
    const usersWithOrders = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {},
        },
      },
      select: {
        age: true,
        gender: true,
      },
    });

    // 1. Gender Statistics
    const genderStats = {
      MALE: 0,
      FEMALE: 0,
      OTHER: 0,
      UNKNOWN: 0,
    };

    // 2. Age Statistics
    const ageBrackets = {
      'Under 18': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45+': 0,
      'Unknown': 0,
    };

    usersWithOrders.forEach((user) => {
      // Gender aggregation
      if (user.gender) {
        const g = user.gender.toUpperCase();
        if (g === 'MALE') genderStats.MALE++;
        else if (g === 'FEMALE') genderStats.FEMALE++;
        else genderStats.OTHER++;
      } else {
        genderStats.UNKNOWN++;
      }

      // Age aggregation
      if (user.age !== null && user.age !== undefined) {
        if (user.age < 18) ageBrackets['Under 18']++;
        else if (user.age <= 24) ageBrackets['18-24']++;
        else if (user.age <= 34) ageBrackets['25-34']++;
        else if (user.age <= 44) ageBrackets['35-44']++;
        else ageBrackets['45+']++;
      } else {
        ageBrackets['Unknown']++;
      }
    });

    return {
      gender: genderStats,
      age: ageBrackets,
    };
  }
}
