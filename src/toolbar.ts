import { Command, MarkdownView, Plugin, setIcon } from 'obsidian';
import { shortLabel } from './commandNames';
import { toolbarSetting } from './toolbarSettings';

const TOOLBAR_CLASS = 'mfa-toolbar';

/**
 * Obsidian's command registry. It is not in the published typings, but it is
 * how every plugin that runs another plugin's command does it, and it is what
 * makes the toolbar worth having: the buttons are commands, so Obsidian's own
 * and other plugins' can sit on it alongside this plugin's.
 */
interface commandRegistry {
  commands: Record<string, Command>;
  listCommands(): Command[];
  executeCommandById(id: string): boolean;
}

export function getCommandRegistry(plugin: Plugin): commandRegistry {
  // @ts-ignore - see the note above.
  return plugin.app.commands as commandRegistry;
}

/**
 * A row of buttons above the note.
 *
 * Obsidian publishes no place to put one, so the element is inserted into the
 * markdown view's own content container. That is a dependency on the app's
 * layout rather than on its API, which is the price of the feature: it is the
 * first thing to check if a future Obsidian release moves the toolbar or
 * loses it.
 *
 * Everything is torn down again in `detachAll`, called from the plugin's
 * onunload, because an element left behind would outlive the plugin.
 */
export class EditorToolbar {
  constructor(
    private readonly plugin: Plugin,
    private readonly settings: () => toolbarSetting,
  ) {}

  /** Starts watching for panes to decorate. */
  public start(): void {
    const { workspace } = this.plugin.app;

    // Both are needed: opening a tab is a layout change, moving between
    // existing tabs is not.
    this.plugin.registerEvent(
      workspace.on('layout-change', () => this.refresh()),
    );
    this.plugin.registerEvent(
      workspace.on('active-leaf-change', () => this.refresh()),
    );

    workspace.onLayoutReady(() => this.refresh());
  }

  /** Brings every open markdown pane in line with the current settings. */
  public refresh(): void {
    const { enabled, commands } = this.settings();

    this.plugin.app.workspace
      .getLeavesOfType('markdown')
      .forEach((leaf) => {
        const view = leaf.view as MarkdownView;

        if (!(view instanceof MarkdownView)) return;

        // Reading mode has no editor to write to, and every button here writes.
        const wanted = enabled && commands.length > 0 && view.getMode() === 'source';

        this.apply(view, wanted ? commands : []);
      });
  }

  /** Removes every toolbar this plugin put on the page. */
  public detachAll(): void {
    document
      .querySelectorAll(`.${TOOLBAR_CLASS}`)
      .forEach((bar) => bar.remove());
  }

  private apply(view: MarkdownView, commands: string[]): void {
    const host = view.contentEl;
    const existing = host.querySelector(`:scope > .${TOOLBAR_CLASS}`);

    if (commands.length === 0) {
      existing?.remove();
      return;
    }

    // Rebuilding on every pane switch would be wasteful and would drop the
    // focus ring mid-click, so the rendered list is stamped on the element and
    // compared first.
    const signature = commands.join('\n');

    if (existing instanceof HTMLElement) {
      if (existing.dataset.signature === signature) return;
      existing.remove();
    }

    const bar = createDiv({ cls: TOOLBAR_CLASS });
    bar.dataset.signature = signature;

    this.fill(bar, commands);

    // First child, so it sits above the note rather than over it.
    host.insertBefore(bar, host.firstChild);
  }

  private fill(bar: HTMLElement, commands: string[]): void {
    const registry = getCommandRegistry(this.plugin);

    commands.forEach((id) => {
      const command = registry.commands[id];

      // A command disappears when its plugin is disabled or removed. The entry
      // stays in the settings - it will work again when the plugin comes back -
      // but there is nothing to draw and nothing a click could do.
      if (!command) return;

      const button = bar.createEl('button', {
        cls: 'mfa-toolbar-button clickable-icon',
      });
      button.setAttribute('aria-label', command.name);
      button.type = 'button';

      if (command.icon) {
        setIcon(button, command.icon);
      } else {
        button.setText(shortLabel(command.name));
      }

      button.addEventListener('click', (event) => {
        // Without this the editor loses the selection the command is about to
        // act on.
        event.preventDefault();
        registry.executeCommandById(id);
      });
    });
  }
}
