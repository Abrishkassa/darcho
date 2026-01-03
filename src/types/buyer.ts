export interface BuyerProfile {
  id: number;
  userId: number;
  companyName: string | null;
  businessType: string | null;
  location: string | null;
  buyerType: string | null;
  website: string | null;
  taxId: string | null;
  annualPurchaseCapacity: number | null;
  preferredRegions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  grade: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description: string | null;
  originRegion: string;
  certifications: string[];
  farmer: {
    user: {
      fullName: string;
    };
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalPrice: number;
  orderDate: Date;
  product: Product;
}

export interface ChatConversation {
  farmerId: number;
  farmerName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  orderNumber: string | null;
}

export interface DashboardStats {
  totalOrders: number;
  cartItems: number;
  favorites: number;
  activeChats: number;
  totalSpent: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CartResponse {
  data: Order[];
  totalItems: number;
  totalPrice: number;
}

export interface DashboardResponse {
  data: {
    stats: DashboardStats;
    recentOrders: Order[];
    monthlyData: any[];
    topFarmers: any[];
    recommendedProducts: Product[];
    buyerProfile: BuyerProfile;
  };
}