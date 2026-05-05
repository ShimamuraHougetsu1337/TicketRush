import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Container, Box, Typography, Stack, Button } from '@mui/material';
import { ArrowBack as BackIcon, ShoppingBag as OrderIcon } from '@mui/icons-material';
import Link from 'next/link';
import OrdersTable from '@/components/admin/OrdersTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Orders | Admin | TicketRush',
  description: 'Detailed list of all system orders.',
};

export default async function AdminOrdersPage() {
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
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(52, 199, 89, 0.1)', color: '#34c759', display: 'flex' }}>
              <OrderIcon />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
                Order Management
              </Typography>
              <Typography variant="body1" color="text.secondary">Review all transactions and customer orders</Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <OrdersTable accessToken={session.user.accessToken} />
    </Container>
  );
}
