/** Un fait métier, sans destinataire ni détail d'envoi. */
export interface StationBoundaryEvent {
  type: 'StationEmpty' | 'StationFull';
  stationId: string;
}
