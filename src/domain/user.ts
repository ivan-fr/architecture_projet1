import type { CustomerType } from './pricing.ts';

/** Un usager du service de vélos. */
export interface User {
  id: string;
  name: string;
  riderType: CustomerType;
}
