import type { Editor } from 'obsidian';
import {
  buildCalloutTemplate,
  expandTemplate,
  LABEL_PLACEHOLDER,
  placeBlock,
  resolveCursorPosition,
} from './textPlacement';
import { surroundingText } from './generalFunctions';

export {
  CURSOR_PLACEHOLDER,
  SELECTION_PLACEHOLDER,
  LABEL_PLACEHOLDER,
} from './textPlacement';

/**
 * A snippet the user defined themselves.
 *
 * Unlike the built-in tables, these carry no hand-counted `shift` or
 * `selectionInput`: nobody is going to count characters to place their own
 * cursor. The template says where things go instead.
 */
export interface customSnippetSetting {
  /** Stable identifier, generated once and persisted with the snippet. */
  id: string;
  /** Display label, shown on the button and matched by the search. */
  des: string;
  /** Body, with optional {cursor} and {selection} placeholders. */
  template: string;
  /**
   * Accent colour as a hex string. Drives both the icon and a translucent
   * background, the way the callout buttons work.
   */
  color: string;
  /** Lucide icon name, or an empty string for a button without one. */
  icon: string;
  objectType: string;
}

/** Ready-made snippets offered in the editor, so nobody starts from a blank field. */
export const SNIPPET_EXAMPLES = [
  {
    labelKey: 'settings.customSnippets.exampleCallout',
    // Built from the same helper as the built-in callouts, with the label as
    // the heading: a snippet called "Информация" has to produce a callout
    // headed "Информация", not Obsidian's default English "Note".
    template: buildCalloutTemplate('note', LABEL_PLACEHOLDER),
  },
  { labelKey: 'settings.customSnippets.exampleWrap', template: '**{selection}{cursor}**' },
  { labelKey: 'settings.customSnippets.exampleBlock', template: '```\n{selection}{cursor}\n```' },
] as const;

/** A snippet only does something once it has a body to insert. */
export function isUsableSnippet(snippet: customSnippetSetting): boolean {
  return Boolean(snippet && snippet.template);
}

export function customFormatter(editor: Editor, item: customSnippetSetting) {
  if (!editor) return;

  // Without this an unfinished snippet would replace the selection with
  // nothing - a button that silently deletes the user's text.
  if (!isUsableSnippet(item)) return;

  const selection = editor.getSelection();
  const start = editor.getCursor('from');
  const { before, after } = surroundingText(editor);

  editor.focus();

  const expanded = expandTemplate(item.template, selection, item.des || '');

  // A multi-line snippet - a callout, a fenced block - has to start its own
  // line or it renders as plain text. Single-line ones stay inline.
  const { text, cursorOffset } = placeBlock(
    expanded.text,
    expanded.cursorOffset,
    before,
    after,
  );

  editor.replaceSelection(text);
  editor.setCursor(resolveCursorPosition(text, cursorOffset, start));
}
