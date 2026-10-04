import computePrice from '../../application/uses-cases/computePrice';
import { CustomerType } from '../../domain/pricing';

export function printTicket(minutes: number, customerType: CustomerType) {
    const price = computePrice(minutes, customerType);
    return {
        minutes,
        customerType,
        price,
        label: `Ticket: ${price} €`
    };
}