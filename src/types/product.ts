export interface Product {
  id: string;
  name: string;
  category: 'Women\'s Clothing' | 'Men\'s Clothing' | 'Home & Kitchen' | 'Beauty & Personal Care' | 'Accessories';
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  ratingsCount: number;
  image: string;
  description: string;
  features?: string[];
  inStock: boolean;
  freeDelivery: boolean;
  deliveryDays?: number;
}

export type CategoryType = Product['category'] | 'All';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'discount-desc';
