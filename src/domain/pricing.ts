export type CustomerType = 'subscriber' | 'non-subscriber';

export function priceOfRide(minutes: number, riderType: CustomerType = 'non-subscriber'): number {
  if (minutes <= 0) return 0;

  const halfHours = Math.ceil(minutes / 30);
  const freeHalfHours = riderType === 'subscriber' ? 1 : 0;
  const billableHalfHours = Math.max(halfHours - freeHalfHours, 0);

  return billableHalfHours;
}
