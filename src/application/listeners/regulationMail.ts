import type { Email } from '../../domain/email.ts';
import type { Mailer } from '../../domain/ports/mailer.ts';
import type { EventSubscriptions } from '../../domain/ports/eventBus.ts';
import { regulationNotice } from './regulationNotice.ts';

/** L'auditeur traduit le fait en lettre ; le mouvement ignore destinataires et fournisseurs. */
export function regulationMail(events: EventSubscriptions, mailer: Mailer, recipients: ReadonlyArray<Email>): () => void {
  const addresses = [...new Set(recipients)];
  return events.subscribe(async (event) => {
    const { subject, body } = regulationNotice(event);
    const results = await Promise.allSettled(addresses.map(async (to) => {
      await mailer.send({ to, subject, body });
    }));
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'regulation mail delivery failed');
  });
}
