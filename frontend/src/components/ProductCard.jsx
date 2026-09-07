import { Button, Card, CardContent, CardMedia, Chip, IconButton, Stack, Typography } from '@mui/material';
import { FavoriteBorder, ShoppingBag } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL?.trim() || 'https://t.me/';

export default function ProductCard({ item, type = 'game' }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const image = item?.image || item?.logo || FALLBACK_IMAGE;
  const title = item?.name || 'Untitled product';

  return (
    <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 35px rgba(22,32,51,.12)' } }}>
      <div style={{ position: 'relative' }}>
        <CardMedia component="img" image={image} alt={title} height="220" sx={{ objectFit: 'cover' }} />
        {item?.badge ? <Chip label={item.badge} size="small" color="primary" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }} /> : null}
        <IconButton aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`} onClick={() => setSaved(!saved)} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}>
          <FavoriteBorder color={saved ? 'error' : 'inherit'} />
        </IconButton>
      </div>
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1.1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>Digital product</Typography>
        <Typography variant="h6" component="h2" fontWeight={800} sx={{ letterSpacing: '-.02em' }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 48 }}>
          {item?.description || 'Explore this item and see its details.'}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto', pt: 1 }}>
          <Typography variant="h6" fontWeight={900}>Contact for price</Typography>
          <Button onClick={() => navigate(`/product/${type}/${item?.id}`)} variant="contained" startIcon={<ShoppingBag />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>View</Button>
        </Stack>
        <Button component="a" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" variant="text" sx={{ alignSelf: 'flex-start', p: 0, textTransform: 'none' }}>Chat to buy on Telegram</Button>
      </CardContent>
    </Card>
  );
}
