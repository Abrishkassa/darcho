const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Buyer-specific API calls
export const buyerApi = {
  // Products
  getProducts: (params?: Record<string, string>) => 
    apiRequest(`/buyer/products?${new URLSearchParams(params)}`),
  
  getProduct: (id: number) => 
    apiRequest(`/buyer/products/${id}`),
  
  // Cart
  getCart: () => 
    apiRequest('/buyer/cart'),
  
  addToCart: (productId: number, quantity: number) => 
    apiRequest('/buyer/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  
  updateCartItem: (itemId: number, quantity: number) => 
    apiRequest(`/buyer/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  
  removeFromCart: (itemId: number) => 
    apiRequest(`/buyer/cart/${itemId}`, {
      method: 'DELETE',
    }),
  
  // Orders
  getOrders: (params?: Record<string, string>) => 
    apiRequest(`/buyer/orders?${new URLSearchParams(params)}`),
  
  placeOrder: (orderData: any) => 
    apiRequest('/buyer/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  
  // Favorites
  getFavorites: () => 
    apiRequest('/buyer/favorites'),
  
  addFavorite: (productId: number) => 
    apiRequest(`/buyer/favorites/${productId}`, {
      method: 'POST',
    }),
  
  removeFavorite: (productId: number) => 
    apiRequest(`/buyer/favorites/${productId}`, {
      method: 'DELETE',
    }),
  
  // Chats
  getChats: () => 
    apiRequest('/buyer/chats'),
  
  getChatMessages: (farmerId: number) => 
    apiRequest(`/buyer/chats/${farmerId}`),
  
  sendMessage: (farmerId: number, message: string, orderId?: number) => 
    apiRequest('/buyer/chats', {
      method: 'POST',
      body: JSON.stringify({ farmerId, message, orderId }),
    }),
  
  // Profile
  getProfile: () => 
    apiRequest('/buyer/profile'),
  
  updateProfile: (profileData: any) => 
    apiRequest('/buyer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  
  // Dashboard
  getDashboard: () => 
    apiRequest('/buyer/dashboard'),
};