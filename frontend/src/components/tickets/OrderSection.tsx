'use client';

import React from 'react';
import { Box, Typography, Chip, Stack, Grid, alpha, useTheme } from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import { format } from 'date-fns';
import TicketCard from './TicketCard';

interface OrderSectionProps {
  order: any;
}

export default function OrderSection({ order }: OrderSectionProps) {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Order #{order.id}
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, fontFamily: '"Outfit", sans-serif' }}>
            {order.event.title}
          </Typography>
        </Box>
        <Chip
          label={`Paid $${Number(order.totalAmount).toFixed(2)}`}
          sx={{ 
            fontWeight: 800, 
            background: alpha(theme.palette.success.main, 0.1), 
            color: theme.palette.success.main, 
            border: 'none' 
          }}
        />
      </Box>

      <Stack direction="row" spacing={4} sx={{ mb: 4, color: 'text.secondary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            {format(new Date(order.event.startTime), 'MMMM do, yyyy • h:mm a')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn fontSize="small" color="secondary" />
          <Typography variant="body2" fontWeight={600}>Grand Stadium Arena</Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {order.seats.map((seat: any) => (
          <Grid item xs={12} md={6} lg={4} key={seat.id}>
            <TicketCard seat={seat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
