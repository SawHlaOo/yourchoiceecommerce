import { Alert, Box, Button, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { ArrowForward, Bolt, LocalShipping, Lock, SupportAgent } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function CatalogSection({ title, type, items, isLoading, search, filter }) {
  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter = !filter || (filter === 'new_arrivals' ? ['new', 'new arrivals'].includes(item.badge?.toLowerCase()) : item.badge?.toLowerCase() === filter);
      const matchesSearch = !term || item.name?.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [items, search, filter]);

  return (
    <Box component="section" sx={{ mt: 5 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>{title}</Typography>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress aria-label={`Loading ${title}`} /></Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {visibleItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={`${type}-${item.id}`} sx={{ display: 'flex' }}>
              <ProductCard type={type} item={item} />
            </Grid>
          ))}
          {!visibleItems.length ? <Grid item xs={12}><Alert severity="info">No {title.toLowerCase()} match your search.</Alert></Grid> : null}
        </Grid>
      )}
    </Box>
  );
}

export default function Home() {
  const location = useLocation();
  const [search] = useState(location.state?.search || '');
  const [filter, setFilter] = useState('');
  const promotions = useFeatureFlag('promotions');
  const popular = useFeatureFlag('popular');
  const newArrivals = useFeatureFlag('new_arrivals');
  const games = useQuery({ queryKey: ['games'], queryFn: productApi.listGames, select: (response) => response?.data ?? [] });
  const apps = useQuery({ queryKey: ['apps'], queryFn: productApi.listApps, select: (response) => response?.data ?? [] });
  const powerpoints = useQuery({ queryKey: ['powerpoints'], queryFn: productApi.listPowerpoints, select: (response) => response?.data ?? [] });
  const error = games.error || apps.error || powerpoints.error;

  return (
    <Box sx={{ pb: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 7 }, borderRadius: 4, background: 'linear-gradient(120deg, #15233d 0%, #263e68 60%, #ef6c3b 160%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.08)', right: -80, top: -120 }} />
        <Stack spacing={2.5} maxWidth={680} position="relative">
          <Typography variant="overline" sx={{ color: '#ffb49a', fontWeight: 800, letterSpacing: '.18em' }}>DIGITAL GOODS, SIMPLIFIED</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '2.4rem', md: '4.5rem' }, lineHeight: .98, fontWeight: 900, letterSpacing: '-.06em' }}>Find what makes your work and play better.</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.78)', maxWidth: 540, fontSize: { md: '1.1rem' } }}>Trusted games, apps, and presentation tools—curated for quality and delivered instantly.</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" color="secondary" endIcon={<ArrowForward />} onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} sx={{ bgcolor: '#ef6c3b', '&:hover': { bgcolor: '#d9562c' }, color: 'white', px: 3, py: 1.3, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>Explore collection</Button>
            <Button variant="outlined" onClick={() => setFilter('new_arrivals')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,.5)', px: 3, py: 1.3, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>See new arrivals</Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ my: 3 }}>
        {[['Games', games.data?.length || 0, 'game'], ['Apps', apps.data?.length || 0, 'app'], ['Templates', powerpoints.data?.length || 0, 'powerpoint']].map(([label, count, type]) => (
          <Grid item xs={12} sm={4} key={type}><Button fullWidth onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} sx={{ justifyContent: 'space-between', p: 2.2, border: '1px solid', borderColor: 'divider', borderRadius: 2, color: 'text.primary', textTransform: 'none', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' } }}><Stack alignItems="flex-start"><Typography fontWeight={800}>{label}</Typography><Typography variant="body2" color="text.secondary">{count} products to explore</Typography></Stack><ArrowForward color="primary" /></Button></Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }} id="catalog">
        {promotions.data !== false ? <Button variant={filter === 'promotions' ? 'contained' : 'outlined'} onClick={() => setFilter(filter === 'promotions' ? '' : 'promotions')}>Promotions</Button> : null}
        {popular.data !== false ? <Button variant={filter === 'popular' ? 'contained' : 'outlined'} onClick={() => setFilter(filter === 'popular' ? '' : 'popular')}>Popular</Button> : null}
        {newArrivals.data !== false ? <Button variant={filter === 'new_arrivals' ? 'contained' : 'outlined'} onClick={() => setFilter(filter === 'new_arrivals' ? '' : 'new_arrivals')}>New arrivals</Button> : null}
      </Stack>

      {error ? <Alert severity="error" sx={{ mt: 3 }}>{error.message || 'Unable to load the catalog right now. Please try again shortly.'}</Alert> : null}
      <CatalogSection title="Games" type="game" items={games.data || []} isLoading={games.isLoading} search={search} filter={filter} />
      <CatalogSection title="Apps" type="app" items={apps.data || []} isLoading={apps.isLoading} search={search} filter={filter} />
      <CatalogSection title="Presentation templates" type="powerpoint" items={powerpoints.data || []} isLoading={powerpoints.isLoading} search={search} filter={filter} />
      <Grid container spacing={2} sx={{ mt: 5 }}>
        {[['Fast delivery', 'Get your digital product without the wait.', <Bolt />], ['Secure checkout', 'Your account and purchase are protected.', <Lock />], ['Always here', 'Friendly support when you need it.', <SupportAgent />], ['Instant access', 'Simple, reliable digital delivery.', <LocalShipping />]].map(([title, copy, icon]) => (
          <Grid item xs={12} sm={6} md={3} key={title}><Stack direction="row" spacing={1.5} sx={{ p: 2, height: '100%', borderTop: '2px solid', borderColor: 'primary.main' }}><Box sx={{ color: 'primary.main' }}>{icon}</Box><Box><Typography fontWeight={800}>{title}</Typography><Typography variant="body2" color="text.secondary">{copy}</Typography></Box></Stack></Grid>
        ))}
      </Grid>
    </Box>
  );
}
