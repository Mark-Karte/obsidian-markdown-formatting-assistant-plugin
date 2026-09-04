import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_TOOLBAR_COMMANDS,
  MAX_TOOLBAR_COMMANDS,
  PLUGIN_ID,
  moveCommand,
  normaliseToolbarCommands,
} from '../src/toolbarSettings.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));

test('the namespace matches the id Obsidian actually registers under', () => {
  // Every command id is prefixed with the manifest id. If the two drifted the
  // default buttons would silently resolve to nothing, and the toolbar would
  // come up empty for everyone who never customised it.
  const manifest = JSON.parse(
    fs.readFileSync(path.join(HERE, '..', 'manifest.json'), 'utf8'),
  );

  assert.equal(PLUGIN_ID, manifest.id);
});

test('every default button names a command the plugin registers', () => {
  // Read from the source table rather than imported, which would pull in the
  // obsidian module.
  const source = fs.readFileSync(
    path.join(HERE, '..', 'src', 'formatter.ts'),
    'utf8',
  );
  const table = source.slice(
    source.indexOf('export const formatSettings = withIds({'),
  );
  const keys = [...table.matchAll(/^  ([a-zA-Z0-9]+): \{/gm)].map((m) => m[1]);

  const unknown = DEFAULT_TOOLBAR_COMMANDS.map((id) =>
    id.replace(`${PLUGIN_ID}:`, ''),
  ).filter((id) => !keys.includes(id));

  assert.deepEqual(unknown, [], 'these default buttons would do nothing');
});

// ---------------------------------------------------------------------------
// Normalising what was stored
// ---------------------------------------------------------------------------

test('a missing list falls back to the defaults', () => {
  assert.deepEqual(normaliseToolbarCommands(undefined), DEFAULT_TOOLBAR_COMMANDS);
  assert.deepEqual(normaliseToolbarCommands(null), DEFAULT_TOOLBAR_COMMANDS);
  assert.deepEqual(normaliseToolbarCommands('bold'), DEFAULT_TOOLBAR_COMMANDS);
});

test('the fallback is a copy, so the defaults cannot be mutated', () => {
  const first = normaliseToolbarCommands(undefined);
  first.push('junk');

  assert.equal(
    normaliseToolbarCommands(undefined).includes('junk'),
    false,
    'the default array leaked into the settings',
  );
});

test('an empty list is respected rather than refilled', () => {
  // Emptying the toolbar deliberately is a reasonable thing to do; treating it
  // as "unset" would keep putting the defaults back.
  assert.deepEqual(normaliseToolbarCommands([]), []);
});

test('duplicates are dropped, keeping the first position', () => {
  assert.deepEqual(normaliseToolbarCommands(['a', 'b', 'a', 'c', 'b']), [
    'a',
    'b',
    'c',
  ]);
});

test('non-strings and blanks are skipped', () => {
  assert.deepEqual(
    normaliseToolbarCommands(['a', null, 42, '', '   ', { id: 'b' }, 'c']),
    ['a', 'c'],
  );
});

test('surrounding whitespace is trimmed before comparing', () => {
  assert.deepEqual(normaliseToolbarCommands([' a ', 'a']), ['a']);
});

test('the list is capped', () => {
  const many = Array.from({ length: 200 }, (_, i) => `command-${i}`);

  assert.equal(
    normaliseToolbarCommands(many).length,
    MAX_TOOLBAR_COMMANDS,
  );
});

// ---------------------------------------------------------------------------
// Reordering
// ---------------------------------------------------------------------------

test('a button moves to its new position and the rest shift along', () => {
  // Not a swap: dragging the first button to the end must leave the others in
  // their order, not send the last one to the front.
  assert.deepEqual(moveCommand(['a', 'b', 'c', 'd'], 0, 3), [
    'b',
    'c',
    'd',
    'a',
  ]);
});

test('moving backwards works the same way', () => {
  assert.deepEqual(moveCommand(['a', 'b', 'c', 'd'], 3, 0), [
    'd',
    'a',
    'b',
    'c',
  ]);
});

test('a move between neighbours is a swap, as it happens', () => {
  assert.deepEqual(moveCommand(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c']);
});

test('moving onto itself changes nothing', () => {
  assert.deepEqual(moveCommand(['a', 'b', 'c'], 1, 1), ['a', 'b', 'c']);
});

test('an index outside the list is ignored rather than corrupting it', () => {
  // A drop can land anywhere, including on the container itself.
  const list = ['a', 'b', 'c'];

  assert.deepEqual(moveCommand(list, -1, 1), list);
  assert.deepEqual(moveCommand(list, 1, 9), list);
  assert.deepEqual(moveCommand(list, 9, 1), list);
  assert.deepEqual(moveCommand(list, 0.5 as never, 1), list);
});

test('the original list is never modified in place', () => {
  const list = ['a', 'b', 'c'];
  moveCommand(list, 0, 2);

  assert.deepEqual(list, ['a', 'b', 'c']);
});
