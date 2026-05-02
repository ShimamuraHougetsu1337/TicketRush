import { PrismaClient, Role, EventStatus, SeatStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean up existing data
  await prisma.seat.deleteMany();
  await prisma.order.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: passwordHash,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      gender: 'MALE',
      age: 30,
    },
  });

  // 3. Create Sample Customers (for Demographics)
  const customersData = [
    { email: 'user@gmail.com', gender: 'MALE', age: 22, name: 'John Doe' },
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

  // 4. Create Sample Events
  const eventsData = [
    {
      title: 'Grand Symphony 2026',
      description: 'Experience the world\'s most beautiful classical masterpieces performed by the National Philharmonic Orchestra.\n\nLineup:\n- Beethoven: Symphony No. 9\n- Mozart: Piano Concerto No. 21\n- Tchaikovsky: Swan Lake Suite',
      location: 'Royal Opera House, London',
      bannerUrl: '/banners/sample-banner.png',
      startTime: new Date('2026-06-15T19:00:00Z'),
      status: EventStatus.ONGOING,
      zones: [
        { name: 'VIP Front', price: 350, rows: 3, cols: 10 },
        { name: 'VIP Circle', price: 250, rows: 5, cols: 12 },
        { name: 'Standard', price: 120, rows: 10, cols: 15 },
      ]
    },
    {
      title: 'Neon Nights: Electronic Pulse',
      description: 'The ultimate EDM experience with top-tier DJs and a world-class light show.\n\nFeaturing:\n- DJ Shadow\n- Techno Pulse\n- Synth Wave Collective',
      location: 'Future Arena, Singapore',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
      startTime: new Date('2026-07-20T21:00:00Z'),
      status: EventStatus.UPCOMING,
      zones: [
        { name: 'Dance Floor', price: 180, rows: 1, cols: 100 }, // Large standing area represented as 1 row
        { name: 'VIP Lounge', price: 450, rows: 4, cols: 10 },
      ]
    },
    {
      title: 'Indie Rock Festival 2026',
      description: 'Three days of non-stop indie rock music featuring local legends and international stars.',
      location: 'Coastal Park, California',
      bannerUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
      startTime: new Date('2026-08-05T14:00:00Z'),
      status: EventStatus.UPCOMING,
      zones: [
        { name: 'Front Row', price: 150, rows: 5, cols: 12 },
        { name: 'General Admission', price: 80, rows: 15, cols: 20 },
      ]
    }
  ];

  for (const eData of eventsData) {
    const { zones: zonesToSeed, ...eventInfo } = eData;

    const event = await prisma.event.create({
      data: {
        title: eventInfo.title,
        description: eventInfo.description,
        location: eventInfo.location,
        bannerUrl: eventInfo.bannerUrl,
        startTime: eventInfo.startTime,
        status: eventInfo.status,
      },
    });

    for (const z of zonesToSeed) {
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

    // Create some sample orders for the first event only
    if (eData.title === 'Grand Symphony 2026') {
      const allSeats = await prisma.seat.findMany({ where: { eventId: event.id } });
      for (let i = 0; i < customers.length; i++) {
        const user = customers[i];
        const seat = allSeats[i * 2];
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            eventId: event.id,
            totalAmount: 150,
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
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
