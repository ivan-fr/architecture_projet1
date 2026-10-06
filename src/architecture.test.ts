import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

type TestCase = {
    name: string;
    block: string;
};

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
function testBlocks(code: string): string[] {
    const blocks: string[] = [];
    const lines = code.split(/\r?\n/);
    let buffer: string[] = [];
    let inBlock = false;

    for (const line of lines) {
        if (line.includes('test(') && !inBlock) {
            inBlock = true;
            buffer = [line];
            continue;
        }

        if (inBlock) {
            buffer.push(line);

            if (line.includes('});')) {
                blocks.push(buffer.join('\n'));
                buffer = [];
                inBlock = false;
            }
        }
    }

    return blocks;
}

function testCases(code: string): TestCase[] {
    const cases: TestCase[] = [];
    const lines = code.split(/\r?\n/);
    let buffer: string[] = [];
    let inBlock = false;
    let name = '';

    for (const line of lines) {
        const match = line.match(/test\(\s*['"`]([^'"`]+)['"`]/);

        if (match && !inBlock) {
            name = match[1];
            inBlock = true;
            buffer = [line];
            continue;
        }

        if (inBlock) {
            buffer.push(line);

            if (line.includes('});')) {
                cases.push({ name, block: buffer.join('\n') });
                buffer = [];
                inBlock = false;
                name = '';
            }
        }
    }

    return cases;
}

function preparationLines(block: string): number {
    const lines = block.split(/\r?\n/);
    let count = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) continue;
        if (trimmed.startsWith('//')) continue;
        if (/assert\./.test(trimmed) || /assert\(/.test(trimmed) || /await assert\./.test(trimmed)) break;

        count++;
    }

    return count;
}

//DEMANDE 17 : AUCUN TESTS N'A PLUS DE 10 LIGNES DE PREPARATION
test('aucun test n’a plus de dix lignes de préparation', async () => {
    const files = (await sources('src')).filter((file) => slash(file).endsWith('.test.ts'));
    const offenders: string[] = [];

    for (const file of files) {
        const code = await readFile(file, 'utf8');
        for (const testCase of testCases(code)) {
            const lines = preparationLines(testCase.block);
            if (lines > 10) {
                offenders.push(`${slash(file)} :: "${testCase.name}" :: ${lines} lignes de préparation`);
            }
        }
    }

    assert.deepEqual(offenders, []);
});


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
    // La règle vise le code de production : les tests et l'outillage de test (src/testing) peuvent ouvrir une base.
    const files = (await sources('src')).filter(
        (file) =>
            !slash(file).startsWith('src/infrastructure/persistence/') &&
            !slash(file).startsWith('src/testing/') &&
            !slash(file).endsWith('.test.ts'),
    );
    const speaking: string[] = [];
    for (const file of files) {
        if (importsOf(await readFile(file, 'utf8')).includes('node:sqlite')) speaking.push(slash(file));
    }
    assert.deepEqual(speaking, []);
});
