import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCalloutTemplate,
  buildTable,
  expandTemplate,
  placeBlock,
  resolveCursorPosition,
} from '../src/textPlacement.ts';

// ---------------------------------------------------------------------------
// Block placement
// ---------------------------------------------------------------------------

test('a single-line insert is never pushed onto its own line', () => {
  const result = placeBlock('**bold**', 2, 'some text', ' more');

  assert.equal(result.text, '**bold**', 'wrapping a word must stay inline');
  assert.equal(result.cursorOffset, 2);
});

test('a block after text on the line gets a leading break', () => {
  const result = placeBlock('a\nb', 0, 'Hello', '');

  assert.equal(result.text, '\na\nb');
  assert.equal(result.cursorOffset, 1, 'the offset moves past the break');
});

test('a block with text still after it gets a trailing break', () => {
  const result = placeBlock('a\nb', 0, '', 'tail');

  assert.equal(result.text, 'a\nb\n');
  assert.equal(result.cursorOffset, 0);
});

test('inserting mid-sentence breaks on both sides', () => {
  // 'Hello world' with the caret after 'Hello ' - the old code only ever
  // looked at the whole line and glued the tail onto the last table row.
  const result = placeBlock('a\nb', 0, 'Hello ', 'world');

  assert.equal(result.text, '\na\nb\n');
  assert.equal(result.cursorOffset, 1);
});

test('replacing a whole line needs no breaks at all', () => {
  const result = placeBlock('a\nb', 0, '', '');

  assert.equal(result.text, 'a\nb');
  assert.equal(result.cursorOffset, 0);
});

test('whitespace-only surroundings count as empty', () => {
  const result = placeBlock('a\nb', 0, '   ', '  ');

  assert.equal(result.text, 'a\nb');
});

test('a table dropped mid-sentence keeps its caret in the header', () => {
  const table = buildTable(2, 2);
  const placed = placeBlock(table.text, table.cursorOffset, 'Hello ', 'world');
  const position = resolveCursorPosition(placed.text, placed.cursorOffset, {
    line: 4,
    ch: 6,
  });

  assert.deepEqual(position, { line: 5, ch: 2 });
});

// ---------------------------------------------------------------------------
// Callout templates
// ---------------------------------------------------------------------------

test('a callout without a title leaves the caret on the heading', () => {
  const result = expandTemplate(buildCalloutTemplate('note', ''), '');

  assert.equal(result.text, '> [!note] \n> ');
  assert.equal(result.cursorOffset, 10, 'right after the keyword');
});

test('a translated title is written after the English keyword', () => {
  const result = expandTemplate(
    buildCalloutTemplate('info', 'Информация'),
    '',
  );

  assert.equal(result.text, '> [!info] Информация\n> ');
  assert.equal(
    result.cursorOffset,
    result.text.length,
    'with a heading already written the caret goes to the body',
  );
});

test('the callout keyword is never translated', () => {
  const text = buildCalloutTemplate('warning', 'Предупреждение');

  assert.match(text, /^> \[!warning\] /);
});

test('a selection becomes the callout body', () => {
  const result = expandTemplate(
    buildCalloutTemplate('tip', 'Совет'),
    'remember this',
  );

  assert.equal(result.text, '> [!tip] Совет\n> remember this');
});

// ---------------------------------------------------------------------------
// Snippet templates
// ---------------------------------------------------------------------------

test('a template without placeholders is inserted as is', () => {
  const result = expandTemplate('---', 'ignored');

  assert.equal(result.text, '---');
  assert.equal(result.cursorOffset, 3, 'cursor ends up after the text');
});

test('{cursor} marks the caret and is removed', () => {
  const result = expandTemplate('**{cursor}**', '');

  assert.equal(result.text, '****');
  assert.equal(result.cursorOffset, 2);
});

test('{selection} is replaced by the selected text', () => {
  const result = expandTemplate('<b>{selection}</b>', 'hello');

  assert.equal(result.text, '<b>hello</b>');
});

test('an empty selection collapses the placeholder', () => {
  const result = expandTemplate('<b>{selection}</b>', '');

  assert.equal(result.text, '<b></b>');
});

test('the selection may appear more than once', () => {
  const result = expandTemplate('{selection} = {selection}', 'x');

  assert.equal(result.text, 'x = x');
});

test('the first {cursor} wins and the rest are dropped', () => {
  const result = expandTemplate('a{cursor}b{cursor}c', '');

  assert.equal(result.text, 'abc');
  assert.equal(result.cursorOffset, 1);
});

test('the cursor offset is measured after the selection is spliced in', () => {
  const result = expandTemplate('{selection}{cursor}!', 'abcd');

  assert.equal(result.text, 'abcd!');
  assert.equal(result.cursorOffset, 4, 'not 1, which the raw template implies');
});

