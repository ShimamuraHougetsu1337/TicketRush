'use client';

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, alpha, useTheme, Avatar, Stack
} from '@mui/material';
import { format } from 'date-fns';
import { ShoppingBag as OrderIcon, Person as UserIcon } from '@mui/icons-material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function OrdersTable({ accessToken }: { accessToken: string }) {
  const { data: orders, error, isLoading } = useSWR([`${API_URL}/api/booking/admin/orders`, accessToken], ([url, token]) => 
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
  );
  const theme = useTheme();

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress thickness={5} size={60} /></Box>;
  if (error) return <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="error">Failed to load orders.</Typography></Paper>;

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', background: alpha('#fff', 0.01) }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: alpha('#fff', 0.02) }}>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ORDER ID</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CUSTOMER</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>EVENT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>SEATS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>TOTAL AMOUNT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>PURCHASE DATE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id} sx={{ '&:hover': { background: alpha('#fff', 0.02) }, transition: 'background 0.2s' }}>
                <TableCell sx={{ fontWeight: 700 }}>
                   <Stack direction="row" spacing={1} alignItems="center">
                      <OrderIcon fontSize="small" color="primary" sx={{ opacity: 0.5 }} />
                      <Typography variant="body2" fontWeight={800}>#{order.id}</Typography>
                   </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: theme.palette.secondary.main }}>
                      {order.user.fullName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>{order.user.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.user.email}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{order.event.title}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {order.seats.map((seat: any) => (
                      <Chip 
                        key={seat.id} 
                        label={`${seat.rowName}${seat.seatNumber}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 20, fontWeight: 700, borderColor: 'rgba(255,255,255,0.1)' }} 
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight={900} color="primary">
                    ${Number(order.totalAmount).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
