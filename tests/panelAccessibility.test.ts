import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The side panel's buttons, checked by reading the source.
 *
 * They are divs carrying Obsidian's own styling, so nothing about them is a
 * button except what the code puts there. Every one of them has to go through
 * asButton, and the failure is silent in the worst way: a mouse user sees no
 * difference at all, while for someone using a screen reader the button simply
 * does not exist - most of them hold a drawing and no text.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

const panel = fs.readFileSync(
  path.join(ROOT, 'src', 'SidePanelControlView.ts'),
  'utf8',
);

const withoutComments = (source: string) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ''))
    .replace(/^(\s*)\/\/.*$/gm, '$1');

const code = withoutComments(panel);

test('asButton gives the div everything the element type would have', () => {
  const body = code.slice(code.indexOf('private asButton('));

  for (const required of [
    "setAttribute('role', 'button')",
    "setAttribute('aria-label', label)",
    'tabIndex = 0',
  ]) {
    assert.ok(body.includes(required), `asButton is missing ${required}`);
  }
});

test('and makes Enter and Space activate it', () => {
  const body = code.slice(code.indexOf('private asButton('));

  assert.ok(body.includes("'Enter'"), 'Enter does not activate the button');
  assert.ok(body.includes("' '"), 'Space does not activate the button');
  assert.ok(
    body.includes('preventDefault'),
    'Space would scroll the panel instead of pressing the button',
  );
});

test('every click in the panel is bound through asButton', () => {
  // One call, the one inside asButton itself. Anything else is a control that
  // the keyboard cannot reach and a screen reader will not announce.
  const bindings = code.match(/\.onClickEvent\(/g) || [];
  const listeners = code.match(/addEventListener\(\s*'click'/g) || [];

  assert.equal(bindings.length, 1, 'a click is bound outside asButton');
  assert.deepEqual(listeners, [], 'a click is bound outside asButton');
});

test('the checkboxes are tied to their labels', () => {
  // Without htmlFor the words beside the box do nothing when clicked, and a
  // screen reader announces four checkboxes with no names.
  const helper = code.slice(code.indexOf('const addCheckbox ='));

  assert.ok(
    helper.slice(0, 500).includes('label.htmlFor'),
    'the checkbox label is not associated with its input',
  );
});

test('a focused button is visible', () => {
  // A div gets no focus ring worth seeing, which would leave the tab order
  // working but invisible.
  const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

  assert.ok(
    /\[role=['"]button['"]\]:focus-visible/.test(css),
    'nothing marks the focused button',
  );
});

test('the toolbar uses a real button rather than this pattern', () => {
  // It is not built on Obsidian's div styling, so it has no reason to
  // reimplement what the element type provides.
  const toolbar = withoutComments(
    fs.readFileSync(path.join(ROOT, 'src', 'toolbar.ts'), 'utf8'),
  );

  assert.ok(toolbar.includes("createEl('button'"), 'expected a real button');
  assert.ok(toolbar.includes("aria-label"), 'the button has no name');
});
