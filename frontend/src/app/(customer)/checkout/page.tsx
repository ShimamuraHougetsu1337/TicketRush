import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container } from '@mui/material';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Checkout | TicketRush',
  description: 'Complete your ticket purchase securely.',
};

async function getCheckoutData(accessToken: string) {
  try {
    const res = await fetch(`${API}/api/booking/my-locks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const myLockedSeats = await res.json();
    
    return { myLockedSeats };
  } catch (error) {
    return null;
  }
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const data = await getCheckoutData(session.user.accessToken);

  if (!data || data.myLockedSeats.length === 0) {
    redirect('/');
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <CheckoutHeader />
      <CheckoutForm 
        initialSeats={data.myLockedSeats}
        accessToken={session.user.accessToken}
      />
    </Container>
  );
}
