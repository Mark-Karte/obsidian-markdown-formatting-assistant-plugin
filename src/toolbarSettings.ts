/**
 * What the toolbar stores and how that list is kept sane. A leaf module with
 * no imports, so the tests can reach it - see the note in textPlacement.ts.
 *
 * The toolbar is a list of Obsidian command ids and nothing else. That is the
 * whole design: anything registered as a command can sit on it, including
 * Obsidian's own and other plugins', not merely this one's buttons.
 */

/**
 * Must match the `id` in manifest.json - Obsidian namespaces every command by
 * it, so the default buttons below would resolve to nothing if the two drifted.
 * There is a test on exactly that.
 */
export const PLUGIN_ID = 'obsidian-markdown-formatting-assistant-plugin';

/**
 * A ceiling rather than a design limit. The toolbar wraps, so a long list
 * costs the user their writing space rather than breaking anything - but a
 * settings file that somehow grew unbounded should not take the editor with it.
 */
export const MAX_TOOLBAR_COMMANDS = 40;

/** Everyday formatting, in the order a toolbar usually reads. */
export const DEFAULT_TOOLBAR_COMMANDS = [
  'h1',
  'h2',
  'h3',
  'bold',
  'italic',
  'strikethrough',
  'highlight',
  'codeInline',
  'blockquote',
  'bulletList',
  'numberList',
  'checkList',
  'link',
].map((id) => `${PLUGIN_ID}:${id}`);

export interface toolbarSetting {
  /** Off until asked for: the bar takes room from the note. */
  enabled: boolean;
  /** Command ids, in the order the buttons appear. */
  commands: string[];
}

export const DEFAULT_TOOLBAR: toolbarSetting = {
  enabled: false,
  commands: DEFAULT_TOOLBAR_COMMANDS,
};

/** As much of a command as the picker needs to know about. */
export interface namedCommand {
  id: string;
  name: string;
}

/**
 * Every registered command, in the order a person would look for one.
 *
 * Takes the whole register on purpose. Obsidian also offers `listCommands()`,
 * which answers a different question - what can run *right now* - and with the
 * settings dialog focused there is no editor, so every command that writes to a
 * note is missing from it. That is all but one of this plugin's and most of
 * Obsidian's, which is exactly what the picker is for.
 *
 * This plugin's own commands come first, and that ordering matters rather than
 * being a courtesy: a suggester renders only its first screenful until a query
 * narrows it. Obsidian prefixes every command name with the plugin it belongs
 * to, so sorting the whole register by name buries this one's under M, behind
 * several hundred of Obsidian's - present, findable by typing, and invisible to
 * anyone who scrolls.
 */
export function sortedCommands<T extends namedCommand>(
  commands: Record<string, T>,
): T[] {
  const all = Object.values(commands || {});
  const byName = (a: T, b: T) => (a.name || '').localeCompare(b.name || '');
  const isOwn = (command: T) => (command.id || '').startsWith(`${PLUGIN_ID}:`);

  return [
    ...all.filter(isOwn).sort(byName),
    ...all.filter((command) => !isOwn(command)).sort(byName),
  ];
}

/**
 * Rebuilds the stored list into something safe to render.
 *
 * Anything at all can be in a settings file - it is hand-editable, it is
 * synced between machines, and it is written by older versions of this plugin.
 * A duplicate id is the interesting case: two buttons would run the same
 * command, and removing one of them would look like it removed both.
 */
export function normaliseToolbarCommands(value: unknown): string[] {
  if (!Array.isArray(value)) return [...DEFAULT_TOOLBAR_COMMANDS];

  const seen = new Set<string>();
  const commands: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') continue;

    const id = entry.trim();

    if (!id || seen.has(id)) continue;

    seen.add(id);
    commands.push(id);

    if (commands.length === MAX_TOOLBAR_COMMANDS) break;
  }

  return commands;
}

/**
 * Moves one button to another position.
 *
 * Written as remove-then-insert rather than as a swap. The panel's own
 * reordering used to swap the two entries, which is only the same thing for
 * neighbours: dragging the first button to the end there sent the last one to
 * the front rather than shifting the rest along.
 */
export function moveCommand(
  commands: string[],
  from: number,
  to: number,
): string[] {
  const next = [...commands];

  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from >= next.length ||
    to < 0 ||
    to >= next.length ||
    from === to
  ) {
    return next;
  }

  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
}
