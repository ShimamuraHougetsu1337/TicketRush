'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  useScrollTrigger, alpha, Menu, MenuItem, Avatar, Divider, 
  ListItemIcon, InputBase, styled 
} from '@mui/material';
import { 
  ConfirmationNumber, PersonOutline, Logout, 
  ConfirmationNumberOutlined, DashboardOutlined, 
  Search as SearchIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { TimerOutlined, ShoppingCartOutlined, ArrowForwardIos } from '@mui/icons-material';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
    minWidth: '300px',
  },
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1.2, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
}));

interface Props {
  window?: () => Window;
}

export default function TopNav(props: Props) {
  const { window } = props;
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [lockMenuAnchor, setLockMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const { data: myLocks } = useSWR(
    session?.user?.accessToken ? `${API_URL}/api/booking/my-locks` : null,
    (url: string) => fetch(url, {
      headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
    }).then(res => res.json()),
    { refreshInterval: 30000 } 
  );

  const hasLocks = Array.isArray(myLocks) && myLocks.length > 0;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
    target: window ? window() : undefined,
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      } else {
        params.delete('search');
      }
      
      router.push(`/?${params.toString()}`, { scroll: false });
    }
  };

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    setSearchQuery(currentSearch);
  }, [searchParams]);

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
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 }, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.5px', display: { xs: 'none', lg: 'block' } }}>
                Ticket<Box component="span" sx={{ color: '#4facfe' }}>Rush</Box>
              </Typography>
            </Box>
          </Link>

          <Search>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search for events, artists..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown} 
            />
          </Search>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {session && hasLocks && (
            <>
              <Button
                onClick={(e) => setLockMenuAnchor(e.currentTarget)}
                startIcon={
                  <Box sx={{ position: 'relative', display: 'flex' }}>
                    <ShoppingCartOutlined />
                    <Box sx={{
                      position: 'absolute', top: -4, right: -4,
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#ef4444', border: '2px solid #0b0f19',
                      fontSize: '8px', fontWeight: 900, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {myLocks.length}
                    </Box>
                  </Box>
                }
                sx={{
                  background: alpha('#ef4444', 0.1),
                  color: '#ef4444',
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  '&:hover': { background: alpha('#ef4444', 0.2) }
                }}
              >
                Checkout Pending
              </Button>
              <Menu
                anchorEl={lockMenuAnchor}
                open={Boolean(lockMenuAnchor)}
                onClose={() => setLockMenuAnchor(null)}
                sx={{ mt: 1 }}
                PaperProps={{
                  sx: {
                    background: '#161b22',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: 280,
                    p: 1
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    You have pending items
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your seats are being held for 10 minutes. Complete payment to secure them.
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                {myLocks.slice(0, 3).map((lock: any) => (
                  <MenuItem 
                    key={lock.id} 
                    component={Link} 
                    href={`/checkout?eventId=${lock.eventId}`}
                    onClick={() => setLockMenuAnchor(null)}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight={700} noWrap>{lock.event.title}</Typography>
                      <Typography variant="caption" color="primary" fontWeight={700}>
                        {lock.zone.name} • Row {lock.rowName} Seat {lock.seatNumber}
                      </Typography>
                    </Box>
                    <ArrowForwardIos sx={{ fontSize: 10, ml: 1, opacity: 0.5 }} />
                  </MenuItem>
                ))}
                <Box sx={{ p: 1 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="small"
                    component={Link}
                    href={`/checkout?eventId=${myLocks[0].eventId}`}
                    onClick={() => setLockMenuAnchor(null)}
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  >
                    Go to Checkout
                  </Button>
                </Box>
              </Menu>
            </>
          )}

          {session?.user?.role === 'ADMIN' && (
            <>
              <Button
                component={Link}
                href="/admin"
                startIcon={<DashboardOutlined />}
                color="inherit"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  '&:hover': { color: '#fff' },
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                href="/admin/events"
                startIcon={<ConfirmationNumberOutlined />}
                color="inherit"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  '&:hover': { color: '#fff' },
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                Manage Events
              </Button>
            </>
          )}

          {status === 'loading' ? (
            <Box sx={{ width: 100, height: 40, borderRadius: 2, background: alpha('#fff', 0.05) }} />
          ) : session ? (
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
                <MenuItem component={Link} href="/my-tickets" onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <ConfirmationNumberOutlined fontSize="small" sx={{ color: '#4facfe' }} />
                  </ListItemIcon>
                  My Tickets
                </MenuItem>
                {session.user.role === 'ADMIN' && (
                  <MenuItem component={Link} href="/admin" onClick={handleCloseMenu}>
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
            <Button
              variant="contained"
              component={Link}
              href="/login"
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
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
