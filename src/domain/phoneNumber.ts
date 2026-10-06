// Les séparateurs qu'on écrit couramment dans un numéro : ils ne comptent pas.
const SEPARATORS = /[\s.-]/g;
// Un + éventuel, puis de 10 à 15 chiffres : assez large pour les formats français et internationaux,
// assez strict pour refuser ce qui n'est pas un numéro (US 7 : aucune donnée absurde).
const LOOKS_LIKE_A_PHONE_NUMBER = /^\+?\d{10,15}$/;

/** Un numéro de téléphone vérifié. Il est conservé tel qu'il a été écrit ; le fournisseur SMS choisit son format. */
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

export function phoneNumberOf(raw: string): PhoneNumber {
  if (typeof raw !== 'string' || !LOOKS_LIKE_A_PHONE_NUMBER.test(raw.replace(SEPARATORS, ''))) {
    throw new Error(`"${raw}" is not a valid phone number`);
  }
  return raw as PhoneNumber;
}
