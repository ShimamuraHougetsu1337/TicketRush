'use client';

import React from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, alpha, useTheme, Stack, Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { ConfirmationNumber as TicketIcon, QrCode as QrIcon } from '@mui/icons-material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function TicketsTable({ accessToken }: { accessToken: string }) {
  const { data: tickets, error, isLoading } = useSWR([`${API_URL}/api/booking/admin/tickets`, accessToken], ([url, token]) => 
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
  );
  const theme = useTheme();

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress thickness={5} size={60} /></Box>;
  if (error) return <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="error">Failed to load tickets.</Typography></Paper>;

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', background: alpha('#fff', 0.01) }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: alpha('#fff', 0.02) }}>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>TICKET CODE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>EVENT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ZONE / SEAT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>HOLDER</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>PRICE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>SOLD AT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets?.map((ticket: any) => (
              <TableRow key={ticket.id} sx={{ '&:hover': { background: alpha('#fff', 0.02) }, transition: 'background 0.2s' }}>
                <TableCell>
                   <Stack direction="row" spacing={1} alignItems="center">
                      <TicketIcon fontSize="small" color="secondary" sx={{ opacity: 0.7 }} />
                      <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                        {ticket.ticketCode}
                      </Typography>
                   </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{ticket.event.title}</Typography>
                </TableCell>
                <TableCell>
                   <Box>
                      <Typography variant="body2" fontWeight={800}>{ticket.zone.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Row {ticket.rowName} • Seat {ticket.seatNumber}</Typography>
                   </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={800}>{ticket.order?.user.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{ticket.order?.user.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={900} color="secondary">
                    ${Number(ticket.zone.price).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {ticket.order?.createdAt ? format(new Date(ticket.order.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
