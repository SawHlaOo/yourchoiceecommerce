import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { featureFlagApi } from '../api/featureFlagApi';
import { productApi } from '../api/productApi';
import { useApp } from '../appContext';
import ProductCard from '../components/ProductCard';
import { Alert, Button, Spinner } from '../components/ui';

function CatalogSection({ title, items, isLoading, search, filter, wishlistIds, onFavorite }) {
  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const normalize = (value) => value?.toLowerCase().replace(/[_-]+/g, ' ').trim();
    return items.filter((item) => (!filter || normalize(item.badge) === normalize(filter)) && (!term || item.name?.toLowerCase().includes(term)));
  }, [items, search, filter]);
  return <section className="mt-8 sm:mt-10"><h2 className="mb-4 text-xl font-bold sm:text-2xl">{title}</h2>{isLoading ? <div className="flex justify-center py-10"><Spinner label={`Loading ${title}`} /></div> : <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-6 lg:grid-cols-3">{visibleItems.map((item) => <ProductCard key={item.id} item={item} isFavorite={wishlistIds.has(item.id)} onFavorite={onFavorite} />)}{!visibleItems.length ? <div className="col-span-2 lg:col-span-3"><Alert>No {title.toLowerCase()} match your search.</Alert></div> : null}</div>}</section>;
}

export default function Home() {
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('');
  const { mode, user } = useApp(); const navigate = useNavigate(); const queryClient = useQueryClient();
  const featureFlags = useQuery({ queryKey: ['feature-flags'], queryFn: featureFlagApi.list, select: (response) => response?.data ?? [] });
  const products = useQuery({ queryKey: ['products'], queryFn: () => productApi.listProducts(), select: (response) => response?.data ?? [] });
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, enabled: Boolean(user), select: (response) => response?.data ?? [] });
  const wishlistMutation = useMutation({
    mutationFn: ({ id, active }) => active ? productApi.removeFromWishlist(id) : productApi.addToWishlist(id),
    onMutate: async ({ id, active }) => { await queryClient.cancelQueries({ queryKey: ['wishlist'] }); const previous = queryClient.getQueryData(['wishlist']); queryClient.setQueryData(['wishlist'], (current = { success: true, data: [] }) => ({ ...current, data: active ? (current.data || []).filter((entry) => (entry.productId || entry.product?.id) !== id) : [...(current.data || []), { id: `pending-${id}`, productId: id }] })); return { previous }; },
    onError: (_error, _variables, context) => { if (context?.previous) queryClient.setQueryData(['wishlist'], context.previous); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
  const items = products.data || []; const wishlistIds = new Set((wishlist.data || []).map((entry) => entry.productId || entry.product?.id)); const error = products.error || wishlistMutation.error;
  return <div className="py-2 sm:py-4">
    <section className={`rounded-3xl border p-6 sm:p-10 ${mode === 'dark' ? 'bg-gradient-to-br from-blue-950 to-slate-900' : 'bg-gradient-to-br from-blue-50 to-violet-50'}`}>
      <div className="max-w-2xl space-y-4"><h1 className="text-3xl font-black tracking-tight sm:text-5xl">Hello! Search for your needs and pick it up</h1><p className="text-slate-600 dark:text-blue-100">Great things begin with great choices</p>
        <label className="block"><span className="sr-only">Search here</span><input aria-label="Search here" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search here" className="w-full rounded-xl border bg-white/80 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/80" /></label>
      </div>
    </section>
    <div className="mt-5 flex flex-wrap gap-2">{(featureFlags.data || []).filter((flag) => flag.enabled).map((flag) => <Button key={flag.key} variant={filter === flag.key ? 'primary' : 'outline'} onClick={() => setFilter(filter === flag.key ? '' : flag.key)}>{flag.key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</Button>)}</div>
    {error ? <Alert severity="error" className="mt-5">{error.message || 'Unable to load the catalog right now. Please try again shortly.'}</Alert> : null}
    <CatalogSection title="Products" items={items} isLoading={products.isLoading} search={search} filter={filter} wishlistIds={wishlistIds} onFavorite={(item) => user ? wishlistMutation.mutate({ id: item.id, active: wishlistIds.has(item.id) }) : navigate('/register')} />
  </div>;
}
