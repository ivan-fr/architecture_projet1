const CENTS_PER_EURO = 100;
// Les euros arrivent en flottant : 1,2 × 100 ne tombe pas toujours juste en binaire.
const ROUNDING_SLACK = 1e-6;

/** Un montant. Toujours positif, toujours un nombre entier de centimes. */
export class Money {
  readonly #cents: number;

  private constructor(cents: number) {
    if (!Number.isInteger(cents)) throw new Error(`${cents} is not a whole number of cents`);
    if (cents < 0) throw new Error('an amount cannot be negative');
    this.#cents = cents;
  }

  static cents(value: number): Money {
    return new Money(value);
  }

  static euros(value: number): Money {
    const exact = value * CENTS_PER_EURO;
    const rounded = Math.round(exact);
    if (Math.abs(exact - rounded) > ROUNDING_SLACK) throw new Error(`${value} EUR is not a whole number of cents`);
    return new Money(rounded);
  }

  get cents(): number {
    return this.#cents;
  }

  plus(other: Money): Money {
    return new Money(this.#cents + other.#cents);
  }

  times(count: number): Money {
    return new Money(this.#cents * count);
  }

  equals(other: Money): boolean {
    return this.#cents === other.#cents;
  }

  /** L'affichage du ticket et de la facture : `1,20 €`. */
  toString(): string {
    const euros = Math.floor(this.#cents / CENTS_PER_EURO);
    const cents = String(this.#cents % CENTS_PER_EURO).padStart(2, '0');
    return `${euros},${cents} €`;
  }
}
