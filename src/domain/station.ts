interface StationData {
  id: string;
  /** Le nombre de bornes : autant de vélos au plus. */
  docks: number;
  /** Les vélos déjà à quai, pour reconstruire une station lue quelque part. */
  bikes?: ReadonlyArray<string>;
}

/**
 * Une station et sa règle : jamais plus de vélos que de bornes. Personne d'autre qu'elle ne décide
 * qui entre ou sort : la liste des vélos est privée, et ne change que par `returnBike` et `takeBike`.
 */
export class Station {
  readonly id: string;
  readonly docks: number;
  readonly #bikes: string[] = [];

  /** Privé : la seule façon d'obtenir une station passe par `Station.of`, qui vérifie. */
  private constructor(id: string, docks: number) {
    this.id = id;
    this.docks = docks;
  }

  static of({ id, docks, bikes = [] }: StationData): Station {
    if (typeof id !== 'string' || id.trim() === '') throw new Error('a station needs an id');
    if (!Number.isInteger(docks) || docks <= 0) throw new Error(`station ${id} needs a whole, positive number of docks`);
    const station = new Station(id, docks);
    // Une station relue d'un stockage n'est pas crue sur parole : chaque vélo repasse par la règle.
    for (const bikeId of bikes) station.returnBike(bikeId);
    return station;
  }

  /** Les bornes libres ne se stockent pas : elles se comptent. */
  get freeDocks(): number {
    return this.docks - this.#bikes.length;
  }

  /** Une copie : celui qui la modifie ne modifie que la sienne. */
  get bikes(): ReadonlyArray<string> {
    return [...this.#bikes];
  }

  /** Un vélo rendu occupe une borne. Une station pleine le refuse, et ne change pas. */
  returnBike(bikeId: string): void {
    if (this.#bikes.includes(bikeId)) throw new Error(`bike ${bikeId} is already docked at station ${this.id}`);
    if (this.freeDocks <= 0) throw new Error(`station ${this.id} is full`);
    this.#bikes.push(bikeId);
  }

  /** Un vélo pris libère une borne. On ne prend rien dans une station vide. */
  takeBike(): string {
    const bikeId = this.#bikes.shift();
    if (bikeId === undefined) throw new Error(`station ${this.id} is empty`);
    return bikeId;
  }
}
