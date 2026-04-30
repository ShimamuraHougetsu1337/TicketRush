'use client';

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4facfe', light: '#00f2fe', dark: '#0082c8' },
    secondary: { main: '#f093fb', light: '#f5576c', dark: '#d0309e' },
    background: { default: '#0b0f19', paper: '#111827' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-1.5px' },
    h2: { fontWeight: 800, letterSpacing: '-1px' },
    h3: { fontWeight: 700, letterSpacing: '-0.5px' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0b0f19',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0b0f19 50%)',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: '#0b0f19' },
          '&::-webkit-scrollbar-thumb': { background: '#334155', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#475569' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { 
          borderRadius: 12, 
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          color: '#0b0f19',
          '&:hover': {
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            boxShadow: '0 8px 25px rgba(79, 172, 254, 0.4)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 24,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
