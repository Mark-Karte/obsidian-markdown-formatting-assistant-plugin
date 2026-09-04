import {
  Command,
  MarkdownView,
  Plugin,
  WorkspaceLeaf,
  setIcon,
} from 'obsidian';
import { shortLabel } from './commandNames';
import {
  sortedCommands,
  toolbarAlignment,
  toolbarSetting,
} from './toolbarSettings';

const TOOLBAR_CLASS = 'mfa-toolbar';

/**
 * Obsidian's command registry. It is not in the published typings, but it is
 * how every plugin that runs another plugin's command does it, and it is what
 * makes the toolbar worth having: the buttons are commands, so Obsidian's own
 * and other plugins' can sit on it alongside this plugin's.
 */
interface commandRegistry {
  commands: Record<string, Command>;
  executeCommandById(id: string): boolean;
}

export function getCommandRegistry(plugin: Plugin): commandRegistry {
  // @ts-ignore - see the note above.
  return plugin.app.commands as commandRegistry;
}

/** Everything registered, sorted - see sortedCommands for why not listCommands. */
export function allCommands(registry: commandRegistry): Command[] {
  return sortedCommands(registry.commands);
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
  /**
   * Every bar this instance built.
   *
   * Kept rather than searched for at teardown time. A note moved to its own
   * window gets a bar too - getLeavesOfType covers floating leaves - and that
   * window has its own `document`, which a query from here would never reach.
   * Holding the elements sidesteps the question of which realm each is in.
   */
  private readonly bars = new Set<HTMLElement>();

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
    const { enabled, commands, alignment } = this.settings();

    this.plugin.app.workspace.getLeavesOfType('markdown').forEach((leaf) => {
      const view = leaf.view;

      if (!(view instanceof MarkdownView)) return;

      // Reading mode has no editor to write to, and every button here writes.
      const wanted =
        enabled && commands.length > 0 && view.getMode() === 'source';

      this.apply(leaf, view, wanted ? commands : [], alignment);
    });
  }

  /** Removes every toolbar this plugin put on the page. */
  public detachAll(): void {
    this.bars.forEach((bar) => bar.remove());
    this.bars.clear();
  }

  private discard(bar: Element | null): void {
    if (!bar) return;

    this.bars.delete(bar as HTMLElement);
    bar.remove();
  }

  private apply(
    leaf: WorkspaceLeaf,
    view: MarkdownView,
    commands: string[],
    alignment: toolbarAlignment,
  ): void {
    const registry = getCommandRegistry(this.plugin);
    const host = view.contentEl;
    const existing = host.querySelector(`:scope > .${TOOLBAR_CLASS}`);

    // What can actually be drawn. A command is missing while the plugin that
    // registered it is disabled, and that has to be part of the comparison
    // below: otherwise re-enabling that plugin leaves the button missing until
    // something else forces a rebuild.
    const drawable = commands.filter((id) => registry.commands[id]);

    if (drawable.length === 0) {
      this.discard(existing);
      return;
    }

    // Rebuilding on every pane switch would be wasteful and would drop the
    // focus ring mid-click, so what was rendered is stamped on the element and
    // compared first. The alignment is in the stamp too: it is a class on the
    // same element, and a change to it has to reach a pane already on screen.
    const signature = [alignment, ...drawable].join('\n');

    if (existing instanceof HTMLElement) {
      if (existing.dataset.signature === signature) return;
    }

    this.discard(existing);

    // Built through the host so it belongs to that pane's document - a popout
    // window has its own, and an element made here would be foreign to it.
    const bar = host.createDiv({
      cls: `${TOOLBAR_CLASS} is-align-${alignment}`,
    });
    bar.dataset.signature = signature;

    this.fill(bar, leaf, view, drawable, registry);
    this.bars.add(bar);

    // createDiv appends; the bar belongs above the note, not below it.
    host.prepend(bar);
  }

  private fill(
    bar: HTMLElement,
    leaf: WorkspaceLeaf,
    view: MarkdownView,
    commands: string[],
    registry: ReturnType<typeof getCommandRegistry>,
  ): void {
    commands.forEach((id) => {
      const command = registry.commands[id];

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

      // Focus moves on mousedown, before any click handler runs, so this is
      // the only place it can be stopped. Left alone the caret lands on the
      // button: the note stops receiving what is typed, and the next Space or
      // Enter activates the button again and undoes the command.
      button.addEventListener('mousedown', (event) => event.preventDefault());

      button.addEventListener('click', () => {
        // Commands run against whatever Obsidian considers active, and with
        // the focus steal suppressed a click no longer makes that this pane.
        // With two notes side by side the button would otherwise write into
        // the other one.
        this.plugin.app.workspace.setActiveLeaf(leaf, { focus: true });
        view.editor.focus();

        registry.executeCommandById(id);
      });
    });
  }
}
