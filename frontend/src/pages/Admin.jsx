import { useState } from 'react';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography, Stack, Alert } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { featureFlagApi } from '../api/featureFlagApi';
import { productApi } from '../api/productApi';
import { authApi } from '../api/authApi';

const PRODUCT_BADGES = [
  { value: '', label: 'No category' },
  { value: 'Popular', label: 'Popular' },
  { value: 'New arrivals', label: 'New arrivals' },
  { value: 'Promotions', label: 'Promotions' },
];

const emptyCardDraft = { name: '', description: '', image: '', price: '', originalPrice: '', brand: '', category: '', slug: '', badge: '', stock: 0, isActive: true };
const optionalText = (value) => value.trim() ? value.trim() : undefined;

const productCardPayload = (draft) => ({
  ...draft,
  name: draft.name.trim(),
  image: draft.image.trim(),
  description: optionalText(draft.description),
  brand: optionalText(draft.brand),
  category: optionalText(draft.category),
  slug: optionalText(draft.slug),
  badge: optionalText(draft.badge),
  price: Number(draft.price),
  originalPrice: draft.originalPrice === '' ? undefined : Number(draft.originalPrice),
  stock: Number(draft.stock),
});

export default function Admin() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ key: '', enabled: false, description: '' });
  const [userDeleteId, setUserDeleteId] = useState('');
  const [productCardDraft, setProductCardDraft] = useState(emptyCardDraft);
  const [selectedProductCard, setSelectedProductCard] = useState(null);
  const [openProductCard, setOpenProductCard] = useState(false);

  const { data: flags = [], isLoading: flagsLoading, error: flagsError } = useQuery({
    queryKey: ['feature-flags-admin'],
    queryFn: () => featureFlagApi.list(),
    select: (response) => response?.data ?? []
  });

  const { data: productCards = [], isLoading: productCardsLoading, error: productCardsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: productApi.listAdminProducts,
    select: (response) => response?.data ?? [],
  });
  
  
  const createMutation = useMutation({
    mutationFn: (payload) => featureFlagApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setOpen(false);
      setDraft({ key: '', enabled: false, description: '' });
    }
  });

  const productCardMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? productApi.updateProduct(id, payload) : productApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProductCard(null);
      setProductCardDraft(emptyCardDraft);
      setOpenProductCard(false);
    },
  });
  const productCardDeactivateMutation = useMutation({
    mutationFn: (id) => productApi.deactivateProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => authApi.deleteUser(id),
    onSuccess: () => {
      setUserDeleteId('');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, payload }) => featureFlagApi.update(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (key) => featureFlagApi.remove(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });

  const handleDeleteUser = () => {
    if (!userDeleteId) return;
    deleteUserMutation.mutate(Number(userDeleteId));
  };
 
 
 
  const errorMessage =
    flagsError?.message ||
    productCardsError?.message ||
    createMutation.error?.message ||
    updateMutation.error?.message ||
    removeMutation.error?.message ||
    deleteUserMutation.error?.message ||
    productCardMutation.error?.message ||
    productCardDeactivateMutation.error?.message ||
    null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Admin dashboard</Typography>
          <Typography color="text.secondary">Manage feature flags, products, and admin tools.</Typography>
        </Box>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" onClick={() => setOpen(true)}>Create flag</Button>
        </Stack>
      </Stack>

      {errorMessage ? <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert> : null}

      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Product cards</Typography>
            <Typography color="text.secondary">Manage prices, stock, images, brands, categories, and status.</Typography>
          </Box>
          <Button variant="contained" onClick={() => { setSelectedProductCard(null); setProductCardDraft(emptyCardDraft); setOpenProductCard(true); }}>New product card</Button>
        </Stack>
        {productCardsLoading ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {productCards.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">{item.name}</Typography>
                      <Chip label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} size="small" />
                    </Stack>
                    <Typography>${Number(item.price).toFixed(2)} · Stock: {item.stock} · {item.brand || 'No brand'}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small" onClick={() => { setSelectedProductCard(item.id); setProductCardDraft({ ...emptyCardDraft, ...item, price: item.price ?? '', originalPrice: item.originalPrice ?? '' }); setOpenProductCard(true); }}>Edit</Button>
                      {item.isActive ? <Button size="small" color="error" onClick={() => productCardDeactivateMutation.mutate(item.id)}>Deactivate</Button> : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Feature flags</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Changes are saved to the server and visible to customers.</Typography>

        {flagsLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {flags.map((flag) => (
              <Grid item xs={12} md={6} key={flag.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="h6">{flag.key}</Typography>
                      <Chip label={flag.enabled ? 'Enabled' : 'Disabled'} color={flag.enabled ? 'success' : 'default'} />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>{flag.description || 'No description provided.'}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(flag.enabled)}
                            disabled={updateMutation.isPending}
                            onChange={() => updateMutation.mutate({ key: flag.key, payload: { enabled: !flag.enabled } })}
                          />
                        }
                        label="Enabled"
                      />
                      <Button size="small" variant="outlined" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(flag.key)}>Delete</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
 
 
      <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Debug / Admin user cleanup</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Enter a user ID to delete that account. This action is admin-only and useful for debugging.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="User ID"
            value={userDeleteId}
            onChange={(event) => setUserDeleteId(event.target.value)}
            type="number"
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <Button
            variant="contained"
            color="error"
            disabled={!userDeleteId || deleteUserMutation.isPending}
            onClick={handleDeleteUser}
          >
            Delete user
          </Button>
        </Stack>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create feature flag</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Key" value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} />
            <TextField label="Description" multiline minRows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <FormControlLabel control={<Switch checked={draft.enabled} onChange={() => setDraft({ ...draft, enabled: !draft.enabled })} />} label="Enabled" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate({ key: draft.key, description: draft.description, enabled: draft.enabled })}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openProductCard} onClose={() => { setOpenProductCard(false); setSelectedProductCard(null); setProductCardDraft(emptyCardDraft); }} fullWidth maxWidth="sm">
        <DialogTitle>{selectedProductCard ? 'Edit product card' : 'Create product card'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {[
              ['name', 'Name'], ['image', 'Image URL'], ['brand', 'Brand'], ['category', 'Category'], ['slug', 'Slug'],
              ['price', 'Price'], ['originalPrice', 'Original price'], ['stock', 'Stock'],
            ].map(([field, label]) => <TextField key={field} label={label} type={['price', 'originalPrice', 'stock'].includes(field) ? 'number' : 'text'} value={productCardDraft[field]} onChange={(event) => setProductCardDraft({ ...productCardDraft, [field]: event.target.value })} required={['name', 'image', 'price', 'stock'].includes(field)} />)}
            <TextField label="Description" multiline minRows={2} value={productCardDraft.description} onChange={(event) => setProductCardDraft({ ...productCardDraft, description: event.target.value })} />
            <FormControl fullWidth>
              <InputLabel id="product-card-badge-label">Product category</InputLabel>
              <Select
                labelId="product-card-badge-label"
                value={productCardDraft.badge}
                label="Product category"
                onChange={(event) => setProductCardDraft({ ...productCardDraft, badge: event.target.value })}
              >
                {PRODUCT_BADGES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={Boolean(productCardDraft.isActive)} onChange={(event) => setProductCardDraft({ ...productCardDraft, isActive: event.target.checked })} />} label="Active" />
          </Stack>
        </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenProductCard(false); setSelectedProductCard(null); setProductCardDraft(emptyCardDraft); }}>Cancel</Button>
          <Button variant="contained" disabled={!productCardDraft.name || !productCardDraft.image || productCardDraft.price === '' || productCardDraft.stock === ''} onClick={() => productCardMutation.mutate({ id: selectedProductCard, payload: productCardPayload(productCardDraft) })}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
 
