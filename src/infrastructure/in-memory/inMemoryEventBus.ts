import type { StationBoundaryEvent } from '../../domain/events.ts';
import type { EventBus, StationListener } from '../../domain/ports/eventBus.ts';

/** Chaque auditeur est indépendant : un canal indisponible ne prive pas les autres du fait. */
export function inMemoryEventBus(): EventBus & { readonly failures: { event: StationBoundaryEvent; error: unknown }[] } {
  const listeners = new Set<StationListener>();
  const failures: { event: StationBoundaryEvent; error: unknown }[] = [];
  return {
    failures,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async publish(event) {
      for (const listener of [...listeners]) {
        try { await listener({ ...event }); }
        catch (error) { failures.push({ event: { ...event }, error }); }
      }
    },
  };
}
