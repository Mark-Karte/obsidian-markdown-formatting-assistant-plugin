import { App, Editor, Notice, SuggestModal } from 'obsidian';
import { calloutsFormatterSetting } from './calloutsFormatter';
import * as R from 'ramda';
import { setIcon } from "obsidian";
import { calloutsFormatterSettings, calloutsFormatter } from './calloutsFormatter';
import { calloutLabel } from './i18n';

const suggestions = R.values(calloutsFormatterSettings);

export class CalloutsSuggestionModal extends SuggestModal<calloutsFormatterSetting> {
  private editor: Editor;
  /** Whether to write the translated heading into the note. */
  public useTitles = true;

  public setEditor = (editor: Editor) => {
    this.editor = editor;
  };

  // Returns all available suggestions.
  getSuggestions(query: string): calloutsFormatterSetting[] {
    // Matching the translated label as well as the id keeps callouts findable
    // both by their Russian name and by the English keyword.
    const filterFunction = (setting: calloutsFormatterSetting) => {
      const needle = query.toLowerCase();
      return (
        calloutLabel(setting.id).toLowerCase().includes(needle) ||
        setting.id.toLowerCase().includes(needle)
      );
    };
    // @ts-ignore
    return R.values(R.filter(filterFunction, suggestions));
  }

  // Renders each suggestion item.
  renderSuggestion(
    calloutsFormatterSetting: calloutsFormatterSetting,
    el: HTMLElement,
  ) {
    const row = el.createEl('div');
    row.classList.add('mfa-suggestion-row');
    const iconContainer = row.createDiv();
    iconContainer.classList.add('mfa-suggestion-icon-container');
    const iconDiv = iconContainer.createDiv();
    iconDiv.classList.add('mfa-suggestion-icon');

    const cell2 = row.createDiv();
    cell2.classList.add('mfa-suggestion-text', 'mfa-suggestion-text--muted');
    cell2.setText(calloutLabel(calloutsFormatterSetting.id));

    const spanIcon = iconDiv.createSpan({ cls: 'mfa-callout-icon' });

    setIcon(spanIcon, calloutsFormatterSetting.icon);

    // The colours belong to the callout type, so they arrive as data rather
    // than as anything the stylesheet could know in advance. Custom properties
    // are how a stylesheet takes delivery of that.
    row.addClass('mfa-callout-row');
    row.style.setProperty('--mfa-callout-color', calloutsFormatterSetting.color);
    row.style.setProperty(
      '--mfa-callout-background',
      calloutsFormatterSetting.bgColor,
    );
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(
    calloutsFormatterSetting: calloutsFormatterSetting,
    evt: MouseEvent | KeyboardEvent,
  ) {
    const item = calloutsFormatterSetting;
    calloutsFormatter(
      this.editor,
      item,
      this.useTitles ? calloutLabel(item.id) : '',
    );

    // new Notice(`Selected ${calloutsFormatterSetting.des}`);
  }

  public static display = (
    app: App,
    editor: Editor,
    useTitles = true,
  ): void => {
    const modal = new CalloutsSuggestionModal(app);
    modal.setEditor(editor);
    modal.useTitles = useTitles;
    modal.open();
  };
}
