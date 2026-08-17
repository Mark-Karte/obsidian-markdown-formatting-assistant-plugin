import { LocaleDictionary, en } from './en';
import { be } from './be';
import { de } from './de';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { ja } from './ja';
import { ko } from './ko';
import { pt } from './pt';
import { ru } from './ru';
import { uk } from './uk';
import { zh } from './zh';

/**
 * Adding a language means writing one dictionary file and adding it here -
 * `LocaleCode`, the settings dropdown and the detection all derive from this
 * object, so no other code changes.
 */
export const LOCALES = {
  en,
  be,
  de,
  es,
  fr,
  it,
  ja,
  ko,
  pt,
  ru,
  uk,
  zh,
};

export type LocaleCode = keyof typeof LOCALES;

/** Language names are shown in their own language, as language pickers do. */
export const LOCALE_NAMES: Record<LocaleCode, string> = {
  en: 'English',
  be: 'Беларуская',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  ru: 'Русский',
  uk: 'Українська',
  zh: '简体中文',
};

export { en, LocaleDictionary };
export { TranslationKey } from './en';
