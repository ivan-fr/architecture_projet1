import type { PhoneNumber } from '../../domain/phoneNumber.ts';
import type { SmsSender } from '../../domain/ports/smsSender.ts';
import type { EventSubscriptions } from '../../domain/ports/eventBus.ts';

/** L'auditeur traduit le fait en SMS sans coupler le mouvement au fournisseur ni aux destinataires. */
export function regulationSms(
  events: EventSubscriptions,
  sender: SmsSender,
  agentPhoneNumbers: ReadonlyArray<PhoneNumber | undefined>,
): () => void {
  const recipients = [...new Set(agentPhoneNumbers.filter((phone): phone is PhoneNumber => phone !== undefined))];
  return events.subscribe(async (event) => {
    const state = event.type === 'StationEmpty' ? 'vide' : 'pleine';
    const results = await Promise.allSettled(recipients.map(async (to) => {
      await sender.send({
        to,
        body: `La station ${event.stationId} est devenue ${state}. Une intervention de régulation est nécessaire.`,
      });
    }));
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'regulation SMS delivery failed');
  });
}
