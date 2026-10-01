export type CustomerType = 'subscriber' | 'non-subscriber';

export function priceOfRide(minutes: number,riderType:CustomerType): number {
if (minutes<=0) return 0;
  if (riderType === 'subscriber') {
    const billableMinutes = Math.max(minutes - 30, 0);
    return Math.ceil(billableMinutes / 30);
  }
  return Math.ceil(minutes / 30);
}
