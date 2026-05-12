import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Box, Container, Stack } from '@mui/material';
import TicketsHeader from '@/components/tickets/TicketsHeader';
import OrderSection from '@/components/tickets/OrderSection';
import EmptyTickets from '@/components/tickets/EmptyTickets';
import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


export const metadata: Metadata = {
  title: 'My Tickets | TicketRush',
  description: 'View and manage your event tickets.',
};

async function getMyTickets(accessToken: string) {
  const res = await fetch(`${API}/api/booking/my-tickets`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    cache: 'no-store', // Always get fresh tickets
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    redirect('/login');
  }

  const orders = await getMyTickets(session.user.accessToken);

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Client Component: Header */}
      <TicketsHeader />

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        {orders.length === 0 ? (
          /* Client Component: Empty State */
          <EmptyTickets />
        ) : (
          <Stack spacing={10}>
            {orders.map((order: any) => (
              /* Client Component: Order & Ticket logic */
              <OrderSection key={order.id} order={order} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
