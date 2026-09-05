/**
 * Turning lines into quotes, bullets, numbers and tasks - and back. A leaf
 * module with no imports, so the tests can reach it - see the note in
 * textPlacement.ts.
 *
 * All of this is per line by definition: a list marker means something only at
 * the start of one. The editor's job is to decide which lines are involved;
 * this decides what happens to them.
 */

export type markerKind = 'quote' | 'list';

/**
 * What may sit in front of a marker.
 *
 * For a list that includes any quote markers, because a list inside a quote is
 * written `> - item`. Putting the bullet first would produce `- > item`, which
 * is a list containing a quote - a different thing, and not what the button
 * was asked for.
 *
 * A quote marker has only indentation in front of it; it is the outermost
 * thing on the line by nature.
 */
const lead = (kind: markerKind) => (kind === 'quote' ? '\\s*' : '\\s*(?:>\\s*)*');

/** A line with nothing on it takes no marker - an empty bullet helps nobody. */
const isBlank = (line: string) => line.trim() === '';

/**
 * Adds the marker to every line, or removes it from every line if they all
 * have it already.
 *
 * Toggling off requires all of them to be marked, so that adding to a
 * half-converted selection finishes the job rather than undoing it. Blank
 * lines are not counted either way: one empty line in the middle of a list
 * would otherwise be enough to make the button stop turning it off.
 */
export function toggleLineMarker(
  lines: string[],
  symbol: string,
  kind: markerKind,
): string[] {
  // The symbol goes into a regex, so its own special characters have to be
  // escaped - '1. ' would otherwise let the dot match anything.
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const marker = new RegExp('^(' + lead(kind) + ')' + escaped);
  const prefix = new RegExp('^(' + lead(kind) + ')');

  const has = (line: string) => marker.test(line);
  const add = (line: string) =>
    kind === 'quote'
      ? symbol + line
      : line.replace(prefix, (_full, before) => before + symbol);
  const remove = (line: string) => line.replace(marker, '$1');

  const written = lines.filter((line) => !isBlank(line));
  const allMarked = written.length > 0 && written.every(has);

  return lines.map((line) => {
    if (isBlank(line)) return line;
    if (allMarked) return remove(line);

    return has(line) ? line : add(line);
  });
}
