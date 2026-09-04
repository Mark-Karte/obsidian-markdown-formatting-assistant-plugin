import {
  App,
  Command,
  FuzzyMatch,
  FuzzySuggestModal,
  SearchMatches,
} from 'obsidian';

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

  /**
   * With nothing typed, keep the order the list arrived in - this plugin's
   * commands first.
   *
   * The fuzzy matcher scores an empty query the same for everything, so the
   * order it returns rests on the sort being stable, which is not a promise
   * worth relying on for the one view every user sees before typing.
   */
  public getSuggestions(query: string): FuzzyMatch<Command>[] {
    if (query.trim()) return super.getSuggestions(query);

    // Nothing was searched for, so there is nothing to highlight.
    const matches: SearchMatches = [];

    return this.choices.map((item) => ({ item, match: { score: 0, matches } }));
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

    // Well above the default, which is a screenful. This plugin's own commands
    // are at the head of the list and there are fifty of them, so the default
    // would show those and nothing else to browse past.
    modal.limit = 150;

    modal.open();
  }
}
