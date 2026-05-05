'use client';

import React from 'react';
import { Box, Typography, Stack, Chip, alpha, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CalendarToday, LocationOn, ArrowBackIosNew } from '@mui/icons-material';
import Image from 'next/image';
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
  const bannerUrl = event.bannerUrl?.startsWith('/') ? API_URL + event.bannerUrl : event.bannerUrl;

  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        minHeight: bannerUrl ? { xs: '40vh', md: '50vh' } : 'auto',
        display: 'flex',
        alignItems: 'flex-end',
        bgcolor: '#0b0f19'
      }}
    >
      {/* Optimized Background Image */}
      {bannerUrl && (
        <>
          <Image
            src={bannerUrl}
            alt={event.title}
            fill
            priority
            style={{ objectFit: 'cover', zIndex: 0, opacity: 0.4 }}
          />
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(11,15,25,0.4) 0%, #0b0f19 100%)',
            zIndex: 1
          }} />
        </>
      )}

      {/* Subtle background glow - simplified for performance */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          zIndex: 1
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', mb: 3, display: 'flex', alignItems: 'center', gap: 1, '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>
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
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontFamily: '"Outfit", sans-serif', fontSize: { xs: '2.5rem', md: '3.75rem' }, letterSpacing: '-1px' }}>
              {event.title}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <CalendarToday sx={{ mr: 1.5, color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  {format(new Date(event.startTime), 'EEEE, MMM do • h:mm a')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <LocationOn sx={{ mr: 1.5, color: theme.palette.secondary.main, fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  {event.location || 'Grand Stadium Arena'}
                </Typography>
              </Box>
            </Stack>

            {event.description && (
              <Box sx={{ mt: 5, maxWidth: '800px' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2 }}>About this Event</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha('#fff', 0.8),
                    lineHeight: 1.7,
                    fontSize: '1.05rem',
                    whiteSpace: 'pre-line',
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
