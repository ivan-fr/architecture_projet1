import type { Email } from '../email.ts';

export interface Letter {
  to: Email;
  subject: string;
  body: string;
}

/** Ce que le métier demande au monde extérieur : faire partir une lettre. Il ne sait pas comment. */
export interface Mailer {
  send(letter: Letter): Promise<void>;
}
