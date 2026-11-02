import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { Alert, Spinner } from '../components/ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
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
    {!wishlist.data.length ? <Alert>Your wishlist is empty.</Alert> : <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{wishlist.data.map((entry) => { const product = productFromItem(entry); return <ProductCard key={entry.id || product.id} item={product} isFavorite onFavorite={() => removeMutation.mutate(product.id)} />; })}</div>}
  </div>;
}
