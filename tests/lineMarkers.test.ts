import { test } from 'node:test';
import assert from 'node:assert/strict';

import { toggleLineMarker } from '../src/lineMarkers.ts';

const bullets = (lines: string[]) => toggleLineMarker(lines, '- ', 'list');
const numbers = (lines: string[]) => toggleLineMarker(lines, '1. ', 'list');
const tasks = (lines: string[]) => toggleLineMarker(lines, '- [ ] ', 'list');
const quotes = (lines: string[]) => toggleLineMarker(lines, '> ', 'quote');

// ---------------------------------------------------------------------------
// Adding and removing
// ---------------------------------------------------------------------------

test('a marker goes on the front of the line', () => {
  assert.deepEqual(bullets(['one', 'two']), ['- one', '- two']);
});

test('marked lines are unmarked again', () => {
  assert.deepEqual(bullets(['- one', '- two']), ['one', 'two']);
});

test('a half-converted selection is finished rather than undone', () => {
  // Adding to a mixed selection is what the person is asking for; removing
  // would throw away the marker they just added by hand.
  assert.deepEqual(bullets(['- one', 'two']), ['- one', '- two']);
});

test('the line is left alone when it already has the marker', () => {
  assert.deepEqual(bullets(['- one']), ['one']);
  assert.deepEqual(bullets(['one']), ['- one']);
});

// ---------------------------------------------------------------------------
// Indentation, which is what makes a list nest
// ---------------------------------------------------------------------------

test('indentation survives in both directions', () => {
  assert.deepEqual(bullets(['  nested']), ['  - nested']);
  assert.deepEqual(bullets(['  - nested']), ['  nested']);
});

test('a numbered marker does not let its dot match anything', () => {
  // '1. ' goes into a regex. Unescaped, the dot matches the space after it and
  // '1x item' would count as already numbered.
  assert.deepEqual(numbers(['1x item']), ['1. 1x item']);
  assert.deepEqual(numbers(['1. item']), ['item']);
});

test('a task marker round-trips', () => {
  assert.deepEqual(tasks(['buy milk']), ['- [ ] buy milk']);
  assert.deepEqual(tasks(['- [ ] buy milk']), ['buy milk']);
});

// ---------------------------------------------------------------------------
// Lists inside quotes
// ---------------------------------------------------------------------------

test('a bullet inside a quote goes after the quote marker', () => {
  // '- > text' would be a list containing a quote, which is a different thing
  // from a quote containing a list.
  assert.deepEqual(bullets(['> text']), ['> - text']);
});

test('and comes off again from there', () => {
  assert.deepEqual(bullets(['> - text']), ['> text']);
});

test('nested quotes are stepped over too', () => {
  assert.deepEqual(bullets(['> > deep']), ['> > - deep']);
});

test('an indented quote keeps both', () => {
  assert.deepEqual(bullets(['  > text']), ['  > - text']);
});

test('a quote marker still goes in front of everything', () => {
  // It is the outermost thing on the line by nature.
  assert.deepEqual(quotes(['  indented']), ['>   indented']);
  assert.deepEqual(quotes(['> already']), ['already']);
});

// ---------------------------------------------------------------------------
// Blank lines
// ---------------------------------------------------------------------------

test('a blank line takes no marker', () => {
  assert.deepEqual(bullets(['one', '', 'two']), ['- one', '', '- two']);
});

test('and does not stop the list being turned off', () => {
  // One empty line in the middle used to be enough to make the button add
  // markers to lines that already had them.
  assert.deepEqual(bullets(['- one', '', '- two']), ['one', '', 'two']);
});

test('a line of only spaces counts as blank', () => {
  assert.deepEqual(bullets(['   ']), ['   ']);
});

test('nothing but blank lines is left untouched', () => {
  assert.deepEqual(bullets(['', '  ']), ['', '  ']);
});

test('an empty input is not an error', () => {
  assert.deepEqual(bullets([]), []);
});

// ---------------------------------------------------------------------------
// The whole gesture
// ---------------------------------------------------------------------------

test('a paragraph becomes a list and comes back unchanged', () => {
  const original = ['  first', '', '> quoted', 'last'];
  const listed = bullets(original);

  assert.deepEqual(listed, ['  - first', '', '> - quoted', '- last']);
  assert.deepEqual(bullets(listed), original);
});
