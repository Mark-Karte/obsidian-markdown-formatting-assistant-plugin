import { Editor } from 'obsidian';
import { surroundingText, withIds } from './generalFunctions';
import {
  buildCalloutTemplate,
  expandTemplate,
  placeBlock,
  resolveCursorPosition,
} from './textPlacement';

export interface calloutsFormatterSetting {
  /**
   * Stable identifier, derived from the table key. Never translated - it is
   * also the keyword Obsidian matches inside '> [!note]'.
   */
  id: string;
  /** Display label shown to the user - translatable. */
  des: string;
  text: string;
  icon: string;
  color: string;
  bgColor: string;
  newLine: boolean;
}

export const calloutsFormatterSettings = withIds({
  note: {
    des: 'note',
    text: 'Note',
    icon: 'lucide-pencil',
    color: 'rgb(68,138,255)',
    bgColor: 'rgba(68,138,255,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  info: {
    des: 'info',
    text: 'Info',
    icon: 'lucide-info',
    color: 'rgb(0,184,212)',
    bgColor: 'rgba(0,184,212,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  todo: {
    des: 'todo',
    text: 'Todo',
    icon: 'lucide-check-circle-2',
    color: 'rgb(0,184,212)',
    bgColor: 'rgba(0,184,212,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  abstract: {
    des: 'abstract',
    text: 'Abstract',
    icon: 'lucide-clipboard-list',
    color: 'rgb(0, 176, 255)',
    bgColor: 'rgba(0, 176, 255,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  summary: {
    des: 'summary',
    text: 'Summary',
    icon: 'lucide-clipboard-list',
    color: 'rgb(0, 176, 255)',
    bgColor: 'rgba(0, 176, 255,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  tldr: {
    des: 'tldr',
    text: 'TLDR',
    icon: 'lucide-clipboard-list',
    color: 'rgb(0, 176, 255)',
    bgColor: 'rgba(0, 176, 255,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  //step 2
  tip: {
    des: 'tip',
    text: 'Tip',
    icon: 'lucide-flame',
    color: 'rgb(0, 191, 165)',
    bgColor: 'rgba(0, 191, 165,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  hint: {
    des: 'hint',
    text: 'Hint',
    icon: 'lucide-flame',
    color: 'rgb(0, 191, 165)',
    bgColor: 'rgba(0, 191, 165,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  important: {
    des: 'important',
    text: 'Important',
    icon: 'lucide-flame',
    color: 'rgb(0, 191, 165)',
    bgColor: 'rgba(0, 191, 165,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  success: {
    des: 'success',
    text: 'Success',
    icon: 'lucide-check',
    color: 'rgb(0, 200, 83)',
    bgColor: 'rgba(0, 200, 83,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  check: {
    des: 'check',
    text: 'Check',
    icon: 'lucide-check',
    color: 'rgb(0, 200, 83)',
    bgColor: 'rgba(0, 200, 83,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  done: {
    des: 'done',
    text: 'Done',
    icon: 'lucide-check',
    color: 'rgb(0, 200, 83)',
    bgColor: 'rgba(0, 200, 83,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  question: {
    des: 'question',
    text: 'Question',
    icon: 'help-circle',
    color: 'rgb(100, 221, 23)',
    bgColor: 'rgba(100, 221, 23,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  help: {
    des: 'help',
    text: 'Help',
    icon: 'help-circle',
    color: 'rgb(100, 221, 23)',
    bgColor: 'rgba(100, 221, 23,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  faq: {
    des: 'faq',
    text: 'FAQ',
    icon: 'help-circle',
    color: 'rgb(100, 221, 23)',
    bgColor: 'rgba(100, 221, 23,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  warning: {
    des: 'warning',
    text: 'Warning',
    icon: 'lucide-alert-triangle',
    color: 'rgb(255, 145, 0)',
    bgColor: 'rgba(255, 145, 0,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  caution: {
    des: 'caution',
    text: 'Caution',
    icon: 'lucide-alert-triangle',
    color: 'rgb(255, 145, 0)',
    bgColor: 'rgba(255, 145, 0,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  attention: {
    des: 'attention',
    text: 'Attention',
    icon: 'lucide-alert-triangle',
    color: 'rgb(255, 145, 0)',
    bgColor: 'rgba(255, 145, 0,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  failure: {
    des: 'failure',
    text: 'Failure',
    icon: 'lucide-x',
    color: 'rgb(255, 82, 82)',
    bgColor: 'rgba(255, 82, 82,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  fail: {
    des: 'fail',
    text: 'Fail',
    icon: 'lucide-x',
    color: 'rgb(255, 82, 82)',
    bgColor: 'rgba(255, 82, 82,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  missing: {
    des: 'missing',
    text: 'Missing',
    icon: 'lucide-x',
    color: 'rgb(255, 82, 82)',
    bgColor: 'rgba(255, 82, 82,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  danger: {
    des: 'danger',
    text: 'Danger',
    icon: 'lucide-zap',
    color: 'rgb(255, 23, 68)',
    bgColor: 'rgba(255, 23, 68,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  error: {
    des: 'error',
    text: 'Error',
    icon: 'lucide-zap',
    color: 'rgb(255, 23, 68)',
    bgColor: 'rgba(255, 23, 68,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  bug: {
    des: 'bug',
    text: 'Bug',
    icon: 'lucide-bug',
    color: 'rgb(245, 0, 87)',
    bgColor: 'rgba(245, 0, 87,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  example: {
    des: 'example',
    text: 'Example',
    icon: 'lucide-list',
    color: 'rgb(124, 77, 255)',
    bgColor: 'rgba(124, 77, 255,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
  quote: {
    des: 'quote',
    text: 'Quote',
    icon: 'quote-glyph',
    color: 'rgb(158, 158, 158)',
    bgColor: 'rgba(158, 158, 158,0.1)',
    newLine: false,
    objectType: 'calloutsFormatterSetting',
  },
});

/**
 * Inserts a callout block.
 *
 * `title` is written after the keyword so Obsidian renders it instead of its
 * own English default - that is how a translated heading reaches the note. Pass
 * an empty string to keep the bare syntax and let the caret land on the
 * heading instead.
 */
export function calloutsFormatter(
  editor: Editor,
  item: calloutsFormatterSetting,
  title = '',
) {
  if (!editor) return;

  const selection = editor.getSelection();
  const start = editor.getCursor('from');
  const { before, after } = surroundingText(editor);

  editor.focus();

  const expanded = expandTemplate(
    buildCalloutTemplate(item.id, title),
    selection.trim(),
  );

  // A callout is a block - it must not be glued into the middle of a sentence.
  const { text, cursorOffset } = placeBlock(
    expanded.text,
    expanded.cursorOffset,
    before,
    after,
  );

  editor.replaceSelection(text);
  editor.setCursor(resolveCursorPosition(text, cursorOffset, start));
}
