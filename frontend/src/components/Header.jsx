import { AppBar, Badge, Button, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { DarkMode, LightMode, Menu as MenuIcon, Search, ShoppingBag } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { useApp } from '../appContext';

export default function Header() {
  const { mode, setMode, setOpenDrawer, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  const submitSearch = (event) => {
    event.preventDefault();
    navigate('/', { state: { search: search.trim() } });
  };

  return (
    <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,.92)', backdropFilter: 'blur(14px)' }}>
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, minHeight: { xs: 64, md: 76 } }}>
        <IconButton aria-label="Open navigation" onClick={() => setOpenDrawer(true)} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography component="button" type="button" onClick={() => navigate('/')} sx={{ cursor: 'pointer', textAlign: 'left', border: 0, bgcolor: 'transparent', color: '#162033', fontWeight: 900, fontSize: { xs: '1.05rem', md: '1.25rem' }, letterSpacing: '-.04em' }}>
          Shop<span style={{ color: '#ef6c3b' }}>In</span>
        </Typography>
        <Stack direction="row" spacing={2.5} sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
          <Button color="inherit" onClick={() => navigate('/')} sx={{ fontWeight: 700 }}>Shop</Button>
          <Button color="inherit" onClick={() => navigate('/')} sx={{ fontWeight: 700 }}>New arrivals</Button>
          <Button color="inherit" onClick={() => navigate('/')} sx={{ fontWeight: 700 }}>Offers</Button>
        </Stack>
        <form onSubmit={submitSearch} style={{ flex: 1, maxWidth: 440, marginLeft: 'auto' }}>
          <TextField
            fullWidth size="small" value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..." aria-label="Search products"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f5f7fa' } }}
          />
        </form>
        <Stack direction="row" spacing={{ xs: 0, md: 1 }} alignItems="center">
          {user ? (
            <Button color="inherit" onClick={() => navigate(`/profile/${user.id}`)} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Account</Button>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Sign in</Button>
          )}
          {isAdmin && location.pathname !== '/admin' ? (
            <Button color="inherit" onClick={() => navigate('/admin')} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Admin</Button>
          ) : null}
          <IconButton aria-label="Shopping bag" color="inherit"><Badge badgeContent={0} color="primary"><ShoppingBag /></Badge></IconButton>
          <IconButton aria-label="Toggle theme" color="inherit" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
