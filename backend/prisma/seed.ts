import { PrismaClient, Role, EventStatus, SeatStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing data
  await prisma.seat.deleteMany();
  await prisma.order.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123', 10);

  // 2. Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@ticketrush.io',
      password: passwordHash,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      gender: 'MALE',
      age: 30,
    },
  });

  // 3. Create Sample Customers (for Demographics)
  const customersData = [
    { email: 'user@ticketrush.io', gender: 'MALE', age: 22, name: 'John Doe' },
    { email: 'alice@example.com', gender: 'FEMALE', age: 19, name: 'Alice Smith' },
    { email: 'bob@example.com', gender: 'MALE', age: 28, name: 'Bob Wilson' },
    { email: 'carol@example.com', gender: 'FEMALE', age: 35, name: 'Carol Danvers' },
    { email: 'dave@example.com', gender: 'MALE', age: 45, name: 'Dave Miller' },
    { email: 'emma@example.com', gender: 'FEMALE', age: 24, name: 'Emma Watson' },
    { email: 'frank@example.com', gender: 'MALE', age: 17, name: 'Frank Castle' },
    { email: 'grace@example.com', gender: 'FEMALE', age: 31, name: 'Grace Hopper' },
  ];

  const customers = await Promise.all(
    customersData.map((c) =>
      prisma.user.create({
        data: {
          email: c.email,
          password: passwordHash,
          fullName: c.name,
          role: Role.CUSTOMER,
          gender: c.gender,
          age: c.age,
        },
      })
    )
  );

  // 4. Create Sample Event
  const event = await prisma.event.create({
    data: {
      title: 'Grand Symphony 2026',
      startTime: new Date('2026-06-15T19:00:00Z'),
      status: EventStatus.ONGOING,
    },
  });

  // 5. Create Zones and Seats
  const zonesData = [
    { name: 'VIP', price: 250, rows: 4, cols: 8 },
    { name: 'Standard', price: 120, rows: 8, cols: 12 },
  ];

  for (const z of zonesData) {
    const zone = await prisma.zone.create({
      data: {
        eventId: event.id,
        name: z.name,
        price: z.price,
        totalRows: z.rows,
        seatsPerRow: z.cols,
      },
    });

    const seatsToCreate = [];
    for (let r = 0; r < z.rows; r++) {
      const rowName = String.fromCharCode(65 + r);
      for (let s = 1; s <= z.cols; s++) {
        seatsToCreate.push({
          eventId: event.id,
          zoneId: zone.id,
          rowName,
          seatNumber: s,
          status: SeatStatus.AVAILABLE,
        });
      }
    }
    await prisma.seat.createMany({ data: seatsToCreate });
  }

  // 6. Create some Sample Orders for Analytics
  const allSeats = await prisma.seat.findMany({ where: { eventId: event.id } });
  
  // Mix some orders
  for (let i = 0; i < customers.length; i++) {
    const user = customers[i];
    const seat = allSeats[i * 2]; // Assign some seats
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        eventId: event.id,
        totalAmount: 150, // Simplified
      },
    });

    await prisma.seat.update({
      where: { id: seat.id },
      data: {
        status: SeatStatus.SOLD,
        orderId: order.id,
        ticketCode: `TKT-SEED-${event.id}-${seat.id}`,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
