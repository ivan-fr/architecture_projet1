import type { StationBoundaryEvent } from '../events.ts';

/** La notification ne transporte que le destinataire et le fait qui l'intéresse. */
export interface StationAppNotification {
  userId: string;
  stationId: string;
  type: StationBoundaryEvent['type'];
}

/** Le fournisseur de notification appli est remplaçable, comme le mailer. */
export interface AppNotifier { send(notification: StationAppNotification): Promise<void>; }
