export function priceOf(minutes: number): number {
  const halfHours = Math.ceil(minutes / 30);
  return halfHours * 1;
}
