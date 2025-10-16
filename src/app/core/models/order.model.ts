import { User } from './user.model';
import { Product } from './product.model';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Order Item as returned from backend
export interface OrderItem {
  id?: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: Date;
  updatedAt?: Date;
}
