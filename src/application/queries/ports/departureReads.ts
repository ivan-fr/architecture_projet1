/** Combien de trajets sont partis d'une station. Un compte, pas un agrégat. */
export interface StationDepartures {
  stationId: string;
  departures: number;
}

/** Le besoin de la question, pas du domaine : compter les départs d'une période, station par station. */
export interface DepartureReads {
  /** Toutes les stations connues, y compris celles sans départ (0), pour les départs de `[from, to]`. */
  between(from: Date, to: Date): Promise<StationDepartures[]>;
}
