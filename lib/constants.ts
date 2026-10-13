import type {
  MarketItem,
  Testimonial,
  FAQItem,
  PaymentMethod,
  OrderStatus,
} from '@/types';

export type { MarketItem };

// Common market item placeholder suggestions for quick selection
export const itemPlaceholders: MarketItem[] = [
  { name: 'Tomatoes', emoji: '🍅', category: 'Vegetables', price: 'Set your budget' },
  { name: 'Onion', emoji: '🧅', category: 'Vegetables', price: 'Set your budget' },
  { name: 'Pepper', emoji: '🌶️', category: 'Vegetables', price: 'Set your budget' },
  { name: 'Plantain', emoji: '🍌', category: 'Produce', price: 'Set your budget' },
  { name: 'Yam', emoji: '🍠', category: 'Produce', price: 'Set your budget' },
  { name: 'Fish', emoji: '🐟', category: 'Protein', price: 'Set your budget' },
  { name: 'Chicken', emoji: '🍗', category: 'Protein', price: 'Set your budget' },
  { name: 'Rice', emoji: '🍚', category: 'Staples', price: 'Set your budget' },
  { name: 'Eggs', emoji: '🥚', category: 'Dairy', price: 'Set your budget' },
];

// Placeholder items for quick-add buttons and landing page suggestions
export const popularItems: MarketItem[] = itemPlaceholders;

// Form input placeholder texts
export const orderFormPlaceholders = {
  itemName: 'e.g. Tomatoes, Fish, Yam',
  budget: '20',
  quantity: 'e.g. 2 heaps, 1 crate',
  notes: 'e.g. Fresh red ones, well ripened',
  specialInstructions: 'e.g. Call when you arrive at the gate',
  address: 'e.g. House 12, Spintex Road, Accra',
  phone: 'e.g. +233 24 555 0142',
};

export const testimonials: Testimonial[] = [
  {
    name: 'Ama Owusu',
    role: 'Marketing Manager, Accra',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'Peniel Nexus changed how I shop for groceries. I just say what I want and my budget — everything arrives fresh. It feels like having a personal shopper.',
  },
  {
    name: 'Kwame Mensah',
    role: 'Software Engineer, Kumasi',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'The budget-per-item model is genius. I always know exactly what I am spending. No surprises, no overspending. The delivery is always on time.',
  },
  {
    name: 'Akosua Asante',
    role: 'Restaurant Owner, Tema',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    quote:
      'I run a small chop bar and Peniel Nexus keeps my kitchen stocked. The shoppers pick the freshest produce every single time. My customers can taste the difference.',
  },
];

export const faqItems: FAQItem[] = [
  {
    question: 'How does Peniel Nexus work?',
    answer:
      'You create a shopping list, set a budget for each item, and choose a delivery time. Our personal shoppers go to the local market, buy your items within your budget, and a rider delivers them to your door.',
  },
  {
    question: 'What happens if an item costs less than my budget?',
    answer:
      'You only pay for what the shopper actually spends. If tomatoes cost GHS 12 but you budgeted GHS 20, you are charged GHS 12. Any unused budget is refunded to your wallet instantly.',
  },
  {
    question: 'What if an item is not available at the market?',
    answer:
      'Our shopper will call you to suggest a substitute or skip the item. You only pay for items that are actually purchased and delivered.',
  },
  {
    question: 'How are the fees calculated?',
    answer:
      'You pay your shopping budget plus a small service fee (10% of budget) and a flat delivery fee of GHS 15. There are no hidden charges — the total is shown before you checkout.',
  },
  {
    question: 'Which areas do you deliver to?',
    answer:
      'We currently deliver across Accra, Kumasi, and Tema. Enter your GPS location at checkout to confirm we cover your area. New zones are added every month.',
  },
  {
    question: 'How do I pay?',
    answer:
      'We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, Visa, and Mastercard. Payment is processed securely before the shopper begins.',
  },
];

export const paymentMethodLabels: Record<PaymentMethod | string, string> = {
  mtn_momo: 'MTN Mobile Money',
  telecel_cash: 'Telecel Cash',
  airteltigo: 'AirtelTigo Money',
  visa: 'Visa',
  mastercard: 'Mastercard',
};

export const statusLabels: Record<OrderStatus | string, string> = {
  received: 'Received',
  accepted: 'Accepted',
  shopping: 'Shopping',
  packing: 'Packing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
