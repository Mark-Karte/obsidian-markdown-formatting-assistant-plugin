/**
 * What clicking a colour writes into the note. A leaf module with no imports,
 * so the tests can reach it - see the note in textPlacement.ts.
 *
 * The four checkboxes in the Colors section describe two quite different
 * jobs, and the old code ran them together. Three of them build a fragment of
 * CSS to be pasted into a tag you are already writing; the fourth wraps text.
 * Splitting them is what lets a selection be coloured rather than destroyed.
 */

export interface colorOptions {
  /** Add a `color:` declaration. */
  color: boolean;
  /** Add a `background-color:` declaration. */
  background: boolean;
  /** Wrap the declarations in a `style="..."` attribute. */
  styleAttribute: boolean;
  /** Produce a tag rather than a fragment. */
  html: boolean;
}

function declarations(color: string, options: colorOptions): string {
  if (options.color && options.background) {
    return `color: ${color}; background-color: ${color}`;
  }

  if (options.background) return `background-color: ${color}`;
  if (options.color) return `color: ${color}`;

  return color;
}

/**
 * The code to insert when nothing is selected.
 *
 * `<font color>` takes a colour and not a declaration, so it uses the colour
 * as picked. Ticking the style attribute together with the tag used to emit
 * `<font color="style="color: #fff"">`, which is not markup at all.
 */
export function colorCode(color: string, options: colorOptions): string {
  if (options.html) return `<font color="${color}"></font>`;

  const body = declarations(color, options);

  return options.styleAttribute ? `style="${body}"` : body;
}

/**
 * How to colour text that is selected.
 *
 * There is only one useful answer to "colour this", so it does not depend on
 * whether the tag checkbox happens to be ticked: a fragment like
 * `color: #ff0000` cannot wrap anything, and writing it over the selection is
 * what used to lose people their text.
 *
 * The background is the one choice that changes the wrapper. `<font color>`
 * can only set the text colour, so asking for a background has to produce a
 * span - otherwise the click would quietly do something else.
 */
export function wrapWithColor(
  color: string,
  selection: string,
  options: colorOptions,
): string {
  if (options.background) {
    return `<span style="${declarations(color, options)}">${selection}</span>`;
  }

  return `<font color="${color}">${selection}</font>`;
}
