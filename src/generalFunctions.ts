import { Editor, MarkdownView, Workspace } from 'obsidian';

/**
 * The editor of the markdown pane the user was last in, or null when there is
 * none to write to.
 *
 * The buttons live in a side panel, so the markdown pane is never the *active*
 * leaf while one is clicked - hence "most recent" rather than "active". Reading
 * mode is excluded because inserting into it would be discarded.
 */
export function getTargetEditor(workspace: Workspace): Editor | null {
  const view = workspace.getMostRecentLeaf()?.view;

  if (!(view instanceof MarkdownView)) return null;
  if (view.getMode() !== 'source') return null;

  return view.editor;
}

/**
 * Stamps every entry of a formatter table with its own key as `id`.
 *
 * The key is already a stable identifier, so deriving `id` from it keeps the
 * two from ever drifting apart. This is what lets `des` become a plain display
 * label that translations may replace, while dispatch and lookups keep using
 * `id`.
 */
/**
 * What survives on the line around the range about to be replaced.
 *
 * Needed to decide whether a block insert has to break onto its own line: the
 * whole line is the wrong question, since the selection being replaced may be
 * the entire line, or only part of it.
 */
export function surroundingText(editor: Editor): {
  before: string;
  after: string;
} {
  const from = editor.getCursor('from');
  const to = editor.getCursor('to');

  return {
    before: editor.getLine(from.line).slice(0, from.ch),
    after: editor.getLine(to.line).slice(to.ch),
  };
}

export function withIds<T extends Record<string, object>>(
  settings: T,
): { [K in keyof T]: T[K] & { id: string } } {
  Object.keys(settings).forEach((key) => {
    // @ts-ignore - the mapped return type is what makes `id` visible
    settings[key].id = key;
  });

  return settings as { [K in keyof T]: T[K] & { id: string } };
}
