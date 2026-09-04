import { Editor } from 'obsidian';

export function colorFormatter(editor: Editor, color: string) {
  if (!editor) return;

  const curserStart = editor.getCursor('from');

  editor.focus();

  // Both paths land on the same result - replaceSelection inserts at the
  // cursor when nothing is selected.
  editor.replaceSelection(color);
  editor.setCursor(curserStart);
}
