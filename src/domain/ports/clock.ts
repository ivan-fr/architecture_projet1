/** Ce que le métier demande au monde extérieur : l'heure qu'il est. Il ne va pas la chercher lui-même. */
export interface Clock {
  now(): Date;
}
