import type { Editor } from 'obsidian';
import { buildTable, placeBlock, resolveCursorPosition } from './textPlacement';
import type { tableAlignment } from './textPlacement';
import { surroundingText } from './generalFunctions';

export {
  MAX_TABLE_COLUMNS,
  MAX_TABLE_ROWS,
  TABLE_ALIGNMENTS,
} from './textPlacement';
export type { tableAlignment } from './textPlacement';

export function tableFormatter(
  editor: Editor,
  rows: number,
  columns: number,
  alignment: tableAlignment,
) {
  if (!editor) return;

  const start = editor.getCursor('from');
  const { before, after } = surroundingText(editor);

  editor.focus();

  const table = buildTable(rows, columns, alignment);
  const { text, cursorOffset } = placeBlock(
    table.text,
    table.cursorOffset,
    before,
    after,
  );

  editor.replaceSelection(text);
  editor.setCursor(resolveCursorPosition(text, cursorOffset, start));
}
