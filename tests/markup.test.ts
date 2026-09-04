import { test } from 'node:test';
import assert from 'node:assert/strict';

import { splitMarkup } from '../src/markup.ts';

test('a plain label is one text part', () => {
  assert.deepEqual(splitMarkup('exp'), [{ tag: 'text', value: 'exp' }]);
});

test('a superscript is separated from the text around it', () => {
  assert.deepEqual(splitMarkup('x<sup>y</sup>'), [
    { tag: 'text', value: 'x' },
    { tag: 'sup', value: 'y' },
  ]);
});

test('a subscript is recognised too', () => {
  assert.deepEqual(splitMarkup('x<sub>y</sub>'), [
    { tag: 'text', value: 'x' },
    { tag: 'sub', value: 'y' },
  ]);
});

test('text after the tag is kept', () => {
  assert.deepEqual(splitMarkup('a<sup>b</sup>c'), [
    { tag: 'text', value: 'a' },
    { tag: 'sup', value: 'b' },
    { tag: 'text', value: 'c' },
  ]);
});

test('every label the tables actually hold round-trips', () => {
  const labels = [
    'cos<sup>2</sup>',
    'cot<sup>2</sup>',
    'e<sup>x</sup>',
    'sin<sup>2</sup>',
    'tan<sup>2</sup>',
    'x<sub>y</sub>',
    'x<sup>-1</sup>',
    'x<sup>y</sup>',
  ];

  for (const label of labels) {
    const rebuilt = splitMarkup(label)
      .map((part) =>
        part.tag === 'text' ? part.value : `<${part.tag}>${part.value}</${part.tag}>`,
      )
      .join('');

    assert.equal(rebuilt, label, `${label} did not survive the split`);
  }
});

test('a dollar-wrapped label is left alone', () => {
  assert.deepEqual(splitMarkup('$$x$$'), [{ tag: 'text', value: '$$x$$' }]);
});

test('an unknown tag stays literal text rather than becoming an element', () => {
  // The safe direction to fail in: the user sees a stray tag instead of the
  // page running it.
  assert.deepEqual(splitMarkup('<img src=x onerror=boom>'), [
    { tag: 'text', value: '<img src=x onerror=boom>' },
  ]);
});

test('an unclosed tag is not treated as markup', () => {
  assert.deepEqual(splitMarkup('x<sup>y'), [{ tag: 'text', value: 'x<sup>y' }]);
});

test('mismatched tags do not pair up', () => {
  assert.deepEqual(splitMarkup('x<sup>y</sub>'), [
    { tag: 'text', value: 'x<sup>y</sub>' },
  ]);
});

test('two runs in one label are both found', () => {
  assert.deepEqual(splitMarkup('<sup>a</sup><sub>b</sub>'), [
    { tag: 'sup', value: 'a' },
    { tag: 'sub', value: 'b' },
  ]);
});

test('an empty label yields no parts', () => {
  assert.deepEqual(splitMarkup(''), []);
  assert.deepEqual(splitMarkup(undefined as never), []);
});
