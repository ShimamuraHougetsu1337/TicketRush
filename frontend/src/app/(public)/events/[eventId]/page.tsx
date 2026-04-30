'use client';

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Box, Container, Typography, CircularProgress, Chip, Stack, alpha, useTheme } from '@mui/material';
import { CalendarToday, LocationOn, ArrowBackIosNew } from '@mui/icons-material';
import SeatMap from '@/components/SeatMap';
import { format } from 'date-fns';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const { data: event, error, isLoading } = useSWR(`${API_URL}/api/events/${eventId}`, fetcher);
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} thickness={5} sx={{ color: theme.palette.primary.main }} />
        <Typography color="text.secondary" fontWeight={500}>Preparing the seat map...</Typography>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Container sx={{ py: 15, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom fontWeight={800}>Event Not Found</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>The event you are looking for might have ended or does not exist.</Typography>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Typography sx={{ color: theme.palette.primary.main, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <ArrowBackIosNew sx={{ fontSize: 14 }} /> Back to Events
          </Typography>
        </Link>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Event Header Hero */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 100%)`,
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Background glow */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-50%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: '100%', 
            height: '100%', 
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            zIndex: 0,
            filter: 'blur(80px)'
          }} 
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem', mb: 4, display: 'flex', alignItems: 'center', gap: 1, '&:hover': { color: '#fff' } }}>
              <ArrowBackIosNew sx={{ fontSize: 12 }} /> BACK TO ALL EVENTS
            </Typography>
          </Link>

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={4}>
            <Box>
              <Chip
                label={event.status}
                sx={{ 
                  mb: 3, 
                  fontWeight: 800, 
                  px: 1,
                  background: event.status === 'ONGOING' ? 'linear-gradient(90deg, #00b09b, #96c93d)' : alpha(theme.palette.primary.main, 0.2),
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.7rem',
                  letterSpacing: '1px'
                }}
              />
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                {event.title}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <CalendarToday sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight={500}>
                    {format(new Date(event.startTime), 'EEEE, MMM do • h:mm a')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <LocationOn sx={{ mr: 1.5, color: theme.palette.secondary.main }} />
                  <Typography variant="h6" fontWeight={500}>Grand Stadium Arena</Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ textAlign: { md: 'right' } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                Starting From
              </Typography>
              <Typography variant="h3" fontWeight={800} color="primary">$40.00</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Seat Map Area */}
      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <SeatMap eventId={Number(eventId)} />
      </Container>
    </Box>
  );
}
