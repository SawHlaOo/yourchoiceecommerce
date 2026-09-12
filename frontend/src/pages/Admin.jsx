import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { featureFlagApi } from '../api/featureFlagApi';
import { productApi } from '../api/productApi';
import { authApi } from '../api/authApi';
import { Alert, Button, Card, Field, Modal, Spinner } from '../components/ui';

const PRODUCT_BADGES = [{ value: '', label: 'No category' }, { value: 'Popular', label: 'Popular' }, { value: 'New arrivals', label: 'New arrivals' }, { value: 'Promotions', label: 'Promotions' }];
const emptyCardDraft = { name: '', description: '', image: '', price: '', originalPrice: '', brand: '', category: '', slug: '', badge: '', stock: 0, isActive: true };
const labelForFlag = (key) => key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const optionalText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const productCardPayload = (draft) => ({ name: typeof draft.name === 'string' ? draft.name.trim() : '', image: typeof draft.image === 'string' ? draft.image.trim() : '', description: optionalText(draft.description), brand: optionalText(draft.brand), category: optionalText(draft.category), slug: optionalText(draft.slug), badge: optionalText(draft.badge), price: Number(draft.price), originalPrice: draft.originalPrice === '' ? undefined : Number(draft.originalPrice), stock: Number(draft.stock) });
const resizeImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Unable to read the selected image.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('The selected file is not a valid image.'));
    image.onload = () => {
      let scale = Math.min(1, 800 / Math.max(image.width, image.height));
      let quality = 0.72;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to process the selected image.'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length <= 700 * 1024) {
          resolve(dataUrl);
          return;
        }
        if (quality > 0.48) quality -= 0.06;
        else scale *= 0.8;
      }
      reject(new Error('The selected image could not be compressed enough. Please choose a smaller image.'));
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function Toggle({ checked, disabled, onChange, label = 'Enabled' }) {
  return <label className="inline-flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-blue-600" checked={checked} disabled={disabled} onChange={onChange} /><span>{label}</span></label>;
}

