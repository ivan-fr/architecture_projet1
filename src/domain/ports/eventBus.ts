import type { StationBoundaryEvent } from '../events.ts';

export type StationListener = (event: StationBoundaryEvent) => Promise<void>;
export interface EventPublisher { publish(event: StationBoundaryEvent): Promise<void>; }
export interface EventSubscriptions { subscribe(listener: StationListener): () => void; }
export interface EventBus extends EventPublisher, EventSubscriptions {}
