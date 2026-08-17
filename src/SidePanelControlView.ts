import { svgToElement } from './icons';
import { setIcon } from "obsidian";
import { iconFormatter, formatSettings, formatterSetting } from './formatter';
import {
  htmlFormatter,
  htmlFormatterSettings,
  htmlFormatterSetting,
} from './htmlFormatter';
import {
  greekFormatter,
  greekLowerCaseFormatterSettings,
  greekUpperCaseFormatterSettings,
  greekFormatterSetting,
} from './greekFormatter';
import {
  latexFormatter,
  latexFormatterSettings,
  latexFormatterSetting,
} from './latexFormatter';
import {
  calloutsFormatter,
  calloutsFormatterSettings,
  calloutsFormatterSetting,
} from './calloutsFormatter';
import { colorFormatter } from '../formatters/colorFormatter';
import {
  ButtonComponent,
  ItemView,
  Notice,
  TFile,
  WorkspaceLeaf,
} from 'obsidian';

import * as R from 'ramda';
import MarkdownAutocompletePlugin from './main';
import { checkIfMarkdownSource } from './generalFunctions';
import { calloutLabel, sectionLabel, t } from './i18n';

export const SidePanelControlViewType = 'side-panel-control-view';

export class SidePanelControlView extends ItemView {
  private static lastColors: Array<string> = ['#ff0000'];
  private plugin: MarkdownAutocompletePlugin;
  private dragStartColor: string;

