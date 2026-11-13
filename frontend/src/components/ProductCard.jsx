import { useNavigate } from 'react-router';
import { Button, Icon } from './ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

const slugify = (value) => String(value ?? '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'product';

export default function ProductCard({ item, isFavorite = false, onFavorite }) {
  const navigate = useNavigate();
  const image = item?.image || item?.logo || FALLBACK_IMAGE;
  const title = item?.name || 'Untitled product';
  const stock = Number(item?.stock ?? 0);
  const hasStock = stock > 0;
  const lowStock = hasStock && stock <= 5;

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-22px_rgba(15,23,42,.6)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_-24px_rgba(15,23,42,.55)] active:scale-[.98] dark:border-slate-700 dark:bg-slate-900">
      <div className="relative overflow-hidden bg-slate-100 p-2 dark:bg-slate-800/80 sm:p-3">
        <img className="h-44 w-full rounded-2xl object-contain transition duration-500 group-hover:scale-[1.03] sm:h-64" loading="lazy" src={image} alt={title} />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:gap-3 sm:p-5">
        {item?.badge ? <span className="w-fit rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-200 sm:text-xs">{item.badge}</span> : null}
        <h2 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900 dark:text-white sm:text-lg">{title}</h2>
        {item?.brand ? <p className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:block">{item.brand}</p> : null}
        <div className="flex flex-wrap items-baseline gap-2">
          <strong className="text-base font-black sm:text-xl">MMK {Number(item?.price ?? 0).toFixed(2)}</strong>
          {item?.originalPrice > item?.price ? <del className="text-[10px] text-slate-500 sm:text-sm">${Number(item.originalPrice).toFixed(2)}</del> : null}
          {item?.discount ? <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">-{item.discount}%</span> : null}
        </div>
        <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs ${hasStock ? (lowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200') : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200'}`}>
          {hasStock ? (lowStock ? `Only ${stock} left` : `In stock: ${stock}`) : 'Out of stock'}
        </span>
        <div className="mt-auto flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center sm:gap-2">
          <button type="button" aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onFavorite?.(item)} className={`order-3 self-center rounded-xl p-2 transition hover:bg-slate-100 hover:text-red-500 active:scale-90 sm:order-none ${isFavorite ? 'text-red-500' : 'text-slate-400'} dark:hover:bg-slate-800`}><Icon name={isFavorite ? 'heartFilled' : 'heart'} size={19} /></button>
          <Button variant="outline" className="min-w-0 flex-1 whitespace-nowrap px-2.5 text-[10px] sm:px-3 sm:text-sm" onClick={() => navigate(`/products/${encodeURIComponent(item?.slug || slugify(item?.name) || item?.id)}`)}>View Details</Button>
          <Button variant="telegram" className="min-w-0 flex-1 whitespace-nowrap px-2.5 text-[10px] sm:px-4 sm:text-sm" onClick={() => window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')}>Buy now</Button>
        </div>
      </div>
    </article>
  );
}
