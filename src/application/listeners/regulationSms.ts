import type { PhoneNumber } from '../../domain/phoneNumber.ts';
import type { SmsSender } from '../../domain/ports/smsSender.ts';
import type { EventSubscriptions } from '../../domain/ports/eventBus.ts';
import { regulationNotice } from './regulationNotice.ts';

/** L'auditeur traduit le fait en SMS sans coupler le mouvement au fournisseur ni aux destinataires. */
export function regulationSms(
  events: EventSubscriptions,
  sender: SmsSender,
  agentPhoneNumbers: ReadonlyArray<PhoneNumber | undefined>,
): () => void {
  const recipients = [...new Set(agentPhoneNumbers.filter((phone): phone is PhoneNumber => phone !== undefined))];
  return events.subscribe(async (event) => {
    const { body } = regulationNotice(event);
    const results = await Promise.allSettled(recipients.map(async (to) => {
      await sender.send({ to, body });
    }));
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'regulation SMS delivery failed');
  });
}
