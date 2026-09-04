/**
 * Translation layer for everything the user reads.
 *
 * English is the source of truth: its keys define the `TranslationKey` type, so
 * a typo in a `t()` call is a build error rather than a blank label. Other
 * locales are partial - anything they leave out falls back to English, which
 * means a half-finished translation still yields a usable interface.
 *
 * The dictionaries themselves live in ./locales, one file per language.
 */

import { en, LOCALE_NAMES, LOCALES, LocaleCode, TranslationKey } from './locales';

export { LOCALE_NAMES, LocaleCode, TranslationKey };

export const AUTO_LOCALE = 'auto';

export type LocaleSetting = LocaleCode | typeof AUTO_LOCALE;

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as LocaleCode[];

/**
 * Region names are persisted in the settings file, so they must never change.
 * This maps them to the label the user sees, for both the panel and settings.
 */
const SECTION_LABEL_KEYS: Record<string, TranslationKey> = {
  textEdit: 'section.textEdit',
  tables: 'section.tables',
  html: 'section.html',
  latex: 'section.latex',
  greekLetters: 'section.greekLetters',
  colors: 'section.colors',
  callouts: 'section.callouts',
  custom: 'section.custom',
};

let activeLocale: LocaleCode = 'en';

function isSupported(code: string): code is LocaleCode {
  return SUPPORTED_LOCALES.indexOf(code as LocaleCode) >= 0;
}

/**
 * Obsidian keeps the interface language in local storage under 'language'.
 * The browser locale is the fallback for the rare case where it is unset.
 *
 * Regional variants collapse onto the base language, so 'pt-BR' resolves to
 * 'pt'. The one place that loses information is Traditional Chinese, which
 * lands on the Simplified dictionary.
 */
export function detectLocale(): LocaleCode {
  let candidate = '';

  try {
    candidate = window.localStorage.getItem('language') || '';
  } catch (error) {
    candidate = '';
  }

  if (!candidate) candidate = navigator.language || '';

  const normalised = candidate.toLowerCase().split('-')[0];

  return isSupported(normalised) ? normalised : 'en';
}

export function setLocale(setting: LocaleSetting): void {
  if (setting === AUTO_LOCALE) {
    activeLocale = detectLocale();
    return;
  }

  activeLocale = isSupported(setting) ? setting : 'en';
}

export function getLocale(): LocaleCode {
  return activeLocale;
}

/**
 * Looks up a key in the active locale and substitutes `{name}` placeholders.
 *
 * Only names present in `vars` are substituted, so literal braces in a label -
 * such as the '{your color}' in the colour options - are left alone.
 */
export function t(
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const template = LOCALES[activeLocale][key] || en[key];

  if (!vars) return template;

  return Object.keys(vars).reduce(
    (text, name) => text.split('{' + name + '}').join(String(vars[name])),
    template,
  );
}

export function sectionLabel(regionName: string): string {
  const key = SECTION_LABEL_KEYS[regionName];
  return key ? t(key) : regionName;
}

/**
 * Callout ids double as the Obsidian keyword in '> [!note]', so they stay
 * English forever. Only the button label goes through here.
 */
export function calloutLabel(calloutId: string): string {
  const key = ('callout.' + calloutId) as TranslationKey;
  return en[key] ? t(key) : calloutId;
}
