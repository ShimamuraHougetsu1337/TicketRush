import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container, Box, Typography, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Link from 'next/link';
import NewEventForm from '@/components/admin/NewEventForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Event | Admin | TicketRush',
  description: 'Configure new event and seat matrix.',
};

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Link href="/admin/events" passHref style={{ textDecoration: 'none' }}>
        <Button startIcon={<BackIcon />} sx={{ mb: 4, color: 'text.secondary' }}>
          Back to Events
        </Button>
      </Link>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif', mb: 1 }}>
          Create New Event
        </Typography>
        <Typography variant="body1" color="text.secondary">Fill in the details and configure the seating matrix</Typography>
      </Box>

      <NewEventForm accessToken={session.user.accessToken} />
    </Container>
  );
}
