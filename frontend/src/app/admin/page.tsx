import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container, Box } from '@mui/material';
import AdminDashboard from '@/components/AdminDashboard';
import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Admin Dashboard | TicketRush',
  description: 'System-wide overview and analytics.',
};

async function getAnalyticsData(accessToken: string) {
  try {
    const [statsRes, demoRes] = await Promise.all([
      fetch(`${API}/api/booking/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store',
      }),
      fetch(`${API}/api/admin/analytics/demographics`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store',
      })
    ]);

    if (!statsRes.ok || !demoRes.ok) return null;

    return {
      stats: await statsRes.json(),
      demographics: await demoRes.json(),
    };
  } catch (error) {
    return null;
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const data = await getAnalyticsData(session.user.accessToken);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <AdminDashboard initialData={data} accessToken={session.user.accessToken} />
      </Box>
    </Container>
  );
}
