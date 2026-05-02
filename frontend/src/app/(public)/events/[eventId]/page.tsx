import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import SeatMap from '@/components/SeatMap';
import EventHeader from '@/components/event/EventHeader';
import Link from 'next/link';
import { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getEvent(eventId: string) {
  const res = await fetch(`${API_URL}/api/events/${eventId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { eventId: string } }): Promise<Metadata> {
  const event = await getEvent(params.eventId);
  if (!event) return { title: 'Event Not Found' };

  return {
    title: `${event.title} | TicketRush`,
    description: `Book your seats for ${event.title}. Experience high-concurrency ticket booking.`,
  };
}

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const event = await getEvent(eventId);

  if (!event) {
    return (
      <Container sx={{ py: 15, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom fontWeight={800}>Event Not Found</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>The event you are looking for might have ended or does not exist.</Typography>
        <Link href="/" passHref style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <ArrowBackIosNew sx={{ fontSize: 14 }} />
          <Typography sx={{ fontWeight: 700 }}>Back to Events</Typography>
        </Link>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>

      <EventHeader event={event} />

      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <SeatMap eventId={Number(eventId)} />
      </Container>
    </Box>
  );
}
