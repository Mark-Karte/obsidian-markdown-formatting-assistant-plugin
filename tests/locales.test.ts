import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Consistency of the translation files, checked by parsing them as text.
 *
 * Importing them would only prove they compile. What actually goes wrong with
 * translations is subtler: a key retired from English but left behind in ten
 * other files, or a placeholder renamed in one language so the substitution
 * silently stops working and users see a literal '{section}'.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(HERE, '..', 'src', 'locales');

/** Keys a locale is expected to inherit from English rather than translate. */
const INHERITS_ENGLISH = ['view.displayName'];

/** Pure formatting, identical in every language by design. */
const SAME_EVERYWHERE = ['tables.size'];

/**
 * Keys whose translation legitimately equals the English text - the word is
 * simply spelled the same in that language.
 */
const SAME_IN_BOTH: Record<string, string[]> = {
  ru: ['section.html'],
  uk: ['section.html'],
  be: ['section.html'],
  zh: ['section.html'],
  de: [
    'section.html',
    'section.callouts',
    'settings.customSnippets.exampleCallout',
    'callout.info',
    'callout.bug',
    'callout.faq',
  ],
  es: ['section.html', 'callout.error'],
  fr: [
    'section.html',
    'callout.info',
    'callout.faq',
    'callout.note',
    'callout.important',
    'callout.question',
    'callout.attention',
    'callout.danger',
  ],
  pt: ['section.html', 'callout.bug'],
  it: ['section.html', 'callout.info', 'callout.faq', 'callout.bug'],
  ja: ['section.html'],
  ko: ['section.html'],
};

function readDict(file: string, declaration: string): Record<string, string> {
  const src = fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8');
  const start = src.indexOf(declaration);

  assert.ok(start >= 0, `${file} does not declare ${declaration}`);

  const body = src.slice(start, src.indexOf('\n};', start));
  const dict: Record<string, string> = {};

  // Values may be single- or double-quoted (the latter when the text itself
  // contains an apostrophe) and may wrap onto the next line.
  for (const m of body.matchAll(
    /^  '([^']+)':\s*(?:\n\s*)?(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/gm,
  )) {
    dict[m[1]] = m[2] !== undefined ? m[2] : m[3];
  }

  return dict;
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{([a-zA-Z]+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

const en = readDict('en.ts', 'export const en = {');
const enKeys = Object.keys(en);

const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'en.ts' && f !== 'index.ts')
  .map((f) => f.replace('.ts', ''));

test('the English dictionary is not empty', () => {
  assert.ok(enKeys.length > 50, `only ${enKeys.length} keys found`);
});

test('every locale is registered in index.ts', () => {
  const index = fs.readFileSync(path.join(LOCALES_DIR, 'index.ts'), 'utf8');

  for (const code of locales) {
    assert.match(
      index,
      new RegExp(`\\b${code}\\b`),
      `${code}.ts exists but index.ts never mentions it`,
    );
  }
});

for (const code of locales) {
  const dict = readDict(
    `${code}.ts`,
    `export const ${code}: LocaleDictionary = {`,
  );

  test(`${code}: covers every English key`, () => {
    const missing = enKeys.filter(
      (key) => !(key in dict) && !INHERITS_ENGLISH.includes(key),
    );

    assert.deepEqual(missing, [], `missing keys in ${code}.ts`);
  });

  test(`${code}: carries no key English has retired`, () => {
    const extra = Object.keys(dict).filter((key) => !(key in en));

    assert.deepEqual(extra, [], `stale keys in ${code}.ts`);
  });

  test(`${code}: placeholders match English`, () => {
    // A renamed placeholder does not fail loudly - the substitution simply
    // stops matching and the user reads a literal '{section}'.
    const drift = enKeys
      .filter((key) => key in dict)
      .filter((key) => placeholders(en[key]) !== placeholders(dict[key]))
      .map((key) => `${key}: en{${placeholders(en[key])}} vs ${code}{${placeholders(dict[key])}}`);

    assert.deepEqual(drift, [], `placeholder drift in ${code}.ts`);
  });

  test(`${code}: nothing left accidentally in English`, () => {
    const untranslated = enKeys.filter(
      (key) =>
        key in dict &&
        en[key] === dict[key] &&
        !SAME_EVERYWHERE.includes(key) &&
        !(SAME_IN_BOTH[code] || []).includes(key),
    );

    assert.deepEqual(
      untranslated,
      [],
      `these look untranslated in ${code}.ts - if the word really is the ` +
        `same in that language, add it to SAME_IN_BOTH`,
    );
  });
}

test('callout keywords stay ASCII in every language', () => {
  // The key is what Obsidian matches inside '> [!note]'. Translating one would
  // produce a callout the app does not recognise.
  const src = fs.readFileSync(
    path.join(HERE, '..', 'src', 'calloutsFormatter.ts'),
    'utf8',
  );
  const table = src.slice(src.indexOf('withIds({'), src.indexOf('\n});'));
  const keywords = [...table.matchAll(/^  (\w+): \{/gm)].map((m) => m[1]);

  assert.ok(keywords.length >= 20, `only ${keywords.length} callouts found`);

  for (const keyword of keywords) {
    assert.match(keyword, /^[a-z]+$/, `callout id "${keyword}" is not ASCII`);
  }
});
