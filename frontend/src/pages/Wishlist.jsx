import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { Alert, Button, Card, Icon, Spinner } from '../components/ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';
function productFromItem(item) {
  const product = item?.product || item; const price = Number(product?.price ?? 0); const originalPrice = product?.originalPrice == null ? null : Number(product.originalPrice);
  return { ...product, image: product?.image || product?.thumbnail || FALLBACK_IMAGE, price, originalPrice, discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0 };
}

export default function Wishlist() {
  const queryClient = useQueryClient();
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, select: (response) => response?.data ?? [] });
  const removeMutation = useMutation({
    mutationFn: (productId) => productApi.removeFromWishlist(productId),
    onMutate: async (productId) => { await queryClient.cancelQueries({ queryKey: ['wishlist'] }); const previousWishlist = queryClient.getQueryData(['wishlist']); queryClient.setQueryData(['wishlist'], (current = { success: true, data: [] }) => ({ ...current, data: (current.data || []).filter((entry) => (entry.productId || entry.product?.id) !== productId) })); return { previousWishlist }; },
    onError: (_error, _productId, context) => { if (context?.previousWishlist) queryClient.setQueryData(['wishlist'], context.previousWishlist); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
  if (wishlist.isLoading) return <div className="flex justify-center py-16"><Spinner label="Loading wishlist" /></div>;
  if (wishlist.error) return <Alert severity="error">{wishlist.error.message}</Alert>;
  return <div className="py-4"><div className="mb-6"><h1 className="text-3xl font-extrabold">Wishlist</h1><p className="text-slate-500">Save products you want to buy later.</p></div>
    {!wishlist.data.length ? <Alert>Your wishlist is empty.</Alert> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{wishlist.data.map((entry) => { const product = productFromItem(entry); const unavailable = !product.isActive || product.stock <= 0; return <Card key={entry.id || product.id} className="flex flex-col overflow-hidden"><img className="h-56 w-full object-cover" src={product.image} alt={product.name} /><div className="flex flex-1 flex-col p-4"><h2 className="text-lg font-bold">{product.name}</h2>{product.brand ? <p className="text-sm text-slate-500">{product.brand}</p> : null}<div className="my-2 flex items-baseline gap-2"><strong>${product.price.toFixed(2)}</strong>{product.originalPrice > product.price ? <del className="text-sm text-slate-500">${product.originalPrice.toFixed(2)}</del> : null}{product.discount ? <span className="text-sm text-emerald-600">-{product.discount}%</span> : null}</div>{unavailable ? <Alert severity="warning" className="mb-3">{product.isActive ? 'Out of stock' : 'Inactive product'}</Alert> : null}<div className="mt-auto flex items-center gap-2"><Button variant="outline" className="flex-1" onClick={() => window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')}>Go Telegram to buy</Button><button type="button" aria-label={`Remove ${product.name} from wishlist`} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" onClick={() => removeMutation.mutate(product.id)}><Icon name="trash" /></button></div></div></Card>; })}</div>}
  </div>;
}
