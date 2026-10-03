import type { OngoingRide } from '../ongoingRide.ts';

/** Ce que le métier demande au stockage des trajets en cours. */
export interface OngoingRideRepository {
  /** Le trajet en cours de cet usager, ou `undefined` s'il ne roule pas. */
  ofUser(userId: string): Promise<OngoingRide | undefined>;
  save(ride: OngoingRide): Promise<void>;
}