  constructor(leaf: WorkspaceLeaf, plugin: MarkdownAutocompletePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  public getViewType(): string {
    return SidePanelControlViewType;
  }

  public getDisplayText(): string {
    return t('view.displayName');
  }

  public getIcon(): string {
    return 'viewIcon';
  }

  public load(): void {
    super.load();
    this.draw();
  }

  private draw(): void {
    const container = this.containerEl.children[1];

    const rootEl = document.createElement('div');
    rootEl.id = 'SidePaneRootElement';

    this.drawContentOfRootElement(rootEl);

    container.empty();
    container.appendChild(rootEl);
  }

  private drawContentOfRootElement(rootEl: HTMLElement = null): void {
    if (!rootEl) rootEl = document.getElementById('SidePaneRootElement');
    rootEl.textContent = '';

    const getRegion = (name: string) => {
      return this.plugin.settings.regionSettings.find(
        (item) => item.name === name,
      );
    };

    // Width is left to the stylesheet - the leaf is user-resizable, so nothing
    // in here may pin a fixed width.
    const mainDiv = rootEl.createDiv({
      cls: 'nav-header markdown-formatting-assistant-panel',
    });

    // --------------
    // Text Edit Section
    // --------------

    const addTextEditSection = () => {
      let content = this.addSelectableHeader(mainDiv, 'textEdit');
      this.addTextEditButtons(content);
    };

    // --------------
    // Table Section
    // --------------
    const addTabelsSection = () => {
      const content = this.addSelectableHeader(mainDiv, 'tables');

      const info = content.createEl('p');
      info.appendText(t('tables.upcoming'));
      info.style.textAlign = 'center';
    };

    // --------------
    // HTML Section
    // --------------
    const addHtmlSection = () => {
      const content = this.addSelectableHeader(mainDiv, 'html');

      this.addHtmlButtons(content);

      const info = content.createEl('p');
      info.style.textAlign = 'center';
      info.style.marginTop = '10px';
      info.style.marginBottom = '10px';
      const link = info.createEl('a');
      link.appendText(t('html.reportMissingTag'));
      link.style.textAlign = 'center';

      link.style.fontSize = '10px';
      link.href =
        'https://github.com/Mark-Karte/obsidian-markdown-formatting-assistant-plugin/issues';
    };

    // --------------
    // Latex Section
    // --------------
    const addLatexSection = () => {
      const content = this.addSelectableHeader(mainDiv, 'latex');

      this.addLatexButtons(content);

      let info = content.createEl('p');
      info.style.textAlign = 'center';
      info.style.marginTop = '10px';
      info.style.marginBottom = '10px';
      let link = info.createEl('a');
      link.appendText(t('latex.introduction'));
      link.style.textAlign = 'center';
      link.style.fontSize = '10px';
      link.href = 'https://en.wikibooks.org/wiki/LaTeX/Mathematics';

      info = content.createEl('p');
      info.style.textAlign = 'center';
      info.style.marginTop = '10px';
      info.style.marginBottom = '10px';
      link = info.createEl('a');
      link.appendText(t('latex.reportMissingFunction'));
      link.style.textAlign = 'center';

      link.style.fontSize = '10px';
      link.href =
        'https://github.com/Mark-Karte/obsidian-markdown-formatting-assistant-plugin/issues';
    };
    // --------------
    // Greek Section
    // --------------
    const addGreekLettersSection = () => {
      const content = this.addSelectableHeader(mainDiv, 'greekLetters');

      let header = content.createEl('h5');
      header.appendText(t('greek.lowerCase'));
      header.style.textAlign = 'center';
      header.style.marginTop = '0px';
      header.style.marginBottom = '5px';

      this.addGreekLowerCaseLetters(content);

      header = content.createEl('h5');
      header.appendText(t('greek.upperCase'));
      header.style.textAlign = 'center';
      header.style.marginTop = '10px';
      header.style.marginBottom = '5px';

      this.addGreekUpperCaseLetters(content);

      const info = content.createEl('p');
      info.style.textAlign = 'center';
      info.style.marginTop = '10px';
      info.style.marginBottom = '10px';
      const link = info.createEl('a');
      link.appendText(t('greek.overview'));
      link.style.textAlign = 'center';

      link.style.fontSize = '10px';
      link.href = 'https://en.wikipedia.org/wiki/Greek_alphabet';
    };

    // --------------
    // Colors
    // --------------
    const addColorsSection = () => {
      const content = this.addSelectableHeader(mainDiv, 'colors');
      this.addColorBody(content);
    };

    // --------------
    // Callouts
    // --------------

    const addCalloutsSection = () => {
      let content = this.addSelectableHeader(mainDiv, 'callouts');
      this.addCalloutsButtons(content);
    };

    const regions = {
      textEdit: addTextEditSection,
      tables: addTabelsSection,
      html: addHtmlSection,
      latex: addLatexSection,
      greekLetters: addGreekLettersSection,
      colors: addColorsSection,
      callouts: addCalloutsSection,
    };

    this.plugin.settings.regionSettings.map((item) => {
      // @ts-ignore
      const regionFunction = regions[item.name];
      if (regionFunction && getRegion(item.name).active) regionFunction();
    });
  }

  private addHtmlButtons(mainDiv: HTMLElement) {
    const addClickEvent = (btn: HTMLElement, type: string) => {
      btn.onClickEvent(() => {
        // @ts-ignore
        const formatterSetting = htmlFormatterSettings[type];

        const leaf = this.app.workspace.getMostRecentLeaf();
        let editor = null;
        if (checkIfMarkdownSource(leaf)) {
          // @ts-ignore
          editor = leaf.view.sourceMode.cmEditor;
          htmlFormatter(editor, formatterSetting);
        }
      });
    };

    const numberOfCols = 3;
    let row: HTMLElement = null;

    R.sortBy(R.identity, R.keys(htmlFormatterSettings)).forEach(
      (key, index) => {
        // @ts-ignore
        const item = htmlFormatterSettings[key];
        if (index % numberOfCols === 0) {
          row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
        }

        let button = row.createDiv({ cls: 'nav-action-text-button' });
        addClickEvent(button, key);
        button.appendText(item.des);
      },
    );
  }
//xxxxx
  private addCalloutsButtons(mainDiv: HTMLElement) {
    const addClickEvent = (btn: HTMLElement, type: string) => {
      btn.onClickEvent(() => {
        // @ts-ignore
        const formatterSetting = calloutsFormatterSettings[type];

        const leaf = this.app.workspace.getMostRecentLeaf();
        let editor = null;
        if (checkIfMarkdownSource(leaf)) {
          // @ts-ignore
          editor = leaf.view.sourceMode.cmEditor;
          calloutsFormatter(editor, formatterSetting);
        }
      });
    };

    const numberOfCols = 5;
    let row: HTMLElement = null;

    R.keys(calloutsFormatterSettings).forEach((key, index) => {
      // @ts-ignore
      const item = calloutsFormatterSettings[key];
      if (index === 0 || item.newLine) {
        row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
      }

      let button = row.createDiv({ cls: 'nav-action-text-button' });
      // @ts-ignore
      button.style.textJustify = 'center';
      button.style.textAlign = 'center';
      button.style.backgroundColor = item.bgColor;
      addClickEvent(button, key);
      
      const spanText = document.createElement('span');
      spanText.textContent = ' ' + calloutLabel(item.id);
      const spanIcon = document.createElement('span');
      setIcon(spanIcon, item.icon);
      spanIcon.style.verticalAlign = 'middle';
      spanIcon.style.color = item.color;
      button.appendChild(spanIcon);
      button.appendChild(spanText);
      
    });
  }

  private addLatexButtons(mainDiv: HTMLElement) {
    const addClickEvent = (btn: HTMLElement, type: string) => {
      btn.onClickEvent(() => {
        // @ts-ignore
        const formatterSetting = latexFormatterSettings[type];

        const leaf = this.app.workspace.getMostRecentLeaf();
        let editor = null;
        if (checkIfMarkdownSource(leaf)) {
          // @ts-ignore
          editor = leaf.view.sourceMode.cmEditor;
          latexFormatter(editor, formatterSetting);
        }
      });
    };

    const numberOfCols = 5;
    let row: HTMLElement = null;

    R.keys(latexFormatterSettings).forEach((key, index) => {
      // @ts-ignore
      const item = latexFormatterSettings[key];
      if (index === 0 || item.newLine) {
        row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
      }

      let button = row.createDiv({ cls: 'nav-action-text-button' });
      // @ts-ignore
      button.style.textJustify = 'center';
      button.style.textAlign = 'center';

      addClickEvent(button, key);

      if (item.type === 'icon') {
        let svg = svgToElement(item.text);
        svg.style.display = 'inline-block';
        svg.style.verticalAlign = 'middle';
        button.appendChild(svg);
      } else if (item.type === 'text') {
        let div = document.createElement('div');
        div.innerHTML = item.text;
        button.appendChild(div);
      }
    });
  }

  private addGreekLowerCaseLetters(mainDiv: HTMLElement) {
    const addClickEvent = (btn: HTMLElement, type: string) => {
      btn.onClickEvent(() => {
        // @ts-ignore
        const formatterSetting = greekLowerCaseFormatterSettings[type];

        const leaf = this.app.workspace.getMostRecentLeaf();
        let editor = null;
        if (checkIfMarkdownSource(leaf)) {
          // @ts-ignore
          editor = leaf.view.sourceMode.cmEditor;
          greekFormatter(editor, formatterSetting);
        }
      });
    };

    const numberOfCols = 5;
    let row: HTMLElement = null;

    R.keys(greekLowerCaseFormatterSettings).forEach((key, index) => {
      // @ts-ignore
      const item = greekLowerCaseFormatterSettings[key];
      if (index % numberOfCols === 0) {
        row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
      }

      let button = row.createDiv({ cls: 'nav-action-button' });
      addClickEvent(button, key);
      button.appendChild(svgToElement(item.icon));
    });
  }

  private addGreekUpperCaseLetters(mainDiv: HTMLElement) {
    const addClickEvent = (btn: HTMLElement, type: string) => {
      btn.onClickEvent(() => {
        // @ts-ignore
        const formatterSetting = greekUpperCaseFormatterSettings[type];

        const leaf = this.app.workspace.getMostRecentLeaf();
        let editor = null;
        if (checkIfMarkdownSource(leaf)) {
          // @ts-ignore
          editor = leaf.view.sourceMode.cmEditor;
          greekFormatter(editor, formatterSetting);
        }
      });
    };

    const numberOfCols = 5;
    let row: HTMLElement = null;

    R.keys(greekUpperCaseFormatterSettings).forEach((key, index) => {
      // @ts-ignore
      const item = greekUpperCaseFormatterSettings[key];
      if (index % numberOfCols === 0) {
        row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
      }

      let button = row.createDiv({ cls: 'nav-action-button' });
      addClickEvent(button, key);
      button.appendChild(svgToElement(item.icon));
    });
  }

  private addTextEditButtons(mainDiv: HTMLElement) {
    const addClickEvent = (btn: HTMLElement, type: string) => {
      btn.onClickEvent(() => {
        // @ts-ignore
        const formatterSetting = formatSettings[type];

        const leaf = this.app.workspace.getMostRecentLeaf();
        let editor = null;
        if (checkIfMarkdownSource(leaf)) {
          // @ts-ignore
          editor = leaf.view.sourceMode.cmEditor;
          iconFormatter(editor, formatterSetting);
        }
      });
    };

    let row = mainDiv.createDiv({ cls: 'nav-buttons-container' });

    for (let icon of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      const button = row.createDiv({ cls: 'nav-action-button' });
      addClickEvent(button, icon);
      button.appendChild(svgToElement(icon));
    }

    row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
    let button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'bold');
    button.appendChild(svgToElement('bold'));
    button.id = 'obsidianMarkdownFormattingAssistantPluginButtonBold';

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'italic');
    button.appendChild(svgToElement('italic'));
    button.id = 'obsidianMarkdownFormattingAssistantPluginButtonItalic';

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'strikethrough');
    button.appendChild(svgToElement('strikethrough'));
    button.id = 'obsidianMarkdownFormattingAssistantPluginButtonStrikethrough';

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'underline');
    button.appendChild(svgToElement('underline'));
    button.id = 'obsidianMarkdownFormattingAssistantPluginButtonUnderline';

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'highlight');
    button.appendChild(svgToElement('highlight'));
    button.id = 'obsidianMarkdownFormattingAssistantPluginButtonHighlight';

    row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'codeInline');
    button.appendChild(svgToElement('codeInline'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'codeBlock');
    button.appendChild(svgToElement('codeBlock'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'mermaidBlock');
    button.appendChild(svgToElement('mermaidBlock'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'link');
    button.appendChild(svgToElement('link'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'internalLink');
    button.appendChild(svgToElement('fileLink'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'blockquote');
    button.appendChild(svgToElement('quote'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'image');
    button.appendChild(svgToElement('image'));

    row = mainDiv.createDiv({ cls: 'nav-buttons-container' });
    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'bulletList');
    button.appendChild(svgToElement('bulletList'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'numberList');
    button.appendChild(svgToElement('numberList'));

    button = row.createDiv({ cls: 'nav-action-button' });
    addClickEvent(button, 'checkList');
    button.appendChild(svgToElement('checkList'));
  }

  private addColorBody(mainDiv: HTMLElement) {
    const insertColor = (color: string) => {
      const leaf = this.app.workspace.getMostRecentLeaf();
      let editor = null;
      if (checkIfMarkdownSource(leaf)) {
        const addColor =
          // @ts-ignore
          document.getElementById('inputColorTagCheckBox').checked;

        const addBackgroundColor =
          // @ts-ignore
          document.getElementById('inputBackgroundColorTagCheckBox').checked;
        const addStyle =
          // @ts-ignore
          document.getElementById('inputStyleTagCheckBox').checked;
        const addHtml =
          // @ts-ignore
          document.getElementById('inputHtmlTagCheckBox').checked;

        let res = color;
        if (addColor) res = `color: ${color}`;
        if (addBackgroundColor) res = `background-color: ${color}`;
        if (addColor && addBackgroundColor)
          res = `color: ${color}; background-color: ${color}`;
        if (addStyle) res = `style="${res}"`;
        // @ts-ignore
        editor = leaf.view.sourceMode.cmEditor;
        if (addHtml) res = `<font color="${res}">${editor.getSelection()}</font>`;
        colorFormatter(editor, res);
        editor.focus();
      }
    };

    const drawLastSelectedColorIcons = (container: HTMLElement = null) => {
      if (!container)
        container = document.getElementById('lastSelectedColorsDiv');
      container.textContent = '';

      R.reverse(SidePanelControlView.lastColors).forEach((color) => {
        const colorBox = container.createDiv();
        colorBox.classList.add('color-icon');
        colorBox.style.backgroundColor = color;

        colorBox.onClickEvent((ev) => {
          if (ev.type === 'click') {
            insertColor(color);
          } else {
            SidePanelControlView.lastColors = R.without(
              [color],
              SidePanelControlView.lastColors,
            );
            drawLastSelectedColorIcons();
          }
        });
      });
    };

    const drawLastSavedColorIcons = (container: HTMLElement = null) => {
      if (!container) container = document.getElementById('lastSavedColorsDiv');

      container.textContent = '';

      R.reverse(this.plugin.settings.savedColors).forEach((color) => {
        const colorBox = container.createDiv();
        colorBox.id = 'lastSavedColorsDiv' + color;
        colorBox.classList.add('color-icon');
        colorBox.style.backgroundColor = color;
        colorBox.draggable = true;

        colorBox.onClickEvent(async (ev) => {
          if (ev.type === 'click') {
            insertColor(color);
          } else {
            this.plugin.settings.savedColors = R.without(
              [color],
              this.plugin.settings.savedColors,
            );
            await this.plugin.saveSettings();
            drawLastSavedColorIcons();
          }
        });
        colorBox.ondragstart = (event) => {
          // @ts-ignore
          this.dragStartColor = event.target.id.replace(
            'lastSavedColorsDiv',
            '',
          );
        };
        colorBox.ondrop = async (event) => {
          const target = event.target as HTMLElement;
          if (!target || !target.id) return;

          const savedColors = this.plugin.settings.savedColors;
          const startColor = this.dragStartColor;
          const endColor = target.id.replace('lastSavedColorsDiv', '');

          const startIndex = R.indexOf(startColor, savedColors);
          const endIndex = R.indexOf(endColor, savedColors);

          // The container carries the id 'lastSavedColorsDiv' itself, so a drop
          // into the empty space next to the swatches used to resolve to an
          // empty colour and index -1 - which then wrote junk into the list.
          if (startIndex < 0 || endIndex < 0 || startIndex === endIndex) return;

          savedColors[startIndex] = endColor;
          savedColors[endIndex] = startColor;
          await this.plugin.saveSettings();
          drawLastSavedColorIcons();
        };
        colorBox.ondragover = (event) => {
          event.preventDefault();
        };
      });
    };

    const colorSection = mainDiv.createDiv();
    const colorSelector = colorSection.createDiv();
    colorSelector.style.backgroundColor = R.last(
      SidePanelControlView.lastColors,
    );
    colorSelector.style.height = '16px';
    colorSelector.style.borderRadius = '8px';
    colorSelector.style.padding = '5px';
    colorSelector.style.margin = '4px';
    colorSelector.style.marginBottom = '10px';
    const colorInput = colorSelector.createEl('input');
    colorInput.id = 'colorInput';
    colorInput.type = 'color';
    colorInput.value = R.last(SidePanelControlView.lastColors);
    colorInput.style.visibility = 'hidden';
    colorInput.style.padding = '0';
    colorInput.style.margin = '0';
    // colorInput.style.display = 'block';
    // colorInput.style.opacity = '0';
    colorInput.addEventListener('input', (ev) => {
      // @ts-ignore
      const color = ev.target.value;
      colorSelector.style.backgroundColor = color;
    });
    colorInput.addEventListener(
      'change',
      (ev) => {
        // @ts-ignore
        const color = ev.target.value;
        // @ts-ignore
        SidePanelControlView.lastColors = R.pipe(
          R.without([color]),
          R.append(color),
          R.takeLast(10),
        )(SidePanelControlView.lastColors);
        drawLastSelectedColorIcons();
        insertColor(color);
        colorSelector.style.backgroundColor = color;

        navigator.clipboard.writeText(color).then(
          () => {
            new Notice(t('colors.copied', { color }));
          },
          () => {
            new Notice(t('colors.copyFailed'));
          },
        );
      },
      false,
    );

    const colorButton = colorSection.createEl('label');
    colorButton.classList.add('nav-action-text-button');
    colorButton.appendText(t('colors.select'));
    colorButton.style.display = 'block';
    colorButton.htmlFor = 'colorInput';

    const colorSaveButton = colorSection.createEl('div');
    colorSaveButton.classList.add('nav-action-text-button');
    colorSaveButton.appendText(t('colors.save'));
    colorSaveButton.style.display = 'block';
    colorSaveButton.onClickEvent(async (ev) => {
      const color = R.last(SidePanelControlView.lastColors);
      this.plugin.settings.savedColors = R.pipe(
        R.without([color]),
        R.append(color),
      )(this.plugin.settings.savedColors);
      drawLastSavedColorIcons();
      await this.plugin.saveSettings();
    });
    colorSaveButton.style.marginBottom = '20px';

    const addCheckbox = (id: string, text: string) => {
      const div = colorSection.createEl('div');
      let input = div.createEl('input');
      input.id = id;
      input.type = 'checkbox';
      input.name = id;
      let label = div.createEl('label');
      label.appendText(text);
      label.style.fontSize = '12px';
    };

    addCheckbox('inputColorTagCheckBox', t('colors.optionColor'));
    addCheckbox(
      'inputBackgroundColorTagCheckBox',
      t('colors.optionBackgroundColor'),
    );
    addCheckbox('inputStyleTagCheckBox', t('colors.optionStyleTag'));
    addCheckbox('inputHtmlTagCheckBox', t('colors.optionHtmlTag'));

    const lastSelectedColorsTitle = colorSection.createEl('p');
    lastSelectedColorsTitle.appendText(t('colors.lastUsed'));
    lastSelectedColorsTitle.style.marginBottom = '0px';

    const lastSelectedColors = colorSection.createEl('div');
    lastSelectedColors.id = 'lastSelectedColorsDiv';
    lastSelectedColors.classList.add('color-swatch-container');

    drawLastSelectedColorIcons(lastSelectedColors);

    const lastSavedColorsTitle = colorSection.createEl('p');
    lastSavedColorsTitle.appendText(t('colors.saved'));
    lastSavedColorsTitle.style.marginBottom = '0px';

    const settingsInfo = colorSection.createEl('p');
    settingsInfo.appendText(t('colors.editInSettings'));
    settingsInfo.style.textAlign = 'left';
    settingsInfo.style.fontSize = '10px';
    settingsInfo.style.marginTop = '0px';

    const lastSavedColors = colorSection.createEl('div');
    lastSavedColors.id = 'lastSavedColorsDiv';
    lastSavedColors.classList.add('color-swatch-container');

    drawLastSavedColorIcons(lastSavedColors);

    const info = colorSection.createEl('p');
    info.style.textAlign = 'center';
    info.style.marginTop = '10px';
    info.style.marginBottom = '10px';

    const link = info.createEl('a');
    link.appendText(t('colors.help'));
    link.style.textAlign = 'center';

    link.style.fontSize = '10px';
    link.href =
      'https://github.com/Mark-Karte/obsidian-markdown-formatting-assistant-plugin#color-picker';
  }

  private addSelectableHeader(mainDiv: HTMLElement, regionName: string) {
    const sectionTitle = sectionLabel(regionName);

    const getRegion = (name: string) => {
      return this.plugin.settings.regionSettings.find(
        (item) => item.name === name,
      );
    };

    let header = mainDiv.createEl('div');
    header.id = 'lastSavedHeaderDiv' + regionName;
    let hr = mainDiv.createEl('hr');
    let title = header.createEl('h4');
    let arrowButton = header.createDiv({ cls: 'nav-action-button' });
    let content = mainDiv.createEl('div');

    header.style.width = '100%';
    // header.style.border = '2px solid white';
    header.style.display = 'flex';
    header.style.flexWrap = 'nowrap';
    header.style.alignContent = 'center';
    header.style.position = 'relative';
    header.style.cursor = 'move';
    header.draggable = true;

    header.ondragstart = (event) => {
      // @ts-ignore
      const sectionId = event.target.id.replace('lastSavedHeaderDiv', '');

      event.dataTransfer.setData('sectionHeaderMoveId', sectionId);
    };

    const onDrop = async (event: DragEvent) => {
      // The drop can land on any descendant of a section header, so walk the
      // event path up to the header that carries the region id. composedPath()
      // also yields document and window, which have no id at all.
      const getDroppedRegionName = (path: EventTarget[]) => {
        const header = path.find(
          (target) =>
            target instanceof HTMLElement &&
            target.id.startsWith('lastSavedHeaderDiv'),
        ) as HTMLElement | undefined;

        return header
          ? header.id.replace('lastSavedHeaderDiv', '')
          : undefined;
      };

      const start = event.dataTransfer.getData('sectionHeaderMoveId');
      const end = getDroppedRegionName(event.composedPath());

      const isKnownRegion = this.plugin.settings.regionSettings.some(
        (region) => region.name === end,
      );

      if (end && isKnownRegion && start !== end) {
        const startIndex = R.findIndex(
          R.propEq('name', start),
          this.plugin.settings.regionSettings,
        );
        const endIndex = R.findIndex(
          R.propEq('name', end),
          this.plugin.settings.regionSettings,
        );

        const startRegion = this.plugin.settings.regionSettings[startIndex];
        this.plugin.settings.regionSettings[startIndex] =
          this.plugin.settings.regionSettings[endIndex];
        this.plugin.settings.regionSettings[endIndex] = startRegion;
        await this.plugin.saveSettings();
        this.drawContentOfRootElement();
      }
      event.preventDefault();
    };

    header.ondragover = async (event) => {
      event.preventDefault();
    };

    header.ondrop = onDrop;

    title.appendText(sectionTitle);
    title.style.flexDirection = 'column';
    title.style.textAlign = 'left';
    title.style.margin = '0px';
    title.style.display = 'flex';
    title.style.flexWrap = 'nowrap';
    title.style.justifyContent = 'center';

    arrowButton.appendChild(svgToElement('expandArrowDown'));
    arrowButton.style.position = 'absolute';
    arrowButton.style.right = '0px';
    arrowButton.style.top = '0px';
    arrowButton.style.bottom = '0px';
    arrowButton.style.marginTop = 'auto';
    arrowButton.style.marginBottom = 'auto';
    arrowButton.style.width = '24px';
    arrowButton.style.height = '24px';
    const region = getRegion(regionName);
    if (region && region.active && region.visible) {
      content.style.display = 'block';
    } else {
      content.style.display = 'none';
    }

    arrowButton.onClickEvent(async (e) => {
      const region = getRegion(regionName);

      if (region && region.active) {
        if (!region.visible) {
          content.style.display = 'block';
          arrowButton.innerHTML = null;
          arrowButton.appendChild(svgToElement('expandArrowUp'));
          region.visible = true;
        } else {
          content.style.display = 'none';
          arrowButton.innerHTML = null;
          arrowButton.appendChild(svgToElement('expandArrowDown'));
          region.visible = false;
        }

        return await this.plugin.saveSettings();
      }
    });

    hr.style.marginTop = '0px';
    hr.style.marginBottom = '10px';

    return content;
  }
}
