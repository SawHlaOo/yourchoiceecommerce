import { Button, Icon } from './ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

export default function ProductCard({ item, isFavorite = false, onFavorite }) {
  const image = item?.image || item?.logo || FALLBACK_IMAGE;
  const title = item?.name || 'Untitled product';
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
      <img className="h-64 w-full object-cover" src={image} alt={title} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {item?.badge ? <span className="w-fit rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{item.badge}</span> : null}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {item?.brand ? <p className="text-sm text-slate-500 dark:text-slate-400">{item.brand}</p> : null}
        <div className="flex items-baseline gap-2">
          <strong className="text-lg">${Number(item?.price ?? 0).toFixed(2)}</strong>
          {item?.originalPrice > item?.price ? <del className="text-sm text-slate-500">${Number(item.originalPrice).toFixed(2)}</del> : null}
          {item?.discount ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">-{item.discount}%</span> : null}
        </div>
        <p className="line-clamp-2 min-h-12 text-sm text-slate-600 dark:text-slate-300">{item?.description || 'Explore this item and see its details.'}</p>
        <div className="mt-auto flex items-center gap-2">
          <button type="button" aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onFavorite?.(item)} className={`rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${isFavorite ? 'text-red-500' : ''}`}><Icon name={isFavorite ? 'heartFilled' : 'heart'} /></button>
          <Button variant="telegram" className="flex-1" onClick={() => window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')}>Go Telegram to buy</Button>
        </div>
      </div>
    </article>
  );
}
