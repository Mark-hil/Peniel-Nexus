import type {
  MarketItem,
  Testimonial,
  FAQItem,
  PaymentMethod,
  OrderStatus,
  Notification,
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

// Initial Notification feeds for respective roles
export const customerNotifications: Notification[] = [
  {
    id: 'cn-1',
    type: 'out_for_delivery',
    title: 'Out for Delivery',
    message: 'Your order PN-2026-1006 is on the way. Kofi Boateng will arrive in ~25 min.',
    timestamp: '11:00 AM',
    read: false,
  },
  {
    id: 'cn-2',
    type: 'shopper_assigned',
    title: 'Shopper Assigned',
    message: 'Yaw Mensah is now shopping for your order PN-2026-1006.',
    timestamp: '9:10 AM',
    read: false,
  },
  {
    id: 'cn-3',
    type: 'order_accepted',
    title: 'Order Accepted',
    message: 'We accepted your order and will start market shopping shortly.',
    timestamp: '8:35 AM',
    read: true,
  },
  {
    id: 'cn-4',
    type: 'payment_successful',
    title: 'Payment Successful',
    message: 'Mobile Money payment confirmed for order.',
    timestamp: '8:32 AM',
    read: true,
  },
  {
    id: 'cn-5',
    type: 'delivered',
    title: 'Order Delivered',
    message: 'Your fresh groceries have been delivered. Enjoy!',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'cn-6',
    type: 'payment_successful',
    title: 'Refund Processed',
    message: 'GHS 12.00 price difference refunded to your mobile money wallet.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'cn-7',
    type: 'delivered',
    title: 'Order Delivered',
    message: 'Order PN-2026-1002 was successfully delivered to Spintex.',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: 'cn-8',
    type: 'order_accepted',
    title: 'Order Confirmed',
    message: 'Order PN-2026-1001 confirmed by market operations.',
    timestamp: '4 days ago',
    read: true,
  },
  {
    id: 'cn-9',
    type: 'payment_successful',
    title: 'Card Payment Received',
    message: 'Visa payment verified for weekend grocery run.',
    timestamp: '5 days ago',
    read: true,
  },
  {
    id: 'cn-10',
    type: 'delivered',
    title: 'Order Completed',
    message: 'Thank you for choosing Peniel Nexus. Rate your shopper!',
    timestamp: '1 week ago',
    read: true,
  },
];

export const shopperNotifications: Notification[] = [
  {
    id: 'sn-1',
    type: 'order_received',
    title: 'New Market Order Available',
    message: 'New order waiting for acceptance in Makola Market zone (Budget: GHS 85.00).',
    timestamp: '10:45 AM',
    read: false,
  },
  {
    id: 'sn-2',
    type: 'shopping',
    title: 'Order Shopping Confirmed',
    message: 'You started shopping for order PN-2026-1006. Check off items as you buy.',
    timestamp: '9:15 AM',
    read: false,
  },
  {
    id: 'sn-3',
    type: 'packing',
    title: 'Order Ready for Pickup',
    message: 'Order PN-2026-1005 packed and transferred to Rider Pickup Queue.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'sn-4',
    type: 'payment_successful',
    title: 'Shopping Payout Credited',
    message: 'Commission of GHS 35.00 has been credited to your shopper wallet.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'sn-5',
    type: 'delivered',
    title: 'Shopping Run Complete',
    message: 'Order PN-2026-1003 delivered. Rating 5/5 received.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'sn-6',
    type: 'payment_successful',
    title: 'Weekly Payout Ready',
    message: 'GHS 318.00 payout processed to your registered mobile money account.',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: 'sn-7',
    type: 'order_received',
    title: 'Zone Incentive Active',
    message: 'Earn an extra GHS 5.00 bonus per completed basket in Kaneshie zone.',
    timestamp: '4 days ago',
    read: true,
  },
];

export const riderNotifications: Notification[] = [
  {
    id: 'rn-1',
    type: 'packing',
    title: 'Package Ready for Pickup',
    message: 'Order PN-2026-1006 is packed and waiting in your Pickup Queue.',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 'rn-2',
    type: 'order_received',
    title: 'Pickup Location Updated',
    message: 'Shopper packed groceries at Makola Market. Head to station for collection.',
    timestamp: '10:30 AM',
    read: true,
  },
  {
    id: 'rn-3',
    type: 'delivered',
    title: 'Delivery Completed',
    message: 'Order PN-2026-1004 marked delivered via PIN code verification.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'rn-4',
    type: 'payment_successful',
    title: 'Delivery Fee Payout',
    message: 'GHS 25.00 delivery earnings credited to your rider account.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'rn-5',
    type: 'delivered',
    title: 'Customer Rating Received',
    message: 'Customer Ama rated your delivery 5 stars with a tip!',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'rn-6',
    type: 'payment_successful',
    title: 'Weekly Fuel Allowance',
    message: 'GHS 50.00 fuel and maintenance stipend has been disbursed.',
    timestamp: '3 days ago',
    read: true,
  },
];

export const adminNotifications: Notification[] = [
  {
    id: 'an-1',
    type: 'order_received',
    title: 'High Volume Alert',
    message: '3 new orders received across Accra & Spintex zones in the last 30 minutes.',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 'an-2',
    type: 'payment_successful',
    title: 'MoMo Settlement Reconciled',
    message: 'All pending MTN MoMo transactions processed successfully.',
    timestamp: '9:00 AM',
    read: false,
  },
  {
    id: 'an-3',
    type: 'delivered',
    title: 'Daily Target Reached',
    message: '98% on-time delivery rate achieved today with 0 customer escalations.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'an-4',
    type: 'shopper_assigned',
    title: 'Shopper Onboarding Request',
    message: 'New shopper application submitted from Kumasi zone awaiting verification.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'an-5',
    type: 'out_for_delivery',
    title: 'Dispatch Capacity High',
    message: '8 active riders currently delivering across Accra central.',
    timestamp: '2 days ago',
    read: true,
  },
];

export const fieldStaffNotifications: Notification[] = [
  {
    id: 'fn1',
    type: 'order_accepted',
    title: 'New Order Available',
    message: 'Order PN-2024-1043 is ready to be picked up at Makola Market.',
    timestamp: '5 min ago',
    read: false,
  },
  {
    id: 'fn2',
    type: 'shopper_assigned',
    title: 'Order Packed',
    message: 'Order PN-2024-1040 is packed and ready for pickup.',
    timestamp: '12 min ago',
    read: false,
  },
  {
    id: 'fn3',
    type: 'out_for_delivery',
    title: 'Pickup Confirmed',
    message: 'You picked up order PN-2024-1042. Head to Spintex Road.',
    timestamp: '25 min ago',
    read: false,
  },
  {
    id: 'fn4',
    type: 'delivered',
    title: 'Delivery Completed',
    message: 'Order PN-2024-1038 was delivered. GHS 15.00 earned.',
    timestamp: '1 hr ago',
    read: true,
  },
  {
    id: 'fn5',
    type: 'payment_successful',
    title: 'Payout Processed',
    message: 'GHS 285.00 has been sent to your MTN MoMo account.',
    timestamp: 'Yesterday',
    read: true,
  },
];

export function getDefaultNotificationsForRole(role?: string): Notification[] {
  switch (role) {
    case 'shopper':
      return shopperNotifications;
    case 'rider':
      return riderNotifications;
    case 'admin':
      return adminNotifications;
    default:
      return customerNotifications;
  }
}
