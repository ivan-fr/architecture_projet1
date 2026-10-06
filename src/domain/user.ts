import { emailOf, type Email } from './email.ts';
import type { CustomerType } from './pricing.ts';

/** Un usager du service de vélos. */
export interface User {
  id: string;
  name: string;
  email: Email;
  riderType: CustomerType;
}

const RIDER_TYPES: ReadonlyArray<string> = ['subscriber', 'non-subscriber'] satisfies CustomerType[];

/** Un usager tel qu'il arrive du dehors (formulaire, fichier) : rien n'y est encore vérifié. */
export interface RawUser {
  id: string;
  name: string;
  email: string;
  riderType: string;
}

const isFilled = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/** Le seul chemin des données brutes vers un usager : ce qui ne peut pas en être un est refusé ici. */
export function userOf({ id, name, email, riderType }: RawUser): User {
  if (!isFilled(id)) throw new Error('a user needs an id');
  if (!isFilled(name)) throw new Error(`user ${id} needs a name`);
  if (!RIDER_TYPES.includes(riderType)) throw new Error(`unknown rider type "${riderType}" for user ${id}`);
  return { id, name, email: emailOf(email), riderType: riderType as CustomerType };
}

/** La règle de l'inscription : on ne s'inscrit qu'une fois. */
export function registration({ candidate, existing }: { candidate: RawUser; existing: User | undefined }): User {
  if (existing) throw new Error(`user ${existing.id} is already registered`);
  return userOf(candidate);
}
