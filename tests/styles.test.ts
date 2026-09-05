import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The plugin's own class names, checked from both ends.
 *
 * Moving styling out of JavaScript and into the stylesheet trades one failure
 * mode for another: a mistyped class name is not an error anywhere, it just
 * silently renders unstyled. Nothing else in the toolchain connects the two
 * files, so this does.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

/** Comments in either file mention class names while not using them. */
const withoutComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * Element ids, which share the prefix but are a different namespace.
 *
 * They are prefixed for the same reason the classes are - 'colorInput' and
 * 'lastSavedColorsDiv' were generic enough to collide with another plugin or a
 * theme snippet, and the panel looks several of them up by id, so a collision
 * would find the wrong element rather than fail. Listing them here is what
 * keeps the class check below from demanding a stylesheet rule for each.
 */
const ELEMENT_IDS = new Set([
  'mfa-panel-root',
  'mfa-region-',
  'mfa-recent-colors',
  'mfa-saved-colors',
  'mfa-color-input',
  'mfa-option-color',
  'mfa-option-background',
  'mfa-option-style',
  'mfa-option-html',
]);

const names = (source: string) =>
  new Set(
    [...withoutComments(source).matchAll(/mfa-[a-z0-9-]+/g)]
      .map((m) => m[0])
      .filter((name) => !ELEMENT_IDS.has(name)),
  );

const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const defined = names(css);

const sources = fs
  .readdirSync(path.join(ROOT, 'src'))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => fs.readFileSync(path.join(ROOT, 'src', file), 'utf8'));

const used = new Set<string>();
sources.forEach((source) => names(source).forEach((name) => used.add(name)));

test('the stylesheet defines some classes at all', () => {
  // Guards the extraction itself: a broken regex would make both checks pass
  // by comparing two empty sets.
  assert.ok(defined.size > 10, `only ${defined.size} classes found in the CSS`);
  assert.ok(used.size > 10, `only ${used.size} classes found in the sources`);
});

test('every class the code applies is defined in the stylesheet', () => {
  const missing = [...used].filter((name) => !defined.has(name)).sort();

  assert.deepEqual(missing, [], 'these render unstyled');
});

test('the stylesheet carries no class the code never applies', () => {
  const orphans = [...defined].filter((name) => !used.has(name)).sort();

  assert.deepEqual(orphans, [], 'these are dead rules');
});

test('no styling is assigned from JavaScript', () => {
  // Obsidian's plugin guidelines: "Don't do this: el.style.color = 'white'".
  // setProperty is deliberately allowed - a swatch colour comes from the user's
  // settings, and a custom property is how the stylesheet takes delivery of a
  // value it cannot know in advance.
  const offenders: string[] = [];

  fs.readdirSync(path.join(ROOT, 'src'))
    .filter((file) => file.endsWith('.ts'))
    .forEach((file) => {
      const source = withoutComments(
        fs.readFileSync(path.join(ROOT, 'src', file), 'utf8'),
      );

      source.split('\n').forEach((line, index) => {
        if (/\.style\.[a-zA-Z]+\s*=/.test(line)) {
          offenders.push(`${file}:${index + 1}`);
        }
      });
    });

  assert.deepEqual(offenders, [], 'move these into styles.css');
});

test('nothing writes markup as a string', () => {
  // "Avoid innerHTML, outerHTML and insertAdjacentHTML" - same guidelines.
  const offenders: string[] = [];

  fs.readdirSync(path.join(ROOT, 'src'))
    .filter((file) => file.endsWith('.ts'))
    .forEach((file) => {
      const source = withoutComments(
        fs.readFileSync(path.join(ROOT, 'src', file), 'utf8'),
      );

      source.split('\n').forEach((line, index) => {
        if (/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(line)) {
          offenders.push(`${file}:${index + 1}`);
        }
      });
    });

  assert.deepEqual(offenders, [], 'build these with the DOM API instead');
});
