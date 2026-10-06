/** Un numéro de téléphone vérifié. La validation ne préjuge pas du format utilisé par le fournisseur SMS. */
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

export function phoneNumberOf(raw: string): PhoneNumber {
  if (typeof raw !== 'string' || raw.trim() === '') throw new Error('a phone number cannot be empty');
  return raw as PhoneNumber;
}
