'use client';

import { Box, CircularProgress, Typography, alpha, useTheme } from '@mui/material';

export default function GlobalLoading() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)', 
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          sx={{
            color: alpha(theme.palette.primary.main, 0.1),
          }}
          size={64}
          thickness={4}
          value={100}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          sx={{
            color: theme.palette.primary.main,
            animationDuration: '1000ms',
            position: 'absolute',
            left: 0,
            [`& .MuiCircularProgress-circle`]: {
              strokeLinecap: 'round',
            },
          }}
          size={64}
          thickness={4}
        />
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.5 },
          }
        }}
      >
        Loading...
      </Typography>
    </Box>
  );
}
