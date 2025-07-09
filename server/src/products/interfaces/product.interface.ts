export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  manufacturer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductResponse extends Product {
  formattedPrice: string;
  scannedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StockUpdateRequest {
  action: 'increase_stock' | 'decrease_stock';
  quantity: number;
}