test('a literal {cursor} inside the selection survives untouched', () => {
  // Documenting this very plugin means selecting text that mentions the
  // placeholder. It must not be treated as a marker and deleted.
  const result = expandTemplate('**{selection}{cursor}**', 'see {cursor} here');

  assert.equal(result.text, '**see {cursor} here**');
  assert.equal(
    result.cursorOffset,
    19,
    'the caret goes after the selection, not at the token inside it',
  );
});

test('a literal {selection} inside the selection survives too', () => {
  const result = expandTemplate('[{selection}]', 'use {selection} here');

  assert.equal(result.text, '[use {selection} here]');
});

test('the selection is substituted on both sides of the caret', () => {
  const result = expandTemplate('{selection}{cursor}{selection}', 'x');

  assert.equal(result.text, 'xx');
  assert.equal(result.cursorOffset, 1);
});

test('a marker inside the selection does not shift the caret', () => {
  // Without the fix the offset would land on the token inside the user's text.
  const result = expandTemplate('{cursor}{selection}', 'a{cursor}b');

  assert.equal(result.text, 'a{cursor}b');
  assert.equal(result.cursorOffset, 0);
});

test('an empty template inserts nothing and keeps the caret put', () => {
  const result = expandTemplate('', 'selected');

  assert.equal(result.text, '');
  assert.equal(result.cursorOffset, 0);
});

test('{label} is replaced by the snippet name', () => {
  // The reason this placeholder exists: a snippet named "Информация" wrote a
  // callout with no heading, so Obsidian filled in its own English "Note".
  const result = expandTemplate(
    buildCalloutTemplate('note', '{label}'),
    '',
    'Информация',
  );

  assert.equal(result.text, '> [!note] Информация\n> ');
});

test('an unnamed snippet leaves the heading empty rather than printing a token', () => {
  const result = expandTemplate(buildCalloutTemplate('note', '{label}'), '');

  assert.equal(result.text, '> [!note] \n> ');
});

test('the label may appear more than once', () => {
  const result = expandTemplate('{label}: {selection} ({label})', 'x', 'Tip');

  assert.equal(result.text, 'Tip: x (Tip)');
});

test('a literal {label} inside the selection survives', () => {
  // One substitution pass, so the selection is never re-scanned for tokens.
  const result = expandTemplate('{label} - {selection}', 'about {label}', 'Doc');

  assert.equal(result.text, 'Doc - about {label}');
});

test('a {selection} token inside the label is not expanded either', () => {
  const result = expandTemplate('{label}', 'body', 'odd {selection} name');

  assert.equal(result.text, 'odd {selection} name');
});

test('the caret offset accounts for the label before it', () => {
  const result = expandTemplate('{label}{cursor}!', '', 'Note');

  assert.equal(result.text, 'Note!');
  assert.equal(result.cursorOffset, 4);
});

// ---------------------------------------------------------------------------
// Multi-line values inside a quote
// ---------------------------------------------------------------------------

test('a multi-paragraph selection stays inside the callout', () => {
  // A blank line ends a blockquote, so without the repeated marker the second
  // paragraph dropped out of the callout entirely.
  const result = expandTemplate(
    buildCalloutTemplate('note', 'Информация'),
    'first\n\nsecond',
  );

  assert.equal(
    result.text,
    '> [!note] Информация\n> first\n> \n> second',
  );
});

test('the quote marker is repeated exactly as written', () => {
  const result = expandTemplate('> > {selection}', 'a\nb');

  assert.equal(result.text, '> > a\n> > b');
});

test('a fenced block is not given a quote prefix', () => {
  const result = expandTemplate('```\n{selection}{cursor}\n```', 'a\nb');

  assert.equal(result.text, '```\na\nb\n```');
});

test('inline wrapping of a multi-line selection is left alone', () => {
  const result = expandTemplate('**{selection}**', 'a\nb');

  assert.equal(result.text, '**a\nb**');
});

test('a quote prefix only counts when nothing else precedes the value', () => {
  // '> [!note] ' leads with a marker but carries text, so it is a heading, not
  // a prefix to repeat.
  const result = expandTemplate('> [!note] {label}', '', 'a\nb');

  assert.equal(result.text, '> [!note] a\nb');
});

test('a single-line selection is unaffected by the prefix logic', () => {
  const result = expandTemplate('> {selection}', 'one line');

  assert.equal(result.text, '> one line');
});

// ---------------------------------------------------------------------------
// Cursor placement
// ---------------------------------------------------------------------------

