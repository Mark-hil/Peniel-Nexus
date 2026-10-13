export type OrderStatus =
  | 'received'
  | 'accepted'
  | 'shopping'
  | 'packing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'visa' | 'mastercard';

export interface OrderItem {
  id: string;
  name: string;
  budget: number;
  quantity?: string;
  notes?: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  shoppingBudget: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  gpsLocation: string;
  preferredTime: string;
  specialInstructions?: string;
  shopper?: string;
  rider?: string;
  createdAt: string;
  timeline: TimelineEvent[];
  deliveryPin?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  gps: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'suspended';
  joinedAt: string;
  address: string;
}

export interface Shopper {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  currentOrders: number;
  completedOrders: number;
  rating: number;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  currentOrders: number;
  completedOrders: number;
  rating: number;
  vehicle: string;
}

export interface Transaction {
  id: string;
  reference: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface MarketItem {
  name: string;
  emoji: string;
  category: string;
  price?: string;
}

export interface PopularItem {
  name: string;
  emoji: string;
  category: string;
  orders: number;
  revenue: number;
}

export interface Notification {
  id: string;
  type: 'order_accepted' | 'payment_successful' | 'shopper_assigned' | 'out_for_delivery' | 'delivered' | 'order_received' | 'received' | 'accepted' | 'shopping' | 'packing' | 'cancelled';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationState;
}

