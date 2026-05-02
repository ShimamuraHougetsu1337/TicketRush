import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { LockOutlined as LockIcon, Home as HomeIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            p: 3,
            borderRadius: '50%',
            background: 'rgba(255, 0, 0, 0.1)',
            mb: 4,
          }}
        >
          <LockIcon sx={{ fontSize: 60, color: 'error.main' }} />
        </Box>

        <Typography variant="h3" fontWeight={900} sx={{ mb: 2, fontFamily: '"Outfit", sans-serif' }}>
          Access Denied
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 400 }}>
          You do not have the required permissions to view this page. This area is reserved for administrators only.
        </Typography>

        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          sx={{ py: 1.5, px: 4, borderRadius: 2 }}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
}
