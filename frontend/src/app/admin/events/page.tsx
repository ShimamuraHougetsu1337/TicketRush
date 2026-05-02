import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container } from '@mui/material';
import AdminEventsHeader from '@/components/admin/AdminEventsHeader';
import EventsTable from '@/components/admin/EventsTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events Management | Admin | TicketRush',
  description: 'Manage platform events and seat mappings.',
};

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <AdminEventsHeader />
      <EventsTable accessToken={session.user.accessToken} />
    </Container>
  );
}
