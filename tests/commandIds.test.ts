import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The ids the plugin registers with Obsidian, checked by reading the tables as
 * text - importing them would pull in the obsidian module, which does not exist
 * outside the app.
 *
 * A clash matters more here than it looks: Obsidian keeps one command per id
 * and drops the rest without a word, so a duplicate would quietly cost the user
 * a button, and only the one nobody thought to test.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'src');

/** Registered by hand in main.ts rather than generated from a table. */
const HAND_WRITTEN = [
  'open-command-selector',
  'open-callouts-selector',
  'toggle-side-panel',
];

function tableKeys(file: string, declaration: string): string[] {
  const source = fs.readFileSync(path.join(SRC, file), 'utf8');
  const start = source.indexOf(declaration);

  assert.ok(start >= 0, `${file} does not declare ${declaration}`);

  const body = source.slice(start, source.indexOf('\n});', start));

  return [...body.matchAll(/^  ([a-zA-Z0-9]+): \{/gm)].map((m) => m[1]);
}

const textEdit = tableKeys('formatter.ts', 'export const formatSettings = withIds({');
const callouts = tableKeys(
  'calloutsFormatter.ts',
  'export const calloutsFormatterSettings = withIds({',
);

test('both tables were found and are not empty', () => {
  assert.ok(textEdit.length >= 20, `only ${textEdit.length} text actions`);
  assert.ok(callouts.length >= 20, `only ${callouts.length} callouts`);
});

test('main.ts registers exactly the hand-written ids listed here', () => {
  // Keeps this test honest: a fourth command added by hand has to be declared
  // above, or the collision check below silently stops covering it.
  const main = fs.readFileSync(path.join(SRC, 'main.ts'), 'utf8');
  const found = [...main.matchAll(/^\s+id: '([a-z-]+)',$/gm)].map((m) => m[1]);

  assert.deepEqual(found.sort(), [...HAND_WRITTEN].sort());
});

test('no two commands share an id', () => {
  const ids = [
    ...HAND_WRITTEN,
    ...textEdit,
    ...callouts.map((id) => `callout-${id}`),
  ];

  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  assert.deepEqual(duplicates, [], 'these ids are registered twice');
});

test('nothing outside the callout table claims the callout prefix', () => {
  // The prefix is what lets the two tables grow without ever colliding - both
  // hold plain English words, and 'quote' or 'image' would be at home in
  // either. It only works while it stays reserved.
  const trespassers = [...HAND_WRITTEN, ...textEdit].filter((id) =>
    id.startsWith('callout-'),
  );

  assert.deepEqual(trespassers, [], 'these would collide with a callout id');
});
