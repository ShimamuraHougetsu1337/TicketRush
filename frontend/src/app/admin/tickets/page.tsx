import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container, Box, Typography, Stack, Button } from '@mui/material';
import { ArrowBack as BackIcon, ConfirmationNumber as TicketIcon } from '@mui/icons-material';
import Link from 'next/link';
import TicketsTable from '@/components/admin/TicketsTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Tickets | Admin | TicketRush',
  description: 'Detailed list of all sold tickets.',
};

export default async function AdminTicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
        <Box>
          <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
            <Button startIcon={<BackIcon />} sx={{ mb: 2, color: 'text.secondary', textTransform: 'none', fontWeight: 700 }}>
              Back to Dashboard
            </Button>
          </Link>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(94, 92, 230, 0.1)', color: '#5e5ce6', display: 'flex' }}>
              <TicketIcon />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
                Issued Tickets
              </Typography>
              <Typography variant="body1" color="text.secondary">View all sold tickets and their authentication codes</Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <TicketsTable accessToken={session.user.accessToken} />
    </Container>
  );
}
