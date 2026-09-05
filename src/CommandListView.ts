import { App, Editor, Notice, SuggestModal } from 'obsidian';
import { baseFormatterSetting, iconFormatter } from './formatter';
import { formatSettings, formatterSetting } from './formatter';
import * as R from 'ramda';
import { appendLabel, svgToElement } from './icons';
import {
  greekLowerCaseFormatterSettings,
  greekUpperCaseFormatterSettings,
  greekFormatter,
} from './greekFormatter';
import { latexFormatterSettings, latexFormatter } from './latexFormatter';
import { htmlFormatterSettings, htmlFormatter } from './htmlFormatter';

const builtInSuggestions = R.values(formatSettings).concat(
  // @ts-ignore
  R.values(htmlFormatterSettings),
  R.values(latexFormatterSettings),
  R.values(greekLowerCaseFormatterSettings),
  R.values(greekUpperCaseFormatterSettings),
);

export class CodeSuggestionModal extends SuggestModal<baseFormatterSetting> {
  private editor: Editor;

  public setEditor = (editor: Editor) => {
    this.editor = editor;
  };

  // Returns all available suggestions.
  getSuggestions(query: string): baseFormatterSetting[] {
    // The tables are heterogeneous - only some entries carry an icon, a text or
    // a type - so they do not structurally satisfy baseFormatterSetting. Every
    // reader below branches on objectType before touching those fields, which
    // is what makes this safe in practice.
    const suggestions =
      builtInSuggestions as unknown as baseFormatterSetting[];

    // Matching the id as well as the label keeps every command reachable by
    // its English name once the labels get translated.
    const needle = query.toLowerCase();

    return suggestions.filter(
      (setting) =>
        setting.des.toLowerCase().includes(needle) ||
        setting.id.toLowerCase().includes(needle),
    );
  }

  // Renders each suggestion item.
  renderSuggestion(
    baseFormatterSetting: baseFormatterSetting,
    el: HTMLElement,
  ) {
    const row = el.createEl('div');
    row.classList.add('mfa-suggestion-row');
    const iconContainer = row.createDiv();
    iconContainer.classList.add('mfa-suggestion-icon-container');
    const iconDiv = iconContainer.createDiv();
    iconDiv.classList.add('mfa-suggestion-icon');

    const cell2 = row.createDiv();

    cell2.classList.add('mfa-suggestion-text');
    cell2.setText(baseFormatterSetting.des);

    // The label is tinted by which table the entry came from, so the four
    // groups stay apart at a glance. The tints are theme variables now: the
    // fixed hexes they replace were picked against a dark background, and the
    // green in particular was close to unreadable on a light one.
    if (baseFormatterSetting.objectType === 'formatterSetting') {
      iconDiv.appendChild(svgToElement(baseFormatterSetting.icon));
      cell2.addClass('mfa-suggestion-text--markdown');
    } else if (baseFormatterSetting.objectType === 'htmlFormatterSetting') {
      iconDiv.appendText('HTML');
      cell2.addClass('mfa-suggestion-text--html');
    } else if (baseFormatterSetting.objectType === 'greekFormatterSetting') {
      iconDiv.appendChild(svgToElement(baseFormatterSetting.icon));
      cell2.addClass('mfa-suggestion-text--greek');
    } else if (baseFormatterSetting.objectType === 'latexFormatterSetting') {
      const item = baseFormatterSetting;
      if (item.type === 'icon') {
        const svg = svgToElement(item.text);
        svg.addClass('mfa-inline-svg');
        iconDiv.appendChild(svg);
      } else if (item.type === 'text') {
        appendLabel(iconDiv.createDiv(), item.text);
      }
      cell2.addClass('mfa-suggestion-text--latex');
    } else {
      iconDiv.appendText('HTML');
    }
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(
    baseFormatterSetting: baseFormatterSetting,
    evt: MouseEvent | KeyboardEvent,
  ) {
    const item = baseFormatterSetting;

    if (item.objectType === 'formatterSetting') {
      // @ts-ignore
      iconFormatter(this.editor, item);
    } else if (item.objectType === 'htmlFormatterSetting') {
      // @ts-ignore
      htmlFormatter(this.editor, item);
    } else if (item.objectType === 'latexFormatterSetting') {
      // @ts-ignore
      latexFormatter(this.editor, item);
    } else if (item.objectType === 'greekFormatterSetting') {
      // @ts-ignore
      greekFormatter(this.editor, item);
    }

    // new Notice(`Selected ${baseFormatterSetting.des}`);
  }

  public static display = (app: App, editor: Editor): void => {
    const modal = new CodeSuggestionModal(app);
    modal.setEditor(editor);
    modal.open();
  };
}
