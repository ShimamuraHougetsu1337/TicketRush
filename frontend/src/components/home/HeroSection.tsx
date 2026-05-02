'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Bolt,
  ConfirmationNumber,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HeroSection() {
  const theme = useTheme();
  const { data: session } = useSession();

  const scrollToEvents = () => {
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
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
            <Button
              variant="contained"
              size="large"
              endIcon={<ConfirmationNumber />}
              onClick={scrollToEvents}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Explore Events
            </Button>

            {session ? (
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href={session.user.role === 'ADMIN' ? '/admin' : '/my-tickets'}
                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 3, px: 4 }}
              >
                {session.user.role === 'ADMIN' ? 'Go to Admin' : 'My Tickets'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/register"
                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 3, px: 4 }}
              >
                Join Now
              </Button>
            )}
          </Stack>
        </Box>
      </Container>

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
    </Box>
  );
}
