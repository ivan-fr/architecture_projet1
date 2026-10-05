const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/** Au-delà, un vélo qui n'est pas revenu est déclaré perdu, et on lance sa recherche. */
const LOST_AFTER_HOURS = 24;

export type TakenBikeStatus = 'in-ride' | 'lost';

/**
 * Où en est un vélo sorti de sa station. La règle reçoit l'heure qu'il est, elle ne va pas la chercher :
 * c'est ce qui rend son test identique, quel que soit le jour où on le lance.
 */
export function statusOfTakenBike(takenAt: Date, now: Date): TakenBikeStatus {
  // Le vélo n'est pas rendu : aucune heure de fin ici. Une prise après « maintenant » est une donnée absurde.
  if (now.getTime() < takenAt.getTime()) throw new Error('a bike cannot be taken in the future');
  const hoursAway = (now.getTime() - takenAt.getTime()) / MILLISECONDS_PER_HOUR;
  return hoursAway >= LOST_AFTER_HOURS ? 'lost' : 'in-ride';
}
