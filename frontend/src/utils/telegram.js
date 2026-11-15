const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

export function getTelegramProductUrl(productId) {
  if (productId === undefined || productId === null) return TELEGRAM_URL;

  const url = new URL(TELEGRAM_URL);
  url.searchParams.set('start', `product_${productId}`);
  return url.toString();
}
