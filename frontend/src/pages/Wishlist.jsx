import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CardMedia, CircularProgress, Container, Grid, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

function productFromItem(item) {
  const product = item?.product || item;
  const price = Number(product?.price ?? 0);
  const originalPrice = product?.originalPrice == null ? null : Number(product.originalPrice);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  return { ...product, image: product?.image || product?.thumbnail || FALLBACK_IMAGE, price, originalPrice, discount };
}

export default function Wishlist() {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, select: (response) => response?.data ?? [] });
  const removeMutation = useMutation({
    mutationFn: (productId) => productApi.removeFromWishlist(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData(['wishlist']);
      queryClient.setQueryData(['wishlist'], (current = { success: true, data: [] }) => ({
        ...current,
        data: (current.data || []).filter((entry) => (entry.productId || entry.product?.id) !== productId),
      }));
      return { previousWishlist };
    },
    onError: (_error, _productId, context) => {
      if (context?.previousWishlist) queryClient.setQueryData(['wishlist'], context.previousWishlist);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  if (wishlist.isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress aria-label="Loading wishlist" /></Box>;
  if (wishlist.error) return <Container sx={{ py: 6 }}><Alert severity="error">{wishlist.error.message}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Wishlist</Typography>
          <Typography color="text.secondary">Save products you want to buy later.</Typography>
        </Box>
      </Stack>
      {!wishlist.data.length ? <Alert severity="info">Your wishlist is empty.</Alert> : (
        <Grid container spacing={3}>
          {wishlist.data.map((entry) => {
            const product = productFromItem(entry);
            const unavailable = !product.isActive || product.stock <= 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={entry.id || product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia component="img" height="250" image={product.image} alt={product.name} sx={{ objectFit: 'cover' }} />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{product.name}</Typography>
                    {product.brand ? <Typography color="text.secondary">{product.brand}</Typography> : null}
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ my: 1 }}>
                      <Typography variant="h6" fontWeight={800}>${product.price.toFixed(2)}</Typography>
                      {product.originalPrice > product.price ? <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</Typography> : null}
                      {product.discount ? <Typography color="success.main">-{product.discount}%</Typography> : null}
                    </Stack>
                    {unavailable ? <Alert severity="warning" sx={{ mb: 1 }}>{product.isActive ? 'Out of stock' : 'Inactive product'}</Alert> : null}
                    <Stack direction="row" spacing={1}>
                      <Button component="a" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" size="small" variant="outlined">Go Telegram to buy</Button>
                      <IconButton aria-label={`Remove ${product.name} from wishlist`} color="error" onClick={() => removeMutation.mutate(product.id)}><Delete /></IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Snackbar open={Boolean(notice)} autoHideDuration={2500} onClose={() => setNotice('')} message={notice} />
    </Container>
  );
}