test('a single-line insert shifts the column only', () => {
  const position = resolveCursorPosition('abcd', 2, { line: 7, ch: 5 });

  assert.deepEqual(position, { line: 7, ch: 7 });
});

test('an offset of zero stays at the starting position', () => {
  const position = resolveCursorPosition('abcd', 0, { line: 3, ch: 9 });

  assert.deepEqual(position, { line: 3, ch: 9 });
});

test('crossing a newline restarts the column from the line start', () => {
  // '> [!note]\n> ' with the caret after the second '> '
  const position = resolveCursorPosition('> [!note]\n> ', 12, {
    line: 4,
    ch: 6,
  });

  assert.deepEqual(
    position,
    { line: 5, ch: 2 },
    'the starting column must not leak into the new line',
  );
});

test('several newlines advance the line by the same count', () => {
  const position = resolveCursorPosition('a\nb\nc\nd', 6, { line: 0, ch: 0 });

  assert.deepEqual(position, { line: 3, ch: 0 });
});

test('an offset sitting right after a newline is column zero', () => {
  const position = resolveCursorPosition('```\n\n```', 4, { line: 2, ch: 3 });

  assert.deepEqual(position, { line: 3, ch: 0 });
});

test('a code block template puts the caret inside the fence', () => {
  const { text, cursorOffset } = expandTemplate('```js\n{cursor}\n```', '');
  const position = resolveCursorPosition(text, cursorOffset, {
    line: 10,
    ch: 0,
  });

  assert.equal(text, '```js\n\n```');
  assert.deepEqual(position, { line: 11, ch: 0 });
});

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

test('the smallest table is a header plus one body row', () => {
  const { text } = buildTable(2, 1);

  assert.equal(text, ['|     |', '| --- |', '|     |'].join('\n'));
});

test('columns are repeated across every row', () => {
  const lines = buildTable(2, 3).text.split('\n');

  assert.equal(lines[0], '|     |     |     |');
  assert.equal(lines[1], '| --- | --- | --- |');
  assert.equal(lines[2], '|     |     |     |');
});

test('the row count includes the header but not the delimiter', () => {
  const lines = buildTable(4, 2).text.split('\n');

  assert.equal(lines.length, 5, 'header + delimiter + 3 body rows');
});

test('alignment markers are all the same width so columns line up', () => {
  const widths = (['default', 'left', 'center', 'right'] as const).map(
    (alignment) => buildTable(2, 1, alignment).text.split('\n')[1].length,
  );

  assert.deepEqual(widths, [7, 7, 7, 7]);
});

test('each alignment produces its own delimiter', () => {
  const delimiter = (alignment: 'left' | 'center' | 'right' | 'default') =>
    buildTable(2, 1, alignment).text.split('\n')[1];

  assert.equal(delimiter('default'), '| --- |');
  assert.equal(delimiter('left'), '| :-- |');
  assert.equal(delimiter('center'), '| :-: |');
  assert.equal(delimiter('right'), '| --: |');
});

test('the caret lands inside the first header cell', () => {
  const { text, cursorOffset } = buildTable(3, 3);

  assert.equal(text.slice(0, cursorOffset), '| ');
  assert.equal(
    text.slice(cursorOffset, cursorOffset + 3),
    '   ',
    'the caret sits at the start of the empty cell',
  );
});

test('a single row means a header on its own, which is valid markdown', () => {
  // The top row of the size picker says "1 x n" and must not silently insert
  // two rows, which is what the old clamp did.
  const lines = buildTable(1, 2).text.split('\n');

  assert.equal(lines.length, 2, 'header and delimiter, no body row');
  assert.equal(lines[0], '|     |     |');
  assert.equal(lines[1], '| --- | --- |');
});

test('degenerate sizes are clamped rather than producing broken markdown', () => {
  const lines = buildTable(0, 0).text.split('\n');

  assert.equal(lines.length, 2, 'falls back to the smallest valid table');
  assert.equal(lines[1], '| --- |');
});

test('fractional sizes are floored', () => {
  const lines = buildTable(3.9, 2.7).text.split('\n');

  assert.equal(lines.length, 4);
  assert.equal(lines[0], '|     |     |');
});

test('an unknown alignment falls back to the plain delimiter', () => {
  const { text } = buildTable(2, 1, 'sideways' as never);

  assert.equal(text.split('\n')[1], '| --- |');
});

test('a table pushed onto its own line keeps the caret in the header', () => {
  const { text, cursorOffset } = buildTable(2, 2);
  const body = '\n' + text;
  const position = resolveCursorPosition(body, cursorOffset + 1, {
    line: 12,
    ch: 17,
  });

  assert.deepEqual(
    position,
    { line: 13, ch: 2 },
    'the column of the line it was pushed off must not carry over',
  );
});
