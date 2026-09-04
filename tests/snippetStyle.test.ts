import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SNIPPET_COLORS,
  snippetColorPresets,
  tintFromColor,
} from '../src/snippetStyle.ts';

test('a hex colour becomes a translucent rgba tint', () => {
  assert.equal(tintFromColor('#ff0000'), 'rgba(255, 0, 0, 0.12)');
  assert.equal(tintFromColor('#000000'), 'rgba(0, 0, 0, 0.12)');
  assert.equal(tintFromColor('#ffffff'), 'rgba(255, 255, 255, 0.12)');
});

test('channels are not mixed up', () => {
  assert.equal(tintFromColor('#123456'), 'rgba(18, 52, 86, 0.12)');
});

test('upper case and surrounding spaces are accepted', () => {
  assert.equal(tintFromColor('  #AABBCC  '), 'rgba(170, 187, 204, 0.12)');
});

test('the alpha can be overridden', () => {
  assert.equal(tintFromColor('#ff0000', 0.5), 'rgba(255, 0, 0, 0.5)');
});

test('a half-typed colour yields transparent rather than broken CSS', () => {
  // The settings save on every keystroke, so partial values do reach this.
  assert.equal(tintFromColor('#ff'), 'transparent');
  assert.equal(tintFromColor('red'), 'transparent');
  assert.equal(tintFromColor(''), 'transparent');
  assert.equal(tintFromColor('#1234567'), 'transparent');
});

test('a missing colour is tolerated', () => {
  assert.equal(tintFromColor(undefined as never), 'transparent');
});

test('presets fall back to the built-in palette when nothing is saved', () => {
  assert.deepEqual(snippetColorPresets([]), DEFAULT_SNIPPET_COLORS);
});

test('the user own saved colours come first', () => {
  const presets = snippetColorPresets(['#111111', '#222222']);

  assert.deepEqual(presets.slice(0, 2), ['#111111', '#222222']);
});

test('the built-in palette tops the row up to a full strip', () => {
  // Two saved colours used to mean a two-swatch row and no way back to the
  // rest of the palette.
  const presets = snippetColorPresets(['#111111', '#222222']);

  assert.equal(presets.length, DEFAULT_SNIPPET_COLORS.length);
  assert.ok(
    presets.includes(DEFAULT_SNIPPET_COLORS[0]),
    'the defaults should still be reachable',
  );
});

test('a saved colour is not repeated by the palette behind it', () => {
  const presets = snippetColorPresets([DEFAULT_SNIPPET_COLORS[3]]);

  assert.equal(presets[0], DEFAULT_SNIPPET_COLORS[3]);
  assert.equal(
    presets.filter((color) => color === DEFAULT_SNIPPET_COLORS[3]).length,
    1,
  );
});

test('the same colour in a different case counts once', () => {
  const presets = snippetColorPresets(['#448AFF']);

  assert.equal(presets[0], '#448AFF');
  assert.ok(
    !presets.includes('#448aff'),
    'the palette entry is the same colour',
  );
});

test('invalid saved entries are skipped', () => {
  const presets = snippetColorPresets(['nope', '#333333']);

  assert.equal(presets[0], '#333333');
  assert.ok(!presets.includes('nope'));
});

test('the preset row is capped so it stays one manageable strip', () => {
  const many = new Array(40).fill('#abcdef');

  assert.equal(
    snippetColorPresets(many).length,
    DEFAULT_SNIPPET_COLORS.length,
  );
});
