'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { PersonAddAlt1 as RegisterIcon, ArrowForward } from '@mui/icons-material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%)' }}>
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            width: '100%',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
            }}
          >
            <RegisterIcon sx={{ color: '#0b0f19', fontSize: 32 }} />
          </Box>
          
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            Join TicketRush
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Create an account to start booking your favorite event tickets in real-time.
          </Typography>

          <Box sx={{ minHeight: 64, width: '100%', mb: 1 }}>
            {error && (
              <Alert severity="error" sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>
                {error}
              </Alert>
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={!loading && <ArrowForward />}
                sx={{
                  py: 1.8,
                  mt: 2,
                  fontSize: '1rem',
                  borderRadius: 3,
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" style={{ color: theme.palette.primary.main, fontWeight: 800, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
