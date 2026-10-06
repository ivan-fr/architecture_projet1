import type { PhoneNumber } from '../phoneNumber.ts';

export interface TextMessage {
  to: PhoneNumber;
  body: string;
}

/** Ce que le service demande au monde extérieur : envoyer un SMS. */
export interface SmsSender {
  send(message: TextMessage): Promise<void>;
}
