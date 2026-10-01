export function priceOfRide(minutes: number): number {
  if (minutes<=0) return 0;
  return Math.ceil(minutes / 30);
}
