import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  debounce,
  Workspace,
  EditorPosition,
} from 'obsidian';

import { addIcons, removeIcons } from './icons';

import {
  SidePanelControlView,
  SidePanelControlViewType,
} from './SidePanelControlView';
import { CodeSuggestionModal } from './CommandListView';
import { CalloutsSuggestionModal } from './CalloutsListView';
import { registerFormattingCommands } from './commands';
import type { tableAlignment } from './tableFormatter';
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
  sidePaneSideLeft: Boolean;
  savedColors: string[];
  regionSettings: Array<RegionSetting>;
  tableAlignment: tableAlignment;
  calloutTitles: boolean;
}

/** Preselected in the saved-colours picker, so it never opens on black. */
const DEFAULT_PICKER_COLOR = '#448aff';

const DEFAULT_SETTINGS: PluginSettings = {
  language: AUTO_LOCALE,
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
  tableAlignment: 'default',
  calloutTitles: true,
};

/** Order the section toggles appear in the settings tab. */
const SECTION_ORDER = DEFAULT_SETTINGS.regionSettings.map(
  (region) => region.name,
);

export default class MarkdownAutocompletePlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    console.log('loading obsidian-markdown-formatting-assistant-plugin');

    await this.loadSettings();

    // Has to happen before anything renders a label.
    setLocale(this.settings.language);

    addIcons();

    this.registerView(
      SidePanelControlViewType,
      (leaf) => new SidePanelControlView(leaf, this),
    );

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
        CalloutsSuggestionModal.display(
          this.app,
          editor,
          this.settings.calloutTitles,
        );
      },
    });

    // The panel had only the ribbon icon, which is the one thing a keyboard
    // cannot reach.
    this.addCommand({
      id: 'toggle-side-panel',
      name: t('command.openPanel'),
      callback: () => {
        void this.toggleSidePanelControlView();
      },
    });

    registerFormattingCommands(this, () => this.settings.calloutTitles);

    this.addSettingTab(new SettingsTab(this.app, this));
  }

  onunload() {
    // Views, commands, the ribbon icon and the settings tab are torn down by
    // Plugin itself. Icons are the exception: addIcon is a module-level
    // function outside that lifecycle.
    removeIcons();
  }

  async loadSettings() {
    // Merge into a fresh object - assigning onto DEFAULT_SETTINGS would
    // permanently overwrite the defaults for the rest of the session.
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    // The merge is shallow, so every array either comes straight off disk -
    // where it may be anything at all - or IS the default array itself. Both
    // need handling: a malformed value would throw here and take the whole
    // plugin down with it, and mutating a default would poison it for the
    // session. Rebuilding each one solves both at once.
    const storedRegions = Array.isArray(this.settings.regionSettings)
      ? this.settings.regionSettings
      : DEFAULT_SETTINGS.regionSettings;

    this.settings.regionSettings = storedRegions
      .filter((region) => region && typeof region.name === 'string')
      // A section removed since the file was written has no renderer any more,
      // so keeping its entry would only leave a dead toggle behind.
      .filter((region) => SECTION_ORDER.includes(region.name))
      .map((region) => ({
        name: region.name,
        active: region.active !== false,
        visible: region.visible === true,
      }));

    // A settings file written by an older version lacks sections added since.
    const known = this.settings.regionSettings.map((region) => region.name);

    DEFAULT_SETTINGS.regionSettings
      .filter((region) => !known.includes(region.name))
      .forEach((region) => this.settings.regionSettings.push({ ...region }));

    this.settings.savedColors = (
      Array.isArray(this.settings.savedColors)
        ? this.settings.savedColors
        : DEFAULT_SETTINGS.savedColors
    ).filter((color) => typeof color === 'string');
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private readonly toggleSidePanelControlView = async (): Promise<void> => {
    const { workspace } = this.app;

    // Detaching first is what lets the ribbon icon move the panel to the other
    // side after the setting changes.
    workspace.detachLeavesOfType(SidePanelControlViewType);

    // Both getters return null when the sidebar cannot host a leaf.
    const leaf = this.settings.sidePaneSideLeft
      ? workspace.getLeftLeaf(false)
      : workspace.getRightLeaf(false);

    if (!leaf) {
      new Notice(t('panel.noLeaf'));
      return;
    }

    await leaf.setViewState({
      type: SidePanelControlViewType,
      active: true,
    });

    await workspace.revealLeaf(leaf);
  };
}

