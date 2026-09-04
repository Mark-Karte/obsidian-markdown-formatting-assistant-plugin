import { test } from 'node:test';
import assert from 'node:assert/strict';

import { commandName } from '../src/commandNames.ts';

test('an underscored key becomes a readable phrase', () => {
  assert.equal(commandName('code_block'), 'Code block');
  assert.equal(commandName('internal_link'), 'Internal link');
  assert.equal(commandName('mermaid_block'), 'Mermaid block');
});

test('only the first word is capitalised', () => {
  // Sentence case, which is what Obsidian's own command names use.
  assert.equal(commandName('bullet_list'), 'Bullet list');
  assert.equal(commandName('check_list'), 'Check list');
});

test('a single word is simply capitalised', () => {
  assert.equal(commandName('bold'), 'Bold');
  assert.equal(commandName('strikethrough'), 'Strikethrough');
});

test('the heading keys keep their shape', () => {
  // 'H1' is what the panel button says and what people type to find it.
  assert.equal(commandName('h1'), 'H1');
  assert.equal(commandName('h6'), 'H6');
});

test('an empty label yields an empty name rather than throwing', () => {
  assert.equal(commandName(''), '');
  assert.equal(commandName('   '), '');
  assert.equal(commandName(undefined as never), '');
});

test('surrounding whitespace is trimmed', () => {
  assert.equal(commandName('  bold  '), 'Bold');
});

test('every Text Edit key produces a non-empty, capitalised name', () => {
  // The real table, so a new button cannot ship with a blank command name.
  const keys = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'bold', 'italic', 'underline', 'strikethrough', 'highlight',
    'code_block', 'mermaid_block', 'code_inline',
    'link', 'internal_link', 'image',
    'blockquote', 'bullet_list', 'number_list', 'check_list',
  ];

  for (const key of keys) {
    const name = commandName(key);

    assert.ok(name.length > 0, `${key} produced an empty name`);
    assert.equal(name[0], name[0].toUpperCase(), `${key} is not capitalised`);
    assert.ok(!name.includes('_'), `${key} kept an underscore`);
  }
});
