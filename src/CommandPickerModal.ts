import { App, Command, FuzzySuggestModal } from 'obsidian';

/**
 * Picks a command to put on the toolbar.
 *
 * Fuzzy search over everything the vault has registered, which is the point of
 * building the toolbar out of command ids: Obsidian's own commands and other
 * plugins' are as eligible as this plugin's, so the row can be assembled around
 * how someone actually writes rather than around what this plugin happens to
 * provide.
 */
export class CommandPickerModal extends FuzzySuggestModal<Command> {
  private choices: Command[] = [];
  private onPick: (id: string) => void = () => {};

  public getItems(): Command[] {
    return this.choices;
  }

  public getItemText(command: Command): string {
    return command.name;
  }

  public onChooseItem(command: Command): void {
    this.onPick(command.id);
  }

  public static open(
    app: App,
    available: Command[],
    taken: string[],
    placeholder: string,
    onPick: (id: string) => void,
  ): void {
    const modal = new CommandPickerModal(app);

    // Already on the toolbar means nothing to add: a second button would run
    // the same command, and removing one would appear to remove both.
    modal.choices = available.filter((command) => !taken.includes(command.id));
    modal.onPick = onPick;
    modal.setPlaceholder(placeholder);
    modal.open();
  }
}
