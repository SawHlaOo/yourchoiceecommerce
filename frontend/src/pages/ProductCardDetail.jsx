import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { productApi } from '../api/productApi';
import { Alert, Button, Card, Spinner } from '../components/ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
export default function ProductCardDetail() {
  const { type, id } = useParams(); const navigate = useNavigate(); const [failed, setFailed] = useState(false);
  const { data, isLoading, error } = useQuery({ queryKey: ['product', type, id], queryFn: () => { if (!type) return productApi.getProduct(id); if (type === 'game') return productApi.getGame(id); if (type === 'app') return productApi.getApp(id); if (type === 'powerpoint') return productApi.getPowerpoint(id); throw new Error('Unknown product type'); }, select: (response) => response?.data ?? response ?? null, enabled: Boolean(id) });
  const image = failed ? FALLBACK_IMAGE : (data?.image || FALLBACK_IMAGE);
  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error || !data) return <Alert severity="error">{error?.message || 'Product not found'}</Alert>;
  return <div className="mx-auto max-w-3xl py-8"><Card className="overflow-hidden"><img className="h-72 w-full object-cover sm:h-96" src={image} alt={data.name} onError={() => setFailed(true)} /><div className="space-y-3 p-6"><div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-bold">{data.name}</h1><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{data.badge || 'Featured'}</span></div><Button variant="outline" onClick={() => navigate('/')}>Back to catalog</Button><p className="text-slate-600 dark:text-slate-300">{data.description || 'A detailed view of this product.'}</p><p className="text-xs text-slate-500">{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recently added'}</p></div></Card></div>;
}
