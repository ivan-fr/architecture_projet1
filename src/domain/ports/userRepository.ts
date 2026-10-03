import type { User } from '../user.ts';

/** Ce que le métier demande au stockage des usagers. Il ne sait pas si c'est un fichier, une base ou la mémoire. */
export interface UserRepository {
  /** `undefined` pour un usager inconnu : une réponse, pas une erreur. C'est à l'appelant de décider si c'est grave. */
  byId(id: string): Promise<User | undefined>;
  /** Enregistre l'usager, ou remplace celui qui a le même identifiant. */
  add(user: User): Promise<void>;
}
