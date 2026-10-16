import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutFormValues {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  paymentMethod: 'cod' | 'upi' | 'card';
}

export interface PlacedOrder {
  orderId: string;
  date: string;
  customer: CheckoutFormValues;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status?: 'Delivered' | 'Shipped' | 'Processing';
  returnRequest?: {
    returnId: string;
    reason: string;
    date: string;
    resolution: string;
  };
}