class SettingsTab extends PluginSettingTab {
  plugin: MarkdownAutocompletePlugin;

  /**
   * Text fields fire on every keystroke and each save rewrites data.json in
   * full, so a 200-character template meant 200 rewrites - and on a synced
   * vault, 200 chances at a conflict. Coalescing them costs nothing: the
   * in-memory settings are already up to date when the panel reads them.
   */
  private readonly saveSoon = debounce(
    (): void => {
      void this.plugin.saveSettings();
    },
    400,
    true,
  );

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

    // Scopes the stylesheet's overrides of Obsidian's own button classes to
    // this tab, so they cannot restyle the rest of the app.
    containerEl.addClass('mfa-scope');

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
      .setName(t('settings.sidePaneSide.name'))
      .setDesc(t('settings.sidePaneSide.desc'))
      .addText((text) =>
        text
          .setPlaceholder(t('settings.sidePaneSide.placeholder'))
          .setValue(this.plugin.settings.sidePaneSideLeft ? 'left' : 'right')
          .onChange((value) => {
            this.plugin.settings.sidePaneSideLeft =
              value === 'left' ? true : false;
            this.saveSoon();
          }),
      );

    new Setting(containerEl)
      .setName(t('settings.calloutTitles.name'))
      .setDesc(t('settings.calloutTitles.desc'))
      .addToggle((comp) => {
        comp
          .setValue(this.plugin.settings.calloutTitles)
          .onChange(async (value) => {
            this.plugin.settings.calloutTitles = value;
            await this.plugin.saveSettings();
          });
      });

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

    this.addSavedColorSettings(containerEl);
  }

  /**
   * Saved colours as swatches rather than a text field.
   *
   * The old version was a textarea pinned to 400px whatever it held, and it
   * asked people to type hex codes by hand - so it also needed a validator and
   * a warning for malformed lines. Showing the actual colours removes all of
   * that: a swatch cannot be misspelled.
   */
  private addSavedColorSettings(containerEl: HTMLElement) {
    const colors = this.plugin.settings.savedColors;

    const setting = new Setting(containerEl)
      .setName(t('settings.savedColors.name'))
      .setDesc(t('settings.savedColors.desc'));

    // Built into the control area ahead of the picker rather than left loose
    // under the description, where they read as leftover decoration instead of
    // as a control.
    const swatches = setting.controlEl.createDiv({ cls: 'mfa-color-swatches' });

    if (colors.length === 0) {
      swatches.createSpan({ cls: 'mfa-color-empty' }).setText(
        t('settings.savedColors.empty'),
      );
    }

    colors.forEach((color, index) => {
      const swatch = swatches.createDiv({
        cls: 'mfa-color-icon mfa-removable',
      });
      swatch.style.setProperty('--mfa-swatch', color);
      swatch.setAttribute('aria-label', color);
      swatch.title = `${color} - ${t('settings.savedColors.removeHint')}`;

      // Redraw before awaiting the write: the old DOM stays live during the
      // await, and a second click would still carry its stale index.
      swatch.onClickEvent(() => {
        colors.splice(index, 1);
        this.display();
        void this.plugin.saveSettings();
      });
    });

    setting.addColorPicker((picker) =>
      picker.setValue(DEFAULT_PICKER_COLOR).onChange(async (value) => {
        if (colors.includes(value)) return;

        colors.push(value);
        await this.plugin.saveSettings();
        this.display();
      }),
    );
  }
}
