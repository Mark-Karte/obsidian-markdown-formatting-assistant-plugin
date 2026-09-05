/**
 * Moving one item of a list to another position. A leaf module with no imports,
 * so the tests can reach it - see the note in textPlacement.ts.
 *
 * Its own file because three separate lists are reordered by dragging - the
 * toolbar buttons, the saved colours and the panel's sections - and each used
 * to carry its own copy of the arithmetic. Two of those copies were wrong in
 * the same way.
 */

/**
 * Removes the item at `from` and inserts it at `to`.
 *
 * Deliberately not a swap. A swap is the same thing only for neighbours: drag
 * the first item onto the last and a swap sends the last one to the front,
 * while everything between it stays put. What the gesture asks for is that the
 * dragged item lands there and the rest close up behind it.
 *
 * An index that does not resolve leaves the list alone, because a drop can
 * arrive from anywhere - another application, a file dragged out of the
 * explorer, a stray text selection.
 */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];

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
