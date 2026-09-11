import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { productApi } from '../api/productApi';
import { Alert, Button, Card, Spinner } from '../components/ui';

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cart = useQuery({ queryKey: ['cart'], queryFn: productApi.listCart, select: (response) => response?.data ?? [] });
  const remove = useMutation({ mutationFn: (id) => productApi.removeFromCart(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }) });
  if (cart.isLoading) return <div className="flex justify-center py-16"><Spinner label="Loading cart" /></div>;
  if (cart.error) return <Alert severity="error">{cart.error.message}</Alert>;
  return <div className="mx-auto max-w-3xl py-6"><h1 className="mb-6 text-3xl font-extrabold">Cart</h1>
    {!cart.data.length ? <Alert>Your cart is empty.</Alert> : <div className="space-y-3">
      {cart.data.map((entry) => <Card key={entry.id} className="flex items-center justify-between gap-4 p-4"><div><h2 className="font-bold">{entry.product?.name}</h2><p className="text-sm text-slate-500">Quantity: {entry.quantity} · ${Number(entry.product?.price ?? 0).toFixed(2)}</p></div><Button variant="dangerOutline" onClick={() => remove.mutate(entry.productId)}>Remove</Button></Card>)}
      <Button className="w-full" onClick={() => navigate('/checkout')}>Continue to checkout</Button>
    </div>}
  </div>;
}
