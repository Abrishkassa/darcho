import { useState, useEffect } from 'react';
import { buyerApi } from '@/lib/api';
import { 
  Product, 
  Order, 
  DashboardStats, 
  ApiResponse, 
  ProductsResponse, 
  CartResponse, 
  DashboardResponse 
} from '@/types/buyer';

export function useBuyerProducts(params?: Record<string, string>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await buyerApi.getProducts(params) as ApiResponse<ProductsResponse>;
      
      if (response.success && response.data) {
        setProducts(response.data.data || []);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, pagination, refetch: fetchProducts };
}

export function useBuyerCart() {
  const [cart, setCart] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await buyerApi.getCart() as ApiResponse<CartResponse>;
      
      if (response.success && response.data) {
        setCart(response.data.data || []);
        setTotalPrice(response.data.totalPrice || 0);
        setTotalItems(response.data.totalItems || 0);
      } else {
        setError(response.error || 'Failed to fetch cart');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      const response = await buyerApi.addToCart(productId, quantity) as ApiResponse<any>;
      
      if (response.success) {
        await fetchCart();
        return true;
      } else {
        setError(response.error || 'Failed to add to cart');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await buyerApi.removeFromCart(itemId) as ApiResponse<any>;
      
      if (response.success) {
        await fetchCart();
        return true;
      } else {
        setError(response.error || 'Failed to remove from cart');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from cart');
      return false;
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { 
    cart, 
    loading, 
    error, 
    totalPrice, 
    totalItems, 
    addToCart, 
    removeFromCart, 
    refetch: fetchCart 
  };
}

export function useBuyerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await buyerApi.getDashboard() as ApiResponse<DashboardResponse>;
      
      if (response.success && response.data) {
        setStats(response.data.data.stats);
        setRecentOrders(response.data.data.recentOrders || []);
        setRecommendedProducts(response.data.data.recommendedProducts || []);
      } else {
        setError(response.error || 'Failed to fetch dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { 
    stats, 
    loading, 
    error, 
    recentOrders, 
    recommendedProducts, 
    refetch: fetchDashboard 
  };
}