import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container, Box, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Link from 'next/link';
import DetailedEventStats from '@/components/admin/DetailedEventStats';
import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Event Statistics',
  description: 'Detailed audience and revenue analytics for specific event.',
};

async function getEventStats(eventId: string, accessToken: string) {
  try {
    const res = await fetch(`${API}/api/admin/analytics/event/${eventId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function EventStatsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const stats = await getEventStats(params.id, session.user.accessToken);

  if (!stats) {
    redirect('/admin');
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
        <Button startIcon={<BackIcon />} sx={{ mb: 4, color: 'text.secondary' }}>
          Back to Dashboard
        </Button>
      </Link>

      <DetailedEventStats data={stats} />
    </Container>
  );
}
