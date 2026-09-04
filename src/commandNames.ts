/**
 * Names for Obsidian's own command palette and hotkey list. A leaf module with
 * no imports, so the tests can reach it - see the note in textPlacement.ts.
 *
 * The panel's labels are terse keys like 'code_block'. They work as search
 * terms in this plugin's own window, but the hotkey list sits next to entries
 * such as "Toggle bold", so they are widened just enough to be readable -
 * without inventing and translating a second name for every button.
 */

/** Turns a panel label into the name shown in Obsidian's command list. */
export function commandName(label: string): string {
  const words = (label || '').trim().replace(/_/g, ' ');

  if (!words) return '';

  // 'h1' through 'h6' keep their shape on purpose: that is what the panel
  // button says and what people type when they search for it.
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * What to write on a toolbar button for a command that has no icon.
 *
 * Obsidian prefixes a command's name with the plugin it came from, so the
 * useful part is whatever follows the last colon - and even that is often a
 * sentence. Two characters is what fits a square button; the full name is on
 * the tooltip either way.
 */
export function shortLabel(name: string): string {
  const parts = (name || '').split(':');
  const tail = parts[parts.length - 1].trim();

  return tail.slice(0, 2);
}
