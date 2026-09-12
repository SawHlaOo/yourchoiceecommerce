import { Button, Icon } from './ui';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

export default function ProductCard({ item, isFavorite = false, onFavorite }) {
  const image = item?.image || item?.logo || FALLBACK_IMAGE;
  const title = item?.name || 'Untitled product';
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[.98] dark:border-slate-700 dark:bg-slate-900">
      <img className="h-32 w-full object-cover sm:h-64" loading="lazy" src={image} alt={title} />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        {item?.badge ? <span className="w-fit rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200 sm:px-2.5 sm:text-xs">{item.badge}</span> : null}
        <h2 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white sm:text-lg">{title}</h2>
        {item?.brand ? <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{item.brand}</p> : null}
        <div className="flex flex-wrap items-baseline gap-1.5">
          <strong className="text-sm sm:text-lg">MMK {Number(item?.price ?? 0).toFixed(2)}</strong>
          {item?.originalPrice > item?.price ? <del className="text-[10px] text-slate-500 sm:text-sm">${Number(item.originalPrice).toFixed(2)}</del> : null}
          {item?.discount ? <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">-{item.discount}%</span> : null}
        </div>
        <p className="hidden min-h-12 text-sm text-slate-600 dark:text-slate-300 sm:line-clamp-2 sm:block">{item?.description || 'Explore this item and see its details.'}</p>
        <div className="mt-auto flex items-center gap-1.5 sm:gap-2">
          <button type="button" aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onFavorite?.(item)} className={`rounded-lg p-1.5 transition hover:bg-slate-100 active:scale-90 dark:hover:bg-slate-800 ${isFavorite ? 'text-red-500' : ''}`}><Icon name={isFavorite ? 'heartFilled' : 'heart'} size={18} /></button>
          <Button variant="telegram" className="min-w-0 flex-1 whitespace-nowrap px-2 py-2 text-[10px] sm:px-4 sm:py-2 sm:text-sm" onClick={() => window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')}> buy in Telegram </Button>
        </div>
      </div>
    </article>
  );
}
