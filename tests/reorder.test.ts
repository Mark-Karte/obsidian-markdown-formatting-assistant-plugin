import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { moveItem } from '../src/reorder.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));

test('an item moves to its new position and the rest shift along', () => {
  // Not a swap: dragging the first item to the end must leave the others in
  // their order, not send the last one to the front.
  assert.deepEqual(moveItem(['a', 'b', 'c', 'd'], 0, 3), ['b', 'c', 'd', 'a']);
});

test('moving backwards works the same way', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c', 'd'], 3, 0), ['d', 'a', 'b', 'c']);
});

test('a move between neighbours is a swap, as it happens', () => {
  // Which is why the bug hid for so long: the two are the same for the gesture
  // people try first.
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c']);
});

test('moving onto itself changes nothing', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 1, 1), ['a', 'b', 'c']);
});

test('an index outside the list is ignored rather than corrupting it', () => {
  const list = ['a', 'b', 'c'];

  assert.deepEqual(moveItem(list, -1, 1), list);
  assert.deepEqual(moveItem(list, 1, 9), list);
  assert.deepEqual(moveItem(list, 9, 1), list);
  assert.deepEqual(moveItem(list, 0.5 as never, 1), list);
  assert.deepEqual(moveItem(list, NaN, 1), list);
});

test('the original list is never modified in place', () => {
  const list = ['a', 'b', 'c'];
  moveItem(list, 0, 2);

  assert.deepEqual(list, ['a', 'b', 'c']);
});

test('it works on objects, not just strings', () => {
  // The panel's sections are objects, and they were the second list that had
  // its own wrong copy of this.
  const a = { name: 'textEdit' };
  const b = { name: 'tables' };
  const c = { name: 'html' };

  assert.deepEqual(moveItem([a, b, c], 0, 2), [b, c, a]);
});

test('no list is reordered by hand any more', () => {
  // The two panel lists each carried their own swap, and both were wrong in
  // the same way. This is what stops a third copy appearing.
  const suspicious: string[] = [];

  for (const file of fs.readdirSync(path.join(HERE, '..', 'src'))) {
    if (!file.endsWith('.ts')) continue;

    // Comments are blanked rather than deleted: removing them outright would
    // shift every line number after them and the report would point at the
    // wrong place.
    const source = fs
      .readFileSync(path.join(HERE, '..', 'src', file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ''))
      .replace(/^(\s*)\/\/.*$/gm, '$1');

    source.split('\n').forEach((line, index) => {
      // The shape of a hand-written swap: assigning into an array at an index
      // held in a variable. The lookahead keeps '===' out of it - a comparison
      // against TABLE_ALIGNMENTS[index] is not a write.
      if (/^\s*\w+\[\w*[Ii]ndex\w*\]\s*=(?!=)/.test(line)) {
        suspicious.push(`${file}:${index + 1}`);
      }
    });
  }

  assert.deepEqual(suspicious, [], 'use moveItem instead');
});
