import type {RawUser, User} from '../domain/user.ts';
import {emailOf} from '../domain/email.ts';

export const validUserInput: RawUser = {
    id: 'u1',
    name: 'Lina',
    email: 'lina@beaulieu.fr',
    riderType: 'non-subscriber',
};

export const subValidRandUserInput: RawUser = {
    id: 'u1',
    name: 'Lina',
    email: 'lina@beaulieu.fr',
    riderType: 'subscriber',
};

export const subValidUserInput: User = { id: 'u1', name: 'Lina', email: emailOf('lina@beaulieu.fr'), riderType: 'subscriber' };