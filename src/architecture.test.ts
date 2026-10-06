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

/** Le code de production sous `folder`, hors tests et hors dossiers autorisés. */
async function productionFiles(folder: string, allowed: string[] = []): Promise<string[]> {
    const files = (await sources(folder)).map(slash);
    return files.filter((file) => !file.endsWith('.test.ts') && !allowed.some((prefix) => file.startsWith(prefix)));
}

/** Les fichiers dont le code vérifie la condition. */
async function filesWhere(files: string[], condition: (code: string) => boolean): Promise<string[]> {
    const matching: string[] = [];
    for (const file of files) if (condition(await readFile(file, 'utf8'))) matching.push(file);
    return matching;
}

const importsPath = (forbidden: string) => (code: string) => importsOf(code).some((target) => target.includes(forbidden));

/** Un test du fichier : son nom et ses lignes, de `test(` jusqu'au `});` de même indentation. */
interface TestCase {
    name: string;
    lines: string[];
}

function testCasesOf(code: string): TestCase[] {
    const lines = code.split(/\r?\n/);
    const cases: TestCase[] = [];
    lines.forEach((line, start) => {
        const opening = /^(\s*)test\(\s*(['"`])((?:\\.|(?!\2).)*)\2/.exec(line);
        if (!opening) return;
        const indent = opening[1] ?? '';
        const end = lines.findIndex((candidate, index) => index > start && candidate.startsWith(`${indent}});`));
        cases.push({ name: opening[3] ?? '', lines: lines.slice(start + 1, end === -1 ? undefined : end) });
    });
    return cases;
}

/** La préparation : les lignes avant la première ligne vide ou la première vérification. */
function preparationLines({ lines }: TestCase): number {
    const firstBreak = lines.findIndex((line) => line.trim() === '' || /\bassert\b/.test(line));
    const preparation = firstBreak === -1 ? lines : lines.slice(0, firstBreak);
    return preparation.filter((line) => !line.trim().startsWith('//')).length;
}

const MAX_PREPARATION_LINES = 10;

//DEMANDE 17 : un test se comprend en quelques secondes
test('aucun test n\'a plus de dix lignes de préparation', async () => {
    const tests = (await sources('src')).map(slash).filter((file) => file.endsWith('.test.ts'));
    const tooLong: string[] = [];
    for (const file of tests) {
        for (const testCase of testCasesOf(await readFile(file, 'utf8'))) {
            const count = preparationLines(testCase);
            if (count > MAX_PREPARATION_LINES) tooLong.push(`${file} : « ${testCase.name} » (${count} lignes)`);
        }
    }
    assert.deepEqual(tooLong, []);
});

//DEMANDE 05 : le métier ne sait pas que les usagers sont dans un fichier
test('le domaine et l\'application ne connaissent pas l\'infrastructure', async () => {
    const domain = await productionFiles('src/domain');
    const application = await productionFiles('src/application');

    assert.deepEqual(await filesWhere(domain, importsPath('infrastructure')), []);
    assert.deepEqual(await filesWhere(application, importsPath('infrastructure')), []);
});

//DEMANDE 04 : les tests donnent le même résultat quel que soit le jour où on les lance
test('seule l\'infrastructure lit l\'horloge de la machine', async () => {
    // `new Date('2026-…')` lit une date écrite, c'est permis. `new Date()` et `Date.now()` lisent l'heure qu'il est.
    const files = await productionFiles('src', ['src/infrastructure/']);

    assert.deepEqual(await filesWhere(files, (code) => /new Date\(\)|Date\.now\(\)/.test(code)), []);
});

//DEMANDE 10 : la base SQL est un détail de stockage, rangé à un seul endroit
test('seul le dossier persistence parle à la base SQL', async () => {
    // La règle vise le code de production : les tests et l'outillage de test (src/testing) peuvent ouvrir une base.
    const files = await productionFiles('src', ['src/infrastructure/persistence/', 'src/testing/']);

    assert.deepEqual(await filesWhere(files, (code) => importsOf(code).includes('node:sqlite')), []);
});
