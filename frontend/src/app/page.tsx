'use client';

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { CalendarToday, LocationOn, Bolt, ConfirmationNumber } from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function HomePage() {
  const { data: events, error, isLoading } = useSWR(`${API_URL}/api/events`, fetcher);
  const theme = useTheme();

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative', 
          pt: { xs: 8, md: 12 }, 
          pb: { xs: 10, md: 16 },
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: '50px',
                background: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 4
              }}
            >
              <Bolt sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Fastest Ticket Booking Engine
              </Typography>
            </Box>
            
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                mb: 3,
                fontFamily: '"Outfit", sans-serif',
                background: 'linear-gradient(135deg, #fff 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Grab Your Tickets <br />
              <Box component="span" sx={{ color: theme.palette.primary.main }}>Before They're Gone</Box>
            </Typography>
            
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '700px', mx: 'auto', mb: 6, fontWeight: 400 }}>
              Join thousands of fans securing seats in real-time. Our high-concurrency engine ensures a fair and lightning-fast booking experience.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" size="large" endIcon={<ConfirmationNumber />}>
                Explore Events
              </Button>
              <Button variant="outlined" size="large" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                How it works
              </Button>
            </Stack>
          </Box>
        </Container>

        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-20%', 
            right: '-10%', 
            width: '600px', 
            height: '600px', 
            background: 'radial-gradient(circle, rgba(79, 172, 254, 0.15) 0%, transparent 70%)',
            zIndex: 0,
            filter: 'blur(60px)'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '10%', 
            left: '-5%', 
            width: '400px', 
            height: '400px', 
            background: 'radial-gradient(circle, rgba(240, 147, 251, 0.1) 0%, transparent 70%)',
            zIndex: 0,
            filter: 'blur(50px)'
          }} 
        />
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h3" sx={{ mb: 1, fontFamily: '"Outfit", sans-serif' }}>Upcoming Events</Typography>
            <Typography variant="body1" color="text.secondary">Handpicked experiences just for you</Typography>
          </Box>
          <Button variant="text" sx={{ color: theme.palette.primary.main }}>View All</Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 12 }}>
            <CircularProgress thickness={5} size={60} sx={{ color: theme.palette.primary.main, mb: 2 }} />
            <Typography color="text.secondary" fontWeight={500}>Loading amazing events...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed rgba(255,0,0,0.3)', borderRadius: 4 }}>
            <Typography color="error">Failed to load events. Please check your connection.</Typography>
          </Box>
        )}

        <Grid container spacing={4}>
          {events?.filter((e: any) => e.status !== 'ENDED').map((event: any) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
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
                {/* Simulated Image Header */}
                <Box 
                  sx={{ 
                    height: '200px', 
                    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
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
                  <ConfirmationNumber sx={{ fontSize: 60, opacity: 0.2, color: 'white' }} />
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
                      <Typography variant="body2" fontWeight={500}>Grand Stadium Arena</Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Link href={`/events/${event.id}`} passHref style={{ width: '100%', textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ py: 1.5 }}
                    >
                      Book Your Seat
                    </Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
