/**
 * The scrap of markup that button labels carry, split into pieces a caller can
 * build with the DOM API. A leaf module with no imports, so the tests can reach
 * it - see the note in textPlacement.ts.
 *
 * Labels such as 'x<sup>y</sup>' used to reach the page through innerHTML.
 * Obsidian's guidelines rule that out - "Avoid innerHTML, outerHTML and
 * insertAdjacentHTML" - and while today's labels are all plugin constants, a
 * table is only ever one contribution away from holding something else.
 */

export type markupTag = 'text' | 'sup' | 'sub';

export interface markupPart {
  tag: markupTag;
  value: string;
}

/**
 * Splits a label into plain text and its superscript and subscript runs.
 *
 * Only `<sup>` and `<sub>` are recognised, because those are the only tags the
 * tables use. Anything else stays literal text, which is the safe direction to
 * fail in: a caller writing it as a text node shows the user a stray tag rather
 * than executing it.
 */
export function splitMarkup(label: string): markupPart[] {
  const source = label || '';
  const parts: markupPart[] = [];
  const tags = /<(sup|sub)>([\s\S]*?)<\/\1>/g;

  let copied = 0;

  for (let match = tags.exec(source); match; match = tags.exec(source)) {
    if (match.index > copied) {
      parts.push({ tag: 'text', value: source.slice(copied, match.index) });
    }

    parts.push({ tag: match[1] as markupTag, value: match[2] });
    copied = match.index + match[0].length;
  }

  if (copied < source.length) {
    parts.push({ tag: 'text', value: source.slice(copied) });
  }

  return parts;
}
