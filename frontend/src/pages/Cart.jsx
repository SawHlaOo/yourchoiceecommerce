import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { productApi } from '../api/productApi';

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cart = useQuery({ queryKey: ['cart'], queryFn: productApi.listCart, select: (response) => response?.data ?? [] });
  const remove = useMutation({ mutationFn: (id) => productApi.removeFromCart(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }) });

  if (cart.isLoading) return <Box display="flex" justifyContent="center" py={8}>Loading cart...</Box>;
  if (cart.error) return <Container sx={{ py: 6 }}><Alert severity="error">{cart.error.message}</Alert></Container>;
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Cart</Typography>
      {!cart.data.length ? <Alert severity="info">Your cart is empty.</Alert> : (
        <Stack spacing={2}>
          {cart.data.map((entry) => (
            <Card key={entry.id}><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box><Typography variant="h6">{entry.product?.name}</Typography><Typography color="text.secondary">Quantity: {entry.quantity} · ${Number(entry.product?.price ?? 0).toFixed(2)}</Typography></Box>
              <Button color="error" onClick={() => remove.mutate(entry.productId)}>Remove</Button>
            </Stack></CardContent></Card>
          ))}
          <Button variant="contained" onClick={() => navigate('/checkout')}>Continue to checkout</Button>
        </Stack>
      )}
    </Container>
  );
}
