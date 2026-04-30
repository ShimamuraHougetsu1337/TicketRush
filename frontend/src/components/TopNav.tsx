'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useScrollTrigger, alpha, Menu, MenuItem, Avatar, Divider, ListItemIcon } from '@mui/material';
import { ConfirmationNumber, PersonOutline, Logout, ConfirmationNumberOutlined, DashboardOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
  window?: () => Window;
}

export default function TopNav(props: Props) {
  const { window } = props;
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
    target: window ? window() : undefined,
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleMyTickets = () => {
    handleCloseMenu();
    router.push('/my-tickets');
  };

  const handleAdmin = () => {
    handleCloseMenu();
    router.push('/admin');
  };

  return (
    <AppBar
      position="sticky"
      elevation={trigger ? 4 : 0}
      sx={{
        background: trigger ? alpha('#0b0f19', 0.8) : 'transparent',
        backdropFilter: trigger ? 'blur(12px)' : 'none',
        borderBottom: trigger ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 } }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(79, 172, 254, 0.4)'
              }}
            >
              <ConfirmationNumber sx={{ color: '#0b0f19', fontSize: 24, transform: 'rotate(-45deg)' }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              Ticket<Box component="span" sx={{ color: '#4facfe' }}>Rush</Box>
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {session?.user?.role === 'ADMIN' && (
            <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<DashboardOutlined />}
                color="inherit"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  '&:hover': { color: '#fff' },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Admin Panel
              </Button>
            </Link>
          )}

          {session ? (
            <>
              <IconButton
                onClick={handleOpenMenu}
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 0.5,
                  '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#4facfe',
                    fontSize: '0.875rem',
                    fontWeight: 700
                  }}
                >
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    background: '#161b22',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    color: '#fff',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {session.user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {session.user.email}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <MenuItem onClick={handleMyTickets}>
                  <ListItemIcon>
                    <ConfirmationNumberOutlined fontSize="small" sx={{ color: '#4facfe' }} />
                  </ListItemIcon>
                  My Tickets
                </MenuItem>
                {session.user.role === 'ADMIN' && (
                  <MenuItem onClick={handleAdmin}>
                    <ListItemIcon>
                      <DashboardOutlined fontSize="small" sx={{ color: '#4facfe' }} />
                    </ListItemIcon>
                    Admin Dashboard
                  </MenuItem>
                )}
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#ff4d4d' }}>
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{ color: '#ff4d4d' }} />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<PersonOutline />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  color: '#0b0f19',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00d2de 0%, #3f9cfe 100%)',
                    boxShadow: '0 6px 20px rgba(79, 172, 254, 0.4)',
                  }
                }}
              >
                Sign In
              </Button>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

