'use client';

import React from 'react';
import { Stack, Box, Typography, alpha, useTheme } from '@mui/material';
import { ShoppingBag } from '@mui/icons-material';

export default function CheckoutHeader() {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 6 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
        <ShoppingBag />
      </Box>
      <Typography variant="h3" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif' }}>
        Secure Checkout
      </Typography>
    </Stack>
  );
}
