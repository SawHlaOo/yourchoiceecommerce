import { Button, Card, CardContent, CardMedia, Chip, IconButton, Stack, Typography } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

export default function ProductCard({ item, isFavorite = false, onFavorite }) {
  const image = item?.image || item?.logo || FALLBACK_IMAGE;
  const title = item?.name || 'Untitled product';

  return (
    <Card
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left', backgroundColor: 'background.paper' }}
    >
      <CardMedia component="img" image={image} alt={title} height="260" sx={{ objectFit: 'cover' }} />
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1.25 }}>
        {item?.badge ? <Chip label={item.badge} size="small" sx={{ alignSelf: 'flex-start' }} /> : null}
        <Typography variant="h6" component="h2" fontWeight={700}>{title}</Typography>
        {item?.brand ? <Typography variant="body2" color="text.secondary">{item.brand}</Typography> : null}
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="h6" fontWeight={800}>${Number(item?.price ?? 0).toFixed(2)}</Typography>
          {item?.originalPrice > item?.price ? <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>${Number(item.originalPrice).toFixed(2)}</Typography> : null}
          {item?.discount ? <Chip size="small" color="success" label={`-${item.discount}%`} /> : null}
        </Stack>
        <Typography color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 48 }}>
          {item?.description || 'Explore this item and see its details.'}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
          <IconButton aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onFavorite?.(item)} color={isFavorite ? 'error' : 'default'}>
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Button component="a" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" variant="outlined">
            Go Telegram to buy
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
