/**
 * Pure text and cursor arithmetic, with no imports of its own.
 *
 * Node runs the test suite by stripping types rather than compiling, and its
 * ESM resolver needs an explicit extension on every relative import - which the
 * build configuration forbids. Keeping the testable logic in a dependency-free
 * leaf module sidesteps that entirely: the tests import this file and nothing
 * else, while the editor-facing wrappers around it stay untested but trivial.
 */

export const CURSOR_PLACEHOLDER = '{cursor}';
export const SELECTION_PLACEHOLDER = '{selection}';
export const LABEL_PLACEHOLDER = '{label}';

export interface expandedTemplate {
  /** The text to insert, placeholders resolved and removed. */
  text: string;
  /** Where the cursor belongs, as an offset into `text`. */
  cursorOffset: number;
}

export interface editorPosition {
  line: number;
  ch: number;
}

/**
 * The markers a value has to carry onto its own continuation lines.
 *
 * Only blockquotes qualify, and only when the placeholder sits behind nothing
 * but their markers. A quote is the one construct that must repeat its prefix
 * on every single line: drop a two-paragraph selection into `> {selection}` and
 * everything past the blank line falls straight out of the callout. A fenced
 * block, by contrast, must not be prefixed at all - hence the deliberately
 * narrow test rather than "reuse whatever leads the line".
 */
function continuationPrefix(lineSoFar: string): string {
  return /^[ \t]*>[>\s]*$/.test(lineSoFar) ? lineSoFar : '';
}

/**
 * Resolves the placeholders of a snippet template.
 *
 * `{selection}` becomes the selected text and `{label}` the snippet's own
 * label - every occurrence, so a template may mention either twice. `{cursor}`
 * marks where the caret ends up; the first one wins and any further ones are
 * simply dropped. A template without a `{cursor}` leaves the caret at the end,
 * which is what typing would do.
 *
 * Everything happens in one pass over the TEMPLATE, which is what keeps the
 * substituted values inert: the selection is the user's own document text and
 * may well contain the word `{cursor}` or `{label}`, and a second pass would
 * then treat it as markup and mangle their note.
 */
export function expandTemplate(
  template: string,
  selection: string,
  label = '',
): expandedTemplate {
  // Kept in step with the exported placeholder constants above.
  const tokens = /\{(cursor|selection|label)\}/g;

  let text = '';
  let cursorOffset = -1;
  let copied = 0;

  for (let token = tokens.exec(template); token; token = tokens.exec(template)) {
    text += template.slice(copied, token.index);
    copied = token.index + token[0].length;

    if (token[1] === 'cursor') {
      if (cursorOffset < 0) cursorOffset = text.length;
      continue;
    }

    const value = token[1] === 'selection' ? selection : label;
    const prefix = continuationPrefix(text.slice(text.lastIndexOf('\n') + 1));

    text += prefix ? value.split('\n').join('\n' + prefix) : value;
  }

  text += template.slice(copied);

  return { text, cursorOffset: cursorOffset < 0 ? text.length : cursorOffset };
}

/**
 * Turns an offset inside inserted text into an editor position.
 *
 * Inserted text may span several lines, so the offset cannot simply be added to
 * the starting column: once a newline is crossed, the column restarts from the
 * beginning of the last line.
 */
export function resolveCursorPosition(
  text: string,
  cursorOffset: number,
  start: editorPosition,
): editorPosition {
  const before = text.slice(0, cursorOffset);
  const lastBreak = before.lastIndexOf('\n');

  if (lastBreak < 0) {
    return { line: start.line, ch: start.ch + before.length };
  }

  return {
    line: start.line + (before.split('\n').length - 1),
    ch: before.length - lastBreak - 1,
  };
}

/**
 * Gives multi-line inserts a line of their own.
 *
 * A table, a callout or a fenced block only renders when it starts at the
 * beginning of a line and is not followed by stray text, so whatever survives
 * the insertion on either side has to be pushed out of the way. Single-line
 * inserts are left alone - wrapping a word in asterisks must stay inline.
 *
 * `textBefore` and `textAfter` are what remains of the line around the point
 * being replaced, not the whole line: inserting mid-sentence has to break on
 * both sides, and replacing a whole line needs no break at all.
 */
export function placeBlock(
  body: string,
  cursorOffset: number,
  textBefore: string,
  textAfter: string,
): expandedTemplate {
  if (!body.includes('\n')) {
    return { text: body, cursorOffset };
  }

  const lead = textBefore.trim() ? '\n' : '';
  const trail = textAfter.trim() ? '\n' : '';

  return {
    text: lead + body + trail,
    cursorOffset: lead.length + cursorOffset,
  };
}

/**
 * Builds the template for a callout block.
 *
 * The keyword inside `[!...]` is what Obsidian matches to pick the icon and the
 * colour, so it always stays English. Anything after it is a free-form title
 * that Obsidian renders in place of the default one - which is exactly how a
 * translated heading gets into the note without breaking the callout.
 *
 * With a title the caret goes straight to the body, since the heading is
 * already written. Without one it stops on the heading so it can be typed.
 */
export function buildCalloutTemplate(id: string, title: string): string {
  const heading = title.trim();

  return heading
    ? `> [!${id}] ${heading}\n> ${CURSOR_PLACEHOLDER}${SELECTION_PLACEHOLDER}`
    : `> [!${id}] ${CURSOR_PLACEHOLDER}\n> ${SELECTION_PLACEHOLDER}`;
}

export type tableAlignment = 'default' | 'left' | 'center' | 'right';

export const TABLE_ALIGNMENTS: tableAlignment[] = [
  'default',
  'left',
  'center',
  'right',
];

/**
 * All four are three characters wide, so the columns of the generated source
 * line up whatever the alignment is.
 */
const DELIMITERS: Record<tableAlignment, string> = {
  default: '---',
  left: ':--',
  center: ':-:',
  right: '--:',
};

const CELL_WIDTH = 3;

export const MAX_TABLE_ROWS = 6;
export const MAX_TABLE_COLUMNS = 6;

function tableRow(cells: string[]): string {
  return '|' + cells.map((cell) => ` ${cell} `).join('|') + '|';
}

/**
 * Builds the source of an empty markdown table.
 *
 * `rows` counts the header, so 1 means a header on its own - valid markdown,
 * and what the top row of the size picker promises. The delimiter row is never
 * counted, it is structural.
 */
export function buildTable(
  rows: number,
  columns: number,
  alignment: tableAlignment = 'default',
): expandedTemplate {
  const safeRows = Math.max(1, Math.floor(rows));
  const safeColumns = Math.max(1, Math.floor(columns));

  const empty = ' '.repeat(CELL_WIDTH);
  const delimiter = DELIMITERS[alignment] || DELIMITERS.default;

  const lines = [
    tableRow(new Array(safeColumns).fill(empty)),
    tableRow(new Array(safeColumns).fill(delimiter)),
  ];

  for (let line = 2; line < safeRows + 1; line++) {
    lines.push(tableRow(new Array(safeColumns).fill(empty)));
  }

  return {
    text: lines.join('\n'),
    // Right after the leading '| ' of the first header cell.
    cursorOffset: 2,
  };
}
