import type { Station } from '../station.ts';

/** Ce que le métier demande au stockage des stations. Ce qui sort est une station, avec sa règle, pas une ligne de table. */
export interface StationRepository {
  /** `undefined` pour une station inconnue : une réponse, pas une erreur. */
  byId(id: string): Promise<Station | undefined>;
  /** Enregistre la station avec ses vélos, ou remplace celle qui a le même identifiant. */
  save(station: Station): Promise<void>;
}
