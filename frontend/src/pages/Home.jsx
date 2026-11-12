import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { featureFlagApi } from '../api/featureFlagApi';
import { productApi } from '../api/productApi';
import { useApp } from '../appContext';
import ProductCard from '../components/ProductCard';
import { Alert, Button, Icon, Spinner } from '../components/ui';

function CatalogSection({ title, items, isLoading, isError, error, onRetry, search, filter, wishlistIds, onFavorite }) {
  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const normalize = (value) => value?.toLowerCase().replace(/[_-]+/g, ' ').trim();
    return items.filter((item) => {
      const categories = item.categories || (item.category ? [item.category] : []);
      return (!filter || categories.some((category) => normalize(category) === normalize(filter))) && (!term || item.name?.toLowerCase().includes(term));
    });
  }, [items, search, filter]);
  return <section className="mt-12 sm:mt-16"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">Curated for you</p><h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2></div><span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:inline-flex dark:bg-slate-800 dark:text-slate-300">{visibleItems.length} available</span></div>{isLoading ? <div className="flex justify-center rounded-3xl border border-dashed py-16"><Spinner label={`Loading ${title}`} /></div> : isError ? <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"><p>{error?.message || `Unable to load ${title.toLowerCase()}.`}</p><Button variant="outline" onClick={onRetry}>Try again</Button></div> : <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{visibleItems.map((item) => <ProductCard key={item.id} item={item} isFavorite={wishlistIds.has(item.id)} onFavorite={onFavorite} />)}{!visibleItems.length ? <div className="col-span-full"><Alert>No {title.toLowerCase()} match your search.</Alert></div> : null}</div>}</section>;
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const { mode, user } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const featureFlags = useQuery({ queryKey: ['feature-flags'], queryFn: featureFlagApi.list, select: (response) => response?.data ?? [] });
  const products = useQuery({ queryKey: ['products'], queryFn: () => productApi.listProducts(), retry: 2, select: (response) => response?.data ?? [] });
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, enabled: Boolean(user), select: (response) => response?.data ?? [] });
  const wishlistMutation = useMutation({
    mutationFn: ({ id, active }) => active ? productApi.removeFromWishlist(id) : productApi.addToWishlist(id),
    onMutate: async ({ id, active }) => { await queryClient.cancelQueries({ queryKey: ['wishlist'] }); const previous = queryClient.getQueryData(['wishlist']); queryClient.setQueryData(['wishlist'], (current = { success: true, data: [] }) => ({ ...current, data: active ? (current.data || []).filter((entry) => (entry.productId || entry.product?.id) !== id) : [...(current.data || []), { id: `pending-${id}`, productId: id }] })); return { previous }; },
    onError: (_error, _variables, context) => { if (context?.previous) queryClient.setQueryData(['wishlist'], context.previous); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
  const items = products.data || []; const wishlistIds = new Set((wishlist.data || []).map((entry) => entry.productId || entry.product?.id)); const error = products.error || wishlistMutation.error;
  const handleFavorite = (item) => {
    if (!user) {
      navigate('/wishlist-access');
      return;
    }
    wishlistMutation.mutate({ id: item.id, active: wishlistIds.has(item.id) });
  };
  return <div className="py-2 sm:py-4">
    <section className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_25px_70px_-35px_rgba(37,99,235,.45)] sm:p-10 lg:p-14 ${mode === 'dark' ? 'bg-gradient-to-br from-blue-950 to-slate-900' : 'bg-gradient-to-br from-blue-50 to-violet-50'}`}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[24px] border-white/30 dark:border-blue-400/10" />
      <div className="relative max-w-2xl space-y-5"><p className="text-xs font-bold uppercase tracking-[.22em] text-blue-600 dark:text-blue-300">Discover your next favorite</p><h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Hello! Search for your needs and pick it up</h1><p className="max-w-lg text-base text-slate-600 dark:text-blue-100">Great things begin with great choices</p>
        <label className="relative block max-w-xl"><span className="sr-only">Search here</span><Icon name="search" size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search here" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-2xl border border-white/80 bg-white/85 py-3.5 pl-11 pr-4 shadow-lg shadow-blue-900/5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900/80" /></label>
      </div>
    </section>
    <div className="mt-6 flex flex-wrap gap-2">{(featureFlags.data || []).filter((flag) => flag.enabled).map((flag) => <Button key={flag.key} variant={filter === flag.key ? 'primary' : 'outline'} className="rounded-full" onClick={() => setFilter(filter === flag.key ? '' : flag.key)}>{flag.key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</Button>)}</div>
    {error ? <Alert severity="error" className="mt-5">{error.message || 'Unable to load the catalog right now. Please try again shortly.'}</Alert> : null}
    <CatalogSection title="Products" items={items} isLoading={products.isLoading} isError={products.isError} error={products.error} onRetry={() => products.refetch()} search={search} filter={filter} wishlistIds={wishlistIds} onFavorite={handleFavorite} />
  </div>;
}
