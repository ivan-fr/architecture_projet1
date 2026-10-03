import test, { after, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { User } from '../../domain/user.ts';
import { userRepositoryContract } from '../../testing/userRepository.contract.ts';
import { fileUserRepository } from './fileUserRepository.ts';

const LINA: User = { id: 'u1', name: 'Lina', riderType: 'subscriber' };
const THEO: User = { id: 'u2', name: 'Théo', riderType: 'non-subscriber' };

/** Un fichier neuf dans un dossier neuf, effacé à la fin du test : aucun test ne dépend d'un autre. */
async function freshFile(t: TestContext): Promise<string> {
    const folder = await mkdtemp(join(tmpdir(), 'velos-'));
    t.after(() => rm(folder, { recursive: true, force: true }));
    return join(folder, 'users.json');
}

//DEMANDE 05
test('un usager enregistré avant le redémarrage est retrouvé après', async (t) => {
    const path = await freshFile(t);
    await fileUserRepository(path).add(LINA);

    const afterRestart = fileUserRepository(path);

    assert.deepEqual(await afterRestart.byId('u1'), LINA);
});

test('tous les usagers sont retrouvés après le redémarrage', async (t) => {
    const path = await freshFile(t);
    const beforeRestart = fileUserRepository(path);
    await beforeRestart.add(LINA);
    await beforeRestart.add(THEO);

    const afterRestart = fileUserRepository(path);

    assert.deepEqual(await afterRestart.byId('u1'), LINA);
    assert.deepEqual(await afterRestart.byId('u2'), THEO);
});

test('chercher un usager inconnu donne une réponse claire, pas un plantage', async (t) => {
    const users = fileUserRepository(await freshFile(t));
    await users.add(LINA);

    assert.equal(await users.byId('inconnu'), undefined);
});

test('au tout premier démarrage, sans fichier, on ne trouve personne et rien ne plante', async (t) => {
    const users = fileUserRepository(await freshFile(t));

    assert.equal(await users.byId('u1'), undefined);
});

test('enregistrer un usager déjà connu le remplace, sans doublon', async (t) => {
    const path = await freshFile(t);
    await fileUserRepository(path).add(LINA);
    await fileUserRepository(path).add({ ...LINA, riderType: 'non-subscriber' });

    assert.equal((await fileUserRepository(path).byId('u1'))?.riderType, 'non-subscriber');
});

//CONTRAT : le fichier se comporte comme la mémoire
userRepositoryContract('fileUserRepository', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'velos-'));
    after(() => rm(folder, { recursive: true, force: true }));
    return fileUserRepository(join(folder, 'users.json'));
});
