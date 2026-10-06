import type { Letter, Mailer } from '../../../domain/ports/mailer.ts';
import type { UserRepository } from '../../../domain/ports/userRepository.ts';
import { registration, type User } from '../../../domain/user.ts';
import type { RegisterUser } from './registerUser.command.ts';

interface Dependencies {
  users: UserRepository;
  mailer: Mailer;
}

function welcomeLetter(user: User): Letter {
  return {
    to: user.email,
    subject: 'Bienvenue sur les vélos de Beaulieu',
    body: `Bonjour ${user.name}, votre compte est prêt. Bonne route !`,
  };
}

/** S'inscrire : l'ordre des opérations, et rien d'autre. Les règles sont dans le domaine. */
export class RegisterUserHandler {
  readonly #users: UserRepository;
  readonly #mailer: Mailer;

  constructor({ users, mailer }: Dependencies) {
    this.#users = users;
    this.#mailer = mailer;
  }

  async handle(command: RegisterUser): Promise<void> {
    const existing = await this.#users.byId(command.id);
    const user = registration({ candidate: command, existing });

    await this.#users.add(user);
    // Le mail part après l'enregistrement, et seulement s'il a réussi : un refus n'envoie rien.
    await this.#mailer.send(welcomeLetter(user));
  }
}
