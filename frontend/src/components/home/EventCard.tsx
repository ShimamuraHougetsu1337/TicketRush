'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  ConfirmationNumber,
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const theme = useTheme();
  const bannerUrl = event.bannerUrl?.startsWith('/') ? API_URL + event.bannerUrl : event.bannerUrl;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 20px 40px ${alpha('#000', 0.5)}`,
          '& .card-image-overlay': { opacity: 1 },
          '& .event-card-image': { transform: 'scale(1.1)' }
        },
      }}
    >
      <Box sx={{ height: '200px', position: 'relative', overflow: 'hidden', bgcolor: '#1e293b' }}>
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={event.title}
            fill
            className="event-card-image"
            style={{ 
              objectFit: 'cover', 
              transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})` }}>
            <ConfirmationNumber sx={{ fontSize: 60, opacity: 0.1 }} />
          </Box>
        )}
        
        {/* Gradient Overlay for text readability */}
        <Box sx={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(11,15,25,0.8) 100%)',
          zIndex: 1 
        }} />

        <Box
          className="card-image-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            background: alpha(theme.palette.primary.main, 0.2),
            backdropFilter: 'blur(4px)',
            opacity: 0,
            transition: 'opacity 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <Typography variant="button" sx={{ color: 'white', border: '1px solid white', px: 2, py: 1, borderRadius: 2, fontWeight: 700 }}>
            View Details
          </Typography>
        </Box>
        
        <Chip
          label={event.status}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 3,
            fontWeight: 800,
            fontSize: '0.65rem',
            background: event.status === 'ONGOING' ? 'linear-gradient(90deg, #00b09b, #96c93d)' : alpha('#fff', 0.1),
            color: 'white',
            border: 'none'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3, zIndex: 1 }}>
        <Typography variant="h5" sx={{ mb: 2, fontFamily: '"Outfit", sans-serif', fontWeight: 700, minHeight: '3.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.title}
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <CalendarToday sx={{ fontSize: 18, mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="body2" fontWeight={500}>
              {format(new Date(event.startTime), 'MMM do, yyyy • h:mm a')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <LocationOn sx={{ fontSize: 18, mr: 1.5, color: theme.palette.secondary.main }} />
            <Typography variant="body2" fontWeight={500} noWrap>{event.location || 'Grand Stadium Arena'}</Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, zIndex: 1 }}>
        <Button
          fullWidth
          variant="contained"
          component={Link}
          href={`/events/${event.id}`}
          sx={{ py: 1.5, fontWeight: 800 }}
        >
          Book Your Seat
        </Button>
      </CardActions>
    </Card>
  );
}
