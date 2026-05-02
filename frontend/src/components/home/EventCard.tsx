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
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          transform: 'translateY(-10px)',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 20px 40px ${alpha('#000', 0.4)}`,
          '& .card-image-overlay': { opacity: 1 }
        },
      }}
    >
      <Box
        sx={{
          height: '200px',
          background: event.bannerUrl 
            ? `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, #0b0f19 100%), url(${event.bannerUrl.startsWith('/') ? API_URL + event.bannerUrl : event.bannerUrl}) center/cover no-repeat` 
            : `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          className="card-image-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            opacity: 0,
            transition: 'opacity 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="button" sx={{ color: 'white', border: '1px solid white', px: 2, py: 1, borderRadius: 2 }}>
            View Details
          </Typography>
        </Box>
        {!event.bannerUrl && <ConfirmationNumber sx={{ fontSize: 60, opacity: 0.2, color: 'white' }} />}
        <Chip
          label={event.status}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 800,
            fontSize: '0.65rem',
            background: event.status === 'ONGOING' ? 'linear-gradient(90deg, #00b09b, #96c93d)' : alpha('#fff', 0.1),
            backdropFilter: 'blur(4px)',
            color: 'white',
            border: 'none'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          {event.title}
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <CalendarToday sx={{ fontSize: 18, mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="body2" fontWeight={500}>
              {format(new Date(event.startTime), 'MMMM do, yyyy • h:mm a')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <LocationOn sx={{ fontSize: 18, mr: 1.5, color: theme.palette.secondary.main }} />
            <Typography variant="body2" fontWeight={500}>{event.location || 'Grand Stadium Arena'}</Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          component={Link}
          href={`/events/${event.id}`}
          sx={{ py: 1.5 }}
        >
          Book Your Seat
        </Button>
      </CardActions>
    </Card>
  );
}
