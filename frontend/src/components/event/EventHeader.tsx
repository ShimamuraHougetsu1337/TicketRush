'use client';

import React from 'react';
import { Box, Typography, Stack, Chip, alpha, useTheme, Container } from '@mui/material';
import { CalendarToday, LocationOn, ArrowBackIosNew } from '@mui/icons-material';
import { format } from 'date-fns';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface EventHeaderProps {
  event: {
    title: string;
    description: string | null;
    location: string | null;
    bannerUrl: string | null;
    startTime: string;
    status: string;
  };
}

export default function EventHeader({ event }: EventHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        background: event.bannerUrl 
          ? `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, #0b0f19 100%), url(${event.bannerUrl.startsWith('/') ? API_URL + event.bannerUrl : event.bannerUrl}) center/cover no-repeat`
          : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 100%)`,
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        minHeight: event.bannerUrl ? '60vh' : 'auto',
        display: 'flex',
        alignItems: 'flex-end'
      }}
    >

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
                <Typography variant="h6" fontWeight={500}>
                  {event.location || 'Grand Stadium Arena'}
                </Typography>
              </Box>
            </Stack>

            {event.description && (
              <Box sx={{ mt: 6, maxWidth: '800px' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2 }}>About this Event</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha('#fff', 0.8), 
                    lineHeight: 1.8, 
                    fontSize: '1.1rem',
                    whiteSpace: 'pre-line', // Preserve new lines
                    mt: 1
                  }}
                >
                  {event.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
