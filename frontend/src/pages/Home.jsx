import { Alert, Box, Button, CircularProgress, Container, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { useApp } from '../appContext';

function CatalogSection({ title, items, isLoading, search, filter, wishlistIds, onFavorite }) {
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
            <Grid item xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex' }}>
              <ProductCard item={item} isFavorite={wishlistIds.has(item.id)} onFavorite={onFavorite} />
            </Grid>
          ))}
          {!visibleItems.length ? <Grid item xs={12}><Alert severity="info">No {title.toLowerCase()} match your search.</Alert></Grid> : null}
        </Grid>
      )}
    </Box>
  );
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const promotions = useFeatureFlag('promotions');
  const popular = useFeatureFlag('popular');
  const newArrivals = useFeatureFlag('new_arrivals');
  const products = useQuery({ queryKey: ['products'], queryFn: () => productApi.listProducts(), select: (response) => response?.data ?? [] });
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, enabled: Boolean(user), select: (response) => response?.data ?? [] });
  const wishlistMutation = useMutation({
    mutationFn: ({ id, active }) => active ? productApi.removeFromWishlist(id) : productApi.addToWishlist(id),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData(['wishlist']);
      queryClient.setQueryData(['wishlist'], (current = { success: true, data: [] }) => ({
        ...current,
        data: active
          ? (current.data || []).filter((entry) => (entry.productId || entry.product?.id) !== id)
          : [...(current.data || []), { id: `pending-${id}`, productId: id }],
      }));
      return { previousWishlist };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousWishlist) queryClient.setQueryData(['wishlist'], context.previousWishlist);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
  const items = products.data || [];
  const wishlistIds = new Set((wishlist.data || []).map((entry) => entry.productId || entry.product?.id));
  const error = products.error || wishlistMutation.error;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid', borderColor: 'divider', background: isDarkMode ? 'linear-gradient(135deg, #172554, #1e293b)' : 'linear-gradient(135deg, #eff6ff, #f5f3ff)', color: isDarkMode ? '#f8fafc' : 'text.primary' }}>
        <Stack spacing={2} maxWidth={720}>
          <Typography component="h1" variant="h3" fontWeight={800}>hey! discover your needs </Typography>
          <Typography sx={{ color: isDarkMode ? '#dbeafe' : 'text.secondary' }}>We sell games, apps, and presentation templates based on trust and quality.</Typography>
          <TextField label="Search here" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth inputProps={{ 'aria-label': 'Search here' }} sx={isDarkMode ? { '& .MuiInputLabel-root': { color: '#dbeafe' }, '& .MuiInputLabel-root.Mui-focused': { color: '#93c5fd' }, '& .MuiOutlinedInput-root': { color: '#f8fafc', '& fieldset': { borderColor: 'rgba(219, 234, 254, 0.45)' }, '&:hover fieldset': { borderColor: '#bfdbfe' }, '&.Mui-focused fieldset': { borderColor: '#93c5fd' } } } : undefined} />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
        {promotions.data !== false ? <Button variant={filter === 'promotions' ? 'contained' : 'outlined'} onClick={() => setFilter(filter === 'promotions' ? '' : 'promotions')}>Promotions</Button> : null}
        {popular.data !== false ? <Button variant={filter === 'popular' ? 'contained' : 'outlined'} onClick={() => setFilter(filter === 'popular' ? '' : 'popular')}>Popular</Button> : null}
        {newArrivals.data !== false ? <Button variant={filter === 'new_arrivals' ? 'contained' : 'outlined'} onClick={() => setFilter(filter === 'new_arrivals' ? '' : 'new_arrivals')}>New arrivals</Button> : null}
      </Stack>

      {error ? <Alert severity="error" sx={{ mt: 3 }}>{error.message || 'Unable to load the catalog right now. Please try again shortly.'}</Alert> : null}
      <CatalogSection
        title="Products"
        items={items}
        isLoading={products.isLoading}
        search={search}
        filter={filter}
        wishlistIds={wishlistIds}
        onFavorite={(item) => user ? wishlistMutation.mutate({ id: item.id, active: wishlistIds.has(item.id) }) : navigate('/register')}
      />
    </Container>
  );
}