export default function Admin() {
  const queryClient = useQueryClient(); const [open, setOpen] = useState(false); const [draft, setDraft] = useState({ key: '', enabled: false }); const [userDeleteId, setUserDeleteId] = useState(''); const [productCardDraft, setProductCardDraft] = useState(emptyCardDraft); const [selectedProductCard, setSelectedProductCard] = useState(null); const [openProductCard, setOpenProductCard] = useState(false);
  const { data: flags = [], isLoading: flagsLoading, error: flagsError } = useQuery({ queryKey: ['feature-flags-admin'], queryFn: featureFlagApi.list, select: (response) => response?.data ?? [] });
  const { data: productCards = [], isLoading: productCardsLoading, error: productCardsError } = useQuery({ queryKey: ['admin-products'], queryFn: productApi.listAdminProducts, select: (response) => response?.data ?? [] });
  const invalidateFlags = () => { queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] }); queryClient.invalidateQueries({ queryKey: ['feature-flags'] }); };
  const createMutation = useMutation({ mutationFn: featureFlagApi.create, onSuccess: () => { invalidateFlags(); setOpen(false); setDraft({ key: '', enabled: false }); } });
  const updateMutation = useMutation({ mutationFn: ({ key, payload }) => featureFlagApi.update(key, payload), onSuccess: invalidateFlags });
  const removeMutation = useMutation({ mutationFn: featureFlagApi.remove, onSuccess: invalidateFlags });
  const deleteUserMutation = useMutation({ mutationFn: (id) => authApi.deleteUser(id), onSuccess: () => setUserDeleteId('') });
  const refreshProducts = () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); queryClient.invalidateQueries({ queryKey: ['products'] }); };
  const productCardMutation = useMutation({ mutationFn: ({ id, payload }) => id ? productApi.updateProduct(id, payload) : productApi.createProduct(payload), onSuccess: () => { refreshProducts(); setSelectedProductCard(null); setProductCardDraft(emptyCardDraft); setOpenProductCard(false); } });
  const deactivateMutation = useMutation({ mutationFn: productApi.deactivateProduct, onSuccess: refreshProducts });
  const deleteProductMutation = useMutation({ mutationFn: productApi.deleteProduct, onSuccess: refreshProducts });
  const productCategoryOptions = [...PRODUCT_BADGES, ...flags.filter((flag) => flag.enabled && !PRODUCT_BADGES.some((option) => option.value.toLowerCase().replace(/\s/g, '_') === flag.key)).map((flag) => ({ value: labelForFlag(flag.key), label: labelForFlag(flag.key) }))];
  const errorMessage = flagsError?.message || productCardsError?.message || createMutation.error?.message || updateMutation.error?.message || removeMutation.error?.message || deleteUserMutation.error?.message || productCardMutation.error?.message || deactivateMutation.error?.message || deleteProductMutation.error?.message;
  const closeProductModal = () => { setOpenProductCard(false); setSelectedProductCard(null); setProductCardDraft(emptyCardDraft); };
  return <div className="py-4">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">Admin dashboard</h1><p className="text-slate-500">Manage feature flags, products, and admin tools.</p></div><Button onClick={() => setOpen(true)}>Create flag</Button></div>
    {errorMessage ? <Alert severity="error" className="mb-6">{errorMessage}</Alert> : null}
    <section className="mb-10"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold">Product cards</h2><p className="text-sm text-slate-500">Manage prices, stock, images, brands, categories, and status.</p></div><Button onClick={() => { setSelectedProductCard(null); setProductCardDraft(emptyCardDraft); setOpenProductCard(true); }}>New product card</Button></div>
      {productCardsLoading ? <Spinner /> : <div className="grid gap-4 md:grid-cols-2">{productCards.map((item) => <Card key={item.id} className="p-4"><div className="flex justify-between gap-3"><h3 className="font-bold">{item.name}</h3><span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></div><p className="mt-2 text-sm text-slate-500">${Number(item.price).toFixed(2)} · Stock: {item.stock} · {item.brand || 'No brand'}</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" className="px-3 py-1.5" onClick={() => { setSelectedProductCard(item.id); setProductCardDraft({ ...emptyCardDraft, ...item, description: item.description || '', brand: item.brand || '', category: item.category || '', slug: item.slug || '', badge: item.badge || '', image: item.image || '', price: item.price ?? '', originalPrice: item.originalPrice ?? '' }); setOpenProductCard(true); }}>Edit</Button>{item.isActive ? <Button variant="dangerOutline" className="px-3 py-1.5" onClick={() => deactivateMutation.mutate(item.id)}>Deactivate</Button> : null}<Button variant="dangerOutline" className="px-3 py-1.5" onClick={() => { if (window.confirm(`Delete "${item.name}" permanently?`)) deleteProductMutation.mutate(item.id); }}>Delete</Button></div></Card>)}</div>}
    </section>
    <section className="mb-10"><h2 className="text-2xl font-bold">Feature flags</h2><p className="mb-4 text-sm text-slate-500">Changes are saved to the server and visible to customers.</p>{flagsLoading ? <Spinner /> : <div className="grid gap-4 md:grid-cols-2">{flags.map((flag) => <Card key={flag.id} className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-bold">{flag.key}</h3><span className={`rounded-full px-2 py-1 text-xs font-semibold ${flag.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{flag.enabled ? 'Enabled' : 'Disabled'}</span></div><p className="my-3 text-sm text-slate-500">{flag.description || 'No description provided.'}</p><div className="flex items-center justify-between gap-2"><Toggle checked={Boolean(flag.enabled)} disabled={updateMutation.isPending} onChange={() => updateMutation.mutate({ key: flag.key, payload: { enabled: !flag.enabled } })} /><Button variant="dangerOutline" className="px-3 py-1.5" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(flag.key)}>Delete</Button></div></Card>)}</div>}</section>
    <section className="rounded-2xl border p-5"><h2 className="text-2xl font-bold">Debug / Admin user cleanup</h2><p className="my-2 text-sm text-slate-500">Enter a user ID to delete that account. This action is admin-only and useful for debugging.</p><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Field label="User ID" type="number" value={userDeleteId} onChange={(event) => setUserDeleteId(event.target.value)} className="sm:w-52" /><Button variant="danger" disabled={!userDeleteId || deleteUserMutation.isPending} onClick={() => deleteUserMutation.mutate(Number(userDeleteId))}>Delete user</Button></div></section>
    <Modal open={open} onClose={() => setOpen(false)} title="Create feature flag" actions={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!draft.key.trim() || createMutation.isPending} onClick={() => createMutation.mutate({ key: draft.key.trim().toLowerCase(), enabled: draft.enabled })}>Save</Button></>}><div className="space-y-4"><Field label="Flag key" placeholder="flash_sale" value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value.toLowerCase() })} /><Toggle checked={draft.enabled} onChange={() => setDraft({ ...draft, enabled: !draft.enabled })} /></div></Modal>
    <Modal open={openProductCard} onClose={closeProductModal} title={selectedProductCard ? 'Edit product card' : 'Create product card'} actions={<><Button variant="ghost" onClick={closeProductModal}>Cancel</Button><Button disabled={!productCardDraft.name || !productCardDraft.image || productCardDraft.price === '' || productCardDraft.stock === ''} onClick={() => productCardMutation.mutate({ id: selectedProductCard, payload: productCardPayload(productCardDraft) })}>Save</Button></>}>
      <div className="space-y-3">{[['name', 'Name'], ['brand', 'Brand'], ['category', 'Category'], ['slug', 'Slug'], ['price', 'Price'], ['originalPrice', 'Original price'], ['stock', 'Stock']].map(([field, label]) => <Field key={field} label={label} type={['price', 'originalPrice', 'stock'].includes(field) ? 'number' : 'text'} value={productCardDraft[field]} onChange={(event) => setProductCardDraft({ ...productCardDraft, [field]: event.target.value })} />)}<div><Field label="Image URL (optional)" placeholder="https://..." value={productCardDraft.image.startsWith('data:') ? '' : productCardDraft.image} onChange={(event) => setProductCardDraft({ ...productCardDraft, image: event.target.value })} /><label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200"><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 8 * 1024 * 1024) { window.alert('Please choose an image smaller than 8 MB.'); return; } try { const image = await resizeImage(file); setProductCardDraft({ ...productCardDraft, image }); } catch (error) { window.alert(error.message); } }} /><span>{productCardDraft.image.startsWith('data:') ? 'Image selected - choose another' : 'Upload image from device'}</span></label>{productCardDraft.image ? <img className="mt-3 h-36 w-full rounded-lg object-cover" src={productCardDraft.image} alt="Product preview" /> : null}</div><label className="block text-sm font-medium">Description<textarea className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 dark:bg-slate-900" rows="3" value={productCardDraft.description} onChange={(event) => setProductCardDraft({ ...productCardDraft, description: event.target.value })} /></label><label className="block text-sm font-medium">Product category<select className="mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 dark:bg-slate-900" value={productCardDraft.badge} onChange={(event) => setProductCardDraft({ ...productCardDraft, badge: event.target.value })}>{productCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><Toggle checked={Boolean(productCardDraft.isActive)} onChange={(event) => setProductCardDraft({ ...productCardDraft, isActive: event.target.checked })} label="Active" /></div>
    </Modal>
  </div>;
}
