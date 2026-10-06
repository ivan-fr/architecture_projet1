import { Station } from '../domain/station.ts';
import { userOf, type RawUser, type User } from '../domain/user.ts';

/**
 * Des objets de test qui ne disent que ce qui compte pour le test. Tout le reste a une valeur par défaut valide.
 * Un champ obligatoire de plus sur un usager s'ajoute ici, et seulement ici (demande 17).
 */

/** Une adresse déduite du nom : « Lina » donne lina@beaulieu.fr, « Théo » donne theo@beaulieu.fr. */
function emailFrom(name: string, id: string): string {
  const local = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${local || id || 'usager'}@beaulieu.fr`;
}

class UserBuilder {
  #id = 'u1';
  #name = 'Lina';
  #email: string | undefined;
  #riderType = 'subscriber';

  withId(id: string): this {
    this.#id = id;
    return this;
  }

  named(name: string): this {
    this.#name = name;
    return this;
  }

  withEmail(email: string): this {
    this.#email = email;
    return this;
  }

  nonSubscriber(): this {
    this.#riderType = 'non-subscriber';
    return this;
  }

  /** Un type d'usager quelconque, y compris inconnu, pour tester un refus. */
  withRiderType(riderType: string): this {
    this.#riderType = riderType;
    return this;
  }

  /** Les données brutes, telles qu'un formulaire ou un fichier les donnerait. */
  raw(): RawUser {
    return { id: this.#id, name: this.#name, email: this.#email ?? emailFrom(this.#name, this.#id), riderType: this.#riderType };
  }

  /** Un usager vérifié par le domaine : le cas normal. */
  build(): User {
    return userOf(this.raw());
  }

  /** Un usager volontairement invalide, pour vérifier qu'un stockage le refuse. */
  unchecked(): User {
    return this.raw() as unknown as User;
  }
}

class StationBuilder {
  #id = 'gare';
  #docks = 20;
  #bikes: string[] = [];
  #full = false;

  withId(id: string): this {
    this.#id = id;
    return this;
  }

  withDocks(docks: number): this {
    this.#docks = docks;
    return this;
  }

  /** Des vélos numérotés b1, b2… à quai. */
  withBikes(count: number): this {
    this.#bikes = Array.from({ length: count }, (_, index) => `b${index + 1}`);
    return this;
  }

  /** Autant de vélos que de bornes, quel que soit le nombre de bornes. */
  full(): this {
    this.#full = true;
    return this;
  }

  /** Passe par Station.of : un builder ne contourne aucune règle. */
  build(): Station {
    const bikes = this.#full ? Array.from({ length: this.#docks }, (_, index) => `b${index + 1}`) : this.#bikes;
    return Station.of({ id: this.#id, docks: this.#docks, bikes });
  }
}

export const aUser = () => new UserBuilder();
export const aStation = () => new StationBuilder();
