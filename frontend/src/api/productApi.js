import { api } from './client';

export const productApi = {
  listProducts: (category) => api.request(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProduct: (id) => api.request(`/products/${id}`),
  getProductBySlug: (slug) => api.request(`/products/slug/${encodeURIComponent(slug)}`),
  listAdminProducts: () => api.request('/admin/products?summary=true'),
  createProduct: (payload) => api.request('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => api.request(`/products/${id}`, { method: 'PATCH', body: payload }),
  deactivateProduct: (id) => api.request(`/products/${id}`, { method: 'DELETE' }),
  deleteProduct: (id) => api.request(`/products/${id}/permanent`, { method: 'DELETE' }),
  listCart: () => api.request('/cart'),
  addToCart: (productId, quantity = 1) => api.request('/cart', { method: 'POST', body: { productId, quantity } }),
  removeFromCart: (productId) => api.request(`/cart/${productId}`, { method: 'DELETE' }),
  listWishlist: () => api.request('/wishlist'),
  addToWishlist: (productId) => api.request(`/wishlist/${productId}`, { method: 'POST' }),
  removeFromWishlist: (productId) => api.request(`/wishlist/${productId}`, { method: 'DELETE' }),
};
