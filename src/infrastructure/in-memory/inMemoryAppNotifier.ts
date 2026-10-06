import type { AppNotifier, StationAppNotification } from '../../domain/ports/appNotifier.ts';

/** Double local : collecte des notifications sans contacter de téléphone ni de fournisseur. */
export function inMemoryAppNotifier(): AppNotifier & { readonly notifications: ReadonlyArray<StationAppNotification> } {
  const notifications: StationAppNotification[] = [];
  return {
    get notifications() { return notifications.map((notification) => ({ ...notification })); },
    async send(notification) { notifications.push({ ...notification }); },
  };
}
