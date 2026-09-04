import { Editor, Plugin } from 'obsidian';
import * as R from 'ramda';
import { formatSettings, formatterSetting, iconFormatter } from './formatter';
import {
  calloutsFormatter,
  calloutsFormatterSetting,
  calloutsFormatterSettings,
} from './calloutsFormatter';
import { commandName } from './commandNames';
import { calloutLabel, t } from './i18n';

/**
 * One Obsidian command per formatting action, so people can bind their own
 * hotkeys. Obsidian owns that interface entirely - this only supplies the list,
 * which is why there is no key binding anywhere in the plugin's own settings.
 *
 * Only Text Edit and the callouts are registered. The HTML, LaTeX and Greek
 * tables hold another 93 entries between them: nobody binds a key to \alpha,
 * and adding them would bury the user's own commands in the palette. They stay
 * reachable through the ALT+Q window, which is what it is for.
 */
export function registerFormattingCommands(
  plugin: Plugin,
  writeCalloutTitle: () => boolean,
): void {
  // The table is heterogeneous for the suggestion window's benefit, so it does
  // not structurally satisfy the interface. Every entry in this one does carry
  // the fields iconFormatter reads.
  const textEdit = R.values(formatSettings) as unknown as formatterSetting[];

  textEdit.forEach((item) => {
    plugin.addCommand({
      // The table key rather than the label, so a binding survives a rename.
      id: item.id,
      name: commandName(item.des),
      // editorCallback rather than callback: these all write to a note, and
      // Obsidian then hides them when no editor has focus.
      editorCallback: (editor: Editor) => iconFormatter(editor, item),
    });
  });

  const callouts: calloutsFormatterSetting[] = R.values(
    calloutsFormatterSettings,
  );

  callouts.forEach((item) => {
    plugin.addCommand({
      // Namespaced. The two tables happen not to share a key today, but they
      // are edited independently and both are plain English words - 'quote'
      // and 'image' would each be at home in either. Obsidian keeps one
      // command per id and drops the rest silently, so the day they do collide
      // nothing would say so.
      id: `callout-${item.id}`,
      name: `${t('section.callouts')}: ${calloutLabel(item.id)}`,
      editorCallback: (editor: Editor) =>
        // Read when the command runs rather than when it is registered, so the
        // setting takes effect without a restart.
        calloutsFormatter(
          editor,
          item,
          writeCalloutTitle() ? calloutLabel(item.id) : '',
        ),
    });
  });
}
