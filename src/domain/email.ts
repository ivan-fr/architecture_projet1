// La seule définition d'une adresse du projet. Volontairement large : on refuse ce qui ne peut pas être une adresse,
// pas ce qui est rare (un + est permis). La seule vraie preuve qu'une adresse marche, c'est d'y écrire.
const LOOKS_LIKE_AN_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Une adresse vérifiée. C'est une chaîne, mais une chaîne « marquée » : seule `emailOf` peut en produire une.
 * Elle s'écrit et se relit telle quelle dans un fichier, sans conversion.
 */
export type Email = string & { readonly __brand: 'Email' };

export function emailOf(raw: string): Email {
  if (typeof raw !== 'string' || !LOOKS_LIKE_AN_EMAIL.test(raw)) throw new Error(`"${raw}" is not a valid email`);
  return raw as Email;
}
