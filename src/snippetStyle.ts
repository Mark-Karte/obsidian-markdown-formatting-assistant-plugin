/**
 * Appearance choices for user-defined snippets. A leaf module with no imports,
 * so the tests can reach it directly - see the note in textPlacement.ts.
 */

/** Offered in the snippet editor when the user has no saved colours yet. */
export const DEFAULT_SNIPPET_COLORS = [
  '#448aff',
  '#00b8d4',
  '#00bfa5',
  '#00c853',
  '#63c000',
  '#ffab00',
  '#ff6f00',
  '#ff5252',
  '#e91e63',
  '#7c4dff',
];

/**
 * A small, deliberately mixed set of lucide icons - Obsidian ships them all, so
 * no assets are needed and they match the callout buttons visually.
 */
export const SNIPPET_ICONS = [
  'lucide-star',
  'lucide-pencil',
  'lucide-info',
  'lucide-check-circle-2',
  'lucide-alert-triangle',
  'lucide-flame',
  'lucide-bookmark',
  'lucide-tag',
  'lucide-quote',
  'lucide-code',
  'lucide-list',
  'lucide-table',
  'lucide-link',
  'lucide-image',
  'lucide-calendar',
  'lucide-clock',
  'lucide-heart',
  'lucide-zap',
];

/** The colour a snippet gets when the user has not picked one. */
export const DEFAULT_SNIPPET_COLOR = DEFAULT_SNIPPET_COLORS[0];

/**
 * Turns '#rrggbb' into an rgba() tint for the button background.
 *
 * Anything that is not a six-digit hex colour yields a transparent background
 * rather than an invalid CSS value, so a half-typed colour in the settings
 * cannot break the panel.
 */
export function tintFromColor(color: string, alpha = 0.12): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec((color || '').trim());
  if (!match) return 'transparent';

  const value = parseInt(match[1], 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Colour presets to show in the snippet editor.
 *
 * The user's own saved colours come first and the built-in palette tops the row
 * up to a full strip. Showing the saved ones alone was the obvious reading of
 * "replace the presets with mine", but someone who has picked two colours then
 * gets a two-swatch row and no way back to the rest.
 */
export function snippetColorPresets(savedColors: string[]): string[] {
  const presets: string[] = [];
  const seen = new Set<string>();

  for (const color of (savedColors || []).concat(DEFAULT_SNIPPET_COLORS)) {
    const value = (color || '').trim();

    // Compared case-insensitively, so a hand-typed '#FF0000' does not sit next
    // to the palette's own '#ff0000' as if they were two different colours.
    if (!/^#[0-9a-fA-F]{6}$/.test(value) || seen.has(value.toLowerCase())) {
      continue;
    }

    seen.add(value.toLowerCase());
    presets.push(value);

    if (presets.length === DEFAULT_SNIPPET_COLORS.length) break;
  }

  return presets;
}
