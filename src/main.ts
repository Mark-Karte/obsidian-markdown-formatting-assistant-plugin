import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  Workspace,
  EditorPosition,
} from 'obsidian';

import { addIcons } from './icons';

import {
  SidePanelControlView,
  SidePanelControlViewType,
} from './SidePanelControlView';
import plugin from 'rollup-plugin-import-css';
import { CodeSuggestionModal } from './CommandListView';
import { CalloutsSuggestionModal } from './CalloutsListView';
import {
  AUTO_LOCALE,
  LOCALE_NAMES,
  LocaleSetting,
  SUPPORTED_LOCALES,
  sectionLabel,
  setLocale,
  t,
} from './i18n';

interface RegionSetting {
  name: string;
  active: boolean;
  visible: boolean;
}
export interface PluginSettings {
  language: LocaleSetting;
  triggerChar: string;
  sidePaneSideLeft: Boolean;
  savedColors: string[];
  regionSettings: Array<RegionSetting>;
}

const DEFAULT_SETTINGS: PluginSettings = {
  language: AUTO_LOCALE,
  triggerChar: '\\',
  sidePaneSideLeft: false,
  savedColors: ['#ff0000'],
  regionSettings: [
    { name: 'textEdit', active: true, visible: false },
    { name: 'tables', active: true, visible: false },
    { name: 'html', active: true, visible: false },
    { name: 'latex', active: true, visible: false },
    { name: 'greekLetters', active: true, visible: false },
    { name: 'colors', active: true, visible: false },
    { name: 'callouts', active: true, visible: false },
  ],
};

/** Order the section toggles appear in the settings tab. */
const SECTION_ORDER = DEFAULT_SETTINGS.regionSettings.map(
  (region) => region.name,
);

export default class MarkdownAutocompletePlugin extends Plugin {
  settings: PluginSettings;
  private sidePanelControlView: SidePanelControlView;

  async onload() {
    console.log('loading obsidian-markdown-formatting-assistant-plugin');

    await this.loadSettings();

    // Has to happen before anything renders a label.
    setLocale(this.settings.language);

    addIcons();

    this.registerView(SidePanelControlViewType, (leaf) => {
      this.sidePanelControlView = new SidePanelControlView(leaf, this);
      return this.sidePanelControlView;
    });

    this.addRibbonIcon('viewIcon', t('command.openPanel'), () => {
      this.toggleSidePanelControlView();
    });

    this.addCommand({
      id: 'open-command-selector',
      name: t('command.openCommandSelector'),
      hotkeys: [{ modifiers: ['Alt'], key: 'q' }],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        CodeSuggestionModal.display(this.app, editor);
      },
    });

    this.addCommand({
      id: 'open-callouts-selector',
      name: t('command.openCalloutsSelector'),
      hotkeys: [{ modifiers: ['Alt'], key: 'c' }],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        CalloutsSuggestionModal.display(this.app, editor);
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    // Merge into a fresh object - assigning onto DEFAULT_SETTINGS would
    // permanently overwrite the defaults for the rest of the session.
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private readonly toggleSidePanelControlView = async (): Promise<void> => {
    // const existing = this.app.workspace.getLeavesOfType(
    //   SidePanelControlViewType,
    // );

    // if (existing.length) {
    //   this.app.workspace.revealLeaf(existing[0]);
    //   return;
    // }

    this.app.workspace.detachLeavesOfType(SidePanelControlViewType);

    if (this.settings.sidePaneSideLeft) {
      await this.app.workspace.getLeftLeaf(false).setViewState({
        type: SidePanelControlViewType,
        active: true,
      });
    } else {
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: SidePanelControlViewType,
        active: true,
      });
    }

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(SidePanelControlViewType)[0],
    );
  };
}

class SettingsTab extends PluginSettingTab {
  plugin: MarkdownAutocompletePlugin;

  constructor(app: App, plugin: MarkdownAutocompletePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // Must stay synchronous: other plugins (e.g. Settings Search) call display()
  // and read containerEl straight after, which sees nothing if this returns a
  // promise instead of a filled container.
  display() {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: t('settings.title') });

    new Setting(containerEl)
      .setName(t('settings.language.name'))
      .setDesc(t('settings.language.desc'))
      .addDropdown((dropdown) => {
        dropdown.addOption(AUTO_LOCALE, t('settings.language.auto'));
        SUPPORTED_LOCALES.forEach((code) =>
          dropdown.addOption(code, LOCALE_NAMES[code]),
        );

        dropdown
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as LocaleSetting;
            setLocale(this.plugin.settings.language);
            await this.plugin.saveSettings();

            // Redraw so the change is visible without reopening the tab.
            this.display();
          });
      });

    new Setting(containerEl)
      .setName(t('settings.triggerChar.name'))
      .setDesc(t('settings.triggerChar.desc'))
      .addText((text) =>
        text
          .setPlaceholder(t('settings.triggerChar.placeholder'))
          .setValue(this.plugin.settings.triggerChar)
          .onChange(async (value) => {
            this.plugin.settings.triggerChar = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t('settings.sidePaneSide.name'))
      .setDesc(t('settings.sidePaneSide.desc'))
      .addText((text) =>
        text
          .setPlaceholder(t('settings.sidePaneSide.placeholder'))
          .setValue(this.plugin.settings.sidePaneSideLeft ? 'left' : 'right')
          .onChange(async (value) => {
            this.plugin.settings.sidePaneSideLeft =
              value === 'left' ? true : false;
            await this.plugin.saveSettings();
          }),
      );

    const getRegion = (name: string) => {
      return this.plugin.settings.regionSettings.find(
        (item) => item.name === name,
      );
    };

    // One templated pair of strings instead of seven hand-written ones - which
    // is also how the old copy-paste mix-ups got fixed, where the Tables toggle
    // described the Greek Letters section.
    SECTION_ORDER.forEach((regionName) => {
      const region = getRegion(regionName);

      // A settings file written by an older version may not list every region.
      if (!region) return;

      const section = sectionLabel(regionName);

      new Setting(containerEl)
        .setName(t('settings.toggleSection.name', { section }))
        .setDesc(t('settings.toggleSection.desc', { section }))
        .addToggle((comp) => {
          comp.setValue(region.active).onChange(async (value) => {
            region.active = value;
            await this.plugin.saveSettings();
          });
        });
    });

    new Setting(containerEl)
      .setName(t('settings.savedColors.name'))
      .setDesc(t('settings.savedColors.desc'))
      .addTextArea((text) => {
        text.inputEl.style.minHeight = '400px';

        text
          .setValue(
            // Copy before reversing - reverse() works in place and used to
            // flip the stored order every time this tab was opened.
            this.plugin.settings.savedColors.slice().reverse().join('\n'),
          )
          .onChange(async (value) => {
            let colors = value.split('\n').reverse();
            let filteredColors = colors.filter((color) => {
              return /^#[0-9A-F]{6}$/i.test(color);
            });
            this.plugin.settings.savedColors = filteredColors;
            await this.plugin.saveSettings();
          });

        text.inputEl.addEventListener('focusout', (ev) => {
          const value = (ev.target as HTMLTextAreaElement).value;

          // Line numbers are counted in the textarea's own order - the old
          // version reversed the lines first and reported the wrong ones.
          value.split('\n').forEach((color, index) => {
            if (color.trim() === '') return;
            if (/^#[0-9A-F]{6}$/i.test(color)) return;

            new Notice(
              t('settings.savedColors.invalidFormat', {
                color,
                line: index + 1,
              }),
            );
          });
        });
      });
  }
}
