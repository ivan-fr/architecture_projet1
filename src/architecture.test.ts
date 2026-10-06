import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Des tests qui ne vérifient pas un comportement, mais une décision d'architecture.
 * Ils échouent le jour où quelqu'un franchit une frontière, même pressé, même un soir.
 */
async function sources(folder: string): Promise<string[]> {
    const entries = await readdir(folder, { withFileTypes: true }).catch(() => []);
    const found: string[] = [];
    for (const entry of entries) {
        const path = join(folder, entry.name);
        if (entry.isDirectory()) found.push(...(await sources(path)));
        else if (entry.name.endsWith('.ts')) found.push(path);
    }
    return found;
}

const slash = (path: string) => path.replaceAll('\\', '/');

const importsOf = (code: string): string[] => [...code.matchAll(/from '([^']+)'/g)].map((match) => match[1] ?? '');

/** Les fichiers d'une couche (hors tests) qui importent un chemin interdit. */
async function offenders(layer: string, forbidden: string): Promise<string[]> {
    const files = (await sources(join('src', layer))).filter((file) => !slash(file).endsWith('.test.ts'));
    const broken: string[] = [];
    for (const file of files) {
        if (importsOf(await readFile(file, 'utf8')).some((target) => target.includes(forbidden))) broken.push(slash(file));
    }
    return broken;
}

//DEMANDE 05 : le métier ne sait pas que les usagers sont dans un fichier
test('le domaine et l\'application ne connaissent pas l\'infrastructure', async () => {
    assert.deepEqual(await offenders('domain', 'infrastructure'), []);
    assert.deepEqual(await offenders('application', 'infrastructure'), []);
});

//DEMANDE 04 : les tests donnent le même résultat quel que soit le jour où on les lance
test('seule l\'infrastructure lit l\'horloge de la machine', async () => {
    // `new Date('2026-…')` lit une date écrite, c'est permis. `new Date()` et `Date.now()` lisent l'heure qu'il est.
    const readsTheClock = /new Date\(\)|Date\.now\(\)/;
    const files = (await sources('src')).filter(
        (file) => !slash(file).startsWith('src/infrastructure/') && !slash(file).endsWith('.test.ts'),
    );
    const reading: string[] = [];
    for (const file of files) {
        if (readsTheClock.test(await readFile(file, 'utf8'))) reading.push(slash(file));
    }
    assert.deepEqual(reading, []);
});

//DEMANDE 10 : la base SQL est un détail de stockage, rangé à un seul endroit
test('seul le dossier persistence parle à la base SQL', async () => {
    const files = (await sources('src')).filter(
        (file) => !slash(file).startsWith('src/infrastructure/persistence/') && !slash(file).endsWith('.test.ts'),
    );
    const speaking: string[] = [];
    for (const file of files) {
        if (importsOf(await readFile(file, 'utf8')).includes('node:sqlite')) speaking.push(slash(file));
    }
    assert.deepEqual(speaking, []);
});
