import { OrderStatus } from '@prisma/client';

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
  'REFUNDED'
];

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELED'],
  PAID: ['PACKED', 'REFUNDED', 'CANCELED'],
  PACKED: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELED: [],
  REFUNDED: []
};

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  return ORDER_TRANSITIONS[current]?.includes(next) ?? false;
}
