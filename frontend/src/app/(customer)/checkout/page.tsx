import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container, Box } from '@mui/material';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Checkout | TicketRush',
  description: 'Complete your ticket purchase securely.',
};

async function getCheckoutData(eventId: string, accessToken: string, userId: string) {
  try {
    const [eventRes, seatsRes] = await Promise.all([
      fetch(`${API}/api/events/${eventId}`),
      fetch(`${API}/api/booking/events/${eventId}/seats`, { cache: 'no-store' }),
    ]);

    if (!eventRes.ok || !seatsRes.ok) return null;

    const event = await eventRes.json();
    const allSeats = await seatsRes.json();
    const myLockedSeats = allSeats.filter(
      (s: any) => s.status === 'LOCKED' && s.lockedById === Number(userId)
    );

    return { event, myLockedSeats };
  } catch (error) {
    return null;
  }
}

export default async function CheckoutPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await getServerSession(authOptions);
  const eventId = searchParams.eventId;

  if (!session?.user?.accessToken) {
    redirect('/login');
  }

  if (!eventId) {
    redirect('/');
  }

  const data = await getCheckoutData(eventId, session.user.accessToken, session.user.id);

  if (!data) {
    redirect(`/events/${eventId}`);
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <CheckoutHeader />
      <CheckoutForm 
        initialEvent={data.event}
        initialSeats={data.myLockedSeats}
        eventId={eventId}
        accessToken={session.user.accessToken}
      />
    </Container>
  );
}
