import { MarkdownView, WorkspaceLeaf } from 'obsidian';

export function checkIfSelection(editor: CodeMirror.Editor) {
  const selection = editor.getSelection();
  if (!selection || selection === '') {
    return false;
  } else {
    return true;
  }
}

/**
 * Stamps every entry of a formatter table with its own key as `id`.
 *
 * The key is already a stable identifier, so deriving `id` from it keeps the
 * two from ever drifting apart. This is what lets `des` become a plain display
 * label that translations may replace, while dispatch and lookups keep using
 * `id`.
 */
export function withIds<T extends Record<string, object>>(
  settings: T,
): { [K in keyof T]: T[K] & { id: string } } {
  Object.keys(settings).forEach((key) => {
    // @ts-ignore - the mapped return type is what makes `id` visible
    settings[key].id = key;
  });

  return settings as { [K in keyof T]: T[K] & { id: string } };
}

export function checkIfMarkdownSource(leaf: WorkspaceLeaf) {
  return (
    // @ts-ignore
    leaf.view instanceof MarkdownView && leaf.view.currentMode.type === 'source'
  );
}
