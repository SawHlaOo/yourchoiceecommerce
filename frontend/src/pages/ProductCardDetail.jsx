import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { productApi } from '../api/productApi';
import { Alert, Button, Card, Spinner } from '../components/ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';

export default function ProductCardDetail() {
  const { type, id, slug } = useParams();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const identifier = decodeURIComponent((slug || id || '').trim());

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', type, identifier],
    queryFn: () => {
      if (!type) return productApi.getProduct(identifier);
      if (type === 'game') return productApi.getGame(id);
      if (type === 'app') return productApi.getApp(id);
      if (type === 'powerpoint') return productApi.getPowerpoint(id);
      throw new Error('Unknown product type');
    },
    select: (response) => response?.data ?? response ?? null,
    enabled: Boolean(identifier),
  });

  const image = failed ? FALLBACK_IMAGE : (data?.image || data?.thumbnail || data?.logo || FALLBACK_IMAGE);
  const price = Number(data?.price ?? 0);
  const originalPrice = data?.originalPrice !== null && data?.originalPrice !== undefined ? Number(data.originalPrice) : null;
  const stock = Number(data?.stock ?? 0);
  const hasStock = stock > 0;
  const lowStock = hasStock && stock <= 5;
  const available = data?.isActive !== false;

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }

  if (error) {
    return <div className="mx-auto max-w-3xl py-8"><Alert severity="error">{error?.message || 'Unable to load this product right now.'}</Alert><div className="mt-4"><Button variant="outline" onClick={() => navigate('/')}>Back to catalog</Button></div></div>;
  }

  if (!data) {
    return <div className="mx-auto max-w-3xl py-8"><Alert severity="error">Product not found.</Alert><div className="mt-4"><Button variant="outline" onClick={() => navigate('/')}>Back to catalog</Button></div></div>;
  }

  if (!available) {
    return <div className="mx-auto max-w-3xl py-8"><Alert severity="warning">This product is currently unavailable.</Alert><div className="mt-4"><Button variant="outline" onClick={() => navigate('/')}>Back to catalog</Button></div></div>;
  }

  return (
    <div className="mx-auto max-w-5xl py-8">
      <Card className="overflow-hidden">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="bg-slate-100 dark:bg-slate-800">
            <img className="h-72 w-full object-cover sm:h-[28rem]" src={image} alt={data.name} onError={() => setFailed(true)} />
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black sm:text-4xl">{data.name}</h1>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{data.badge || data.category || 'Featured'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${hasStock ? (lowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200') : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200'}`}>
                {hasStock ? (lowStock ? `Only ${stock} left in stock` : `In stock: ${stock}`) : 'Out of stock'}
              </span>
              {data.category ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">{data.category}</span> : null}
              {data.brand ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">{data.brand}</span> : null}
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">MMK {price.toFixed(2)}</span>
              {originalPrice && originalPrice > price ? <del className="text-sm text-slate-500">MMK {originalPrice.toFixed(2)}</del> : null}
              {originalPrice && originalPrice > price ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">-{Math.round(((originalPrice - price) / originalPrice) * 100)}%</span> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/')}>Back to catalog</Button>
              {hasStock ? <Button variant="telegram" onClick={() => window.open(import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/', '_blank', 'noopener,noreferrer')}>Buy in Telegram</Button> : <Button variant="ghost" disabled>Unavailable</Button>}
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{data.description || 'A detailed view of this product.'}</p>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="block font-semibold text-slate-900 dark:text-white">Availability</span>{hasStock ? 'Available for order' : 'Currently unavailable'}</div>
              {data.stock !== undefined ? <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="block font-semibold text-slate-900 dark:text-white">Stock</span>{stock}</div> : null}
              {data.category ? <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="block font-semibold text-slate-900 dark:text-white">Category</span>{data.category}</div> : null}
              {data.brand ? <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="block font-semibold text-slate-900 dark:text-white">Brand</span>{data.brand}</div> : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
