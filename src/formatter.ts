import { Editor } from 'obsidian';
import * as R from 'ramda';
import { withIds } from './generalFunctions';

export interface baseFormatterSetting {
  /** Stable identifier, derived from the table key. Never translated. */
  id: string;
  objectType: string;
  /** Display label shown to the user - translatable. */
  des: string;
  icon: string;
  text: string;
  type: string;
}

export interface formatterSetting extends baseFormatterSetting {
  symbol: string;
  shift: number;
  selectionInput: number;
  newLine: boolean;
  enclose: boolean;
}

export const formatSettings = withIds({
  h1: {
    des: 'h1',
    icon: 'h1',
    symbol: '# ',
    shift: 2,
    selectionInput: 0,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  h2: {
    des: 'h2',
    icon: 'h2',
    symbol: '## ',
    shift: 3,
    selectionInput: 0,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  h3: {
    des: 'h3',
    icon: 'h3',
    symbol: '### ',
    shift: 4,
    selectionInput: 0,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  h4: {
    des: 'h4',
    icon: 'h4',
    symbol: '#### ',
    shift: 5,
    selectionInput: 0,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  h5: {
    des: 'h5',
    icon: 'h5',
    symbol: '##### ',
    shift: 6,
    selectionInput: 0,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  h6: {
    des: 'h6',
    icon: 'h6',
    symbol: '###### ',
    shift: 7,
    selectionInput: 0,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  bold: {
    des: 'bold',
    icon: 'bold',
    symbol: '****',
    shift: 2,
    selectionInput: 2,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  italic: {
    des: 'italic',
    icon: 'italic',
    symbol: '**',
    shift: 1,
    selectionInput: 1,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  underline: {
    des: 'underline',
    icon: 'underline',
    symbol: '<u></u>',
    shift: 3,
    selectionInput: 3,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  strikethrough: {
    des: 'strikethrough',
    icon: 'strikethrough',
    symbol: '~~~~',
    shift: 2,
    selectionInput: 2,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  highlight: {
    des: 'highlight',
    icon: 'highlight',
    symbol: '========',
    shift: 4,
    selectionInput: 4,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  codeBlock: {
    des: 'code_block',
    icon: 'codeBlock',
    symbol: '``` \n```',
    shift: 4,
    selectionInput: 4,
    newLine: true,
    enclose: true,
    objectType: 'formatterSetting',
  },
  mermaidBlock: {
    des: 'mermaid_block',
    icon: 'mermaidBlock',
    symbol: '```mermaid \n```',
    // '```mermaid ' is 11 chars - splitting anywhere else tears the fence apart
    shift: 11,
    selectionInput: 11,
    newLine: true,
    enclose: true,
    objectType: 'formatterSetting',
  },
  codeInline: {
    des: 'code_inline',
    icon: 'codeInline',
    symbol: '``',
    shift: 1,
    selectionInput: 1,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  link: {
    des: 'link',
    icon: 'link',
    symbol: '[]()',
    shift: 3,
    selectionInput: 1,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  internalLink: {
    des: 'internal_link',
    icon: 'fileLink',
    symbol: '[[]]',
    shift: 2,
    selectionInput: 2,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  image: {
    des: 'image',
    icon: 'image',
    symbol: '![]()',
    shift: 4,
    selectionInput: 2,
    newLine: false,
    enclose: false,
    objectType: 'formatterSetting',
  },
  blockquote: {
    des: 'blockquote',
    icon: 'quote',
    symbol: '> ',
    shift: 2,
    selectionInput: 0,
    newLine: true,
    enclose: false,
    objectType: 'formatterSetting',
  },
  bulletList: {
    des: 'bullet_list',
    icon: 'bulletList',
    symbol: '- ',
    shift: 2,
    selectionInput: 0,
    newLine: true,
    enclose: false,
    objectType: 'formatterSetting',
  },
  numberList: {
    des: 'number_list',
    icon: 'numberList',
    symbol: '1. ',
    shift: 3,
    selectionInput: 0,
    newLine: true,
    enclose: false,
    objectType: 'formatterSetting',
  },
  checkList: {
    des: 'check_list',
    icon: 'checkList',
    symbol: '- [ ] ',
    shift: 6,
    selectionInput: 0,
    newLine: true,
    enclose: false,
    objectType: 'formatterSetting',
  },
});

export function iconFormatter(editor: Editor, item: formatterSetting) {
  if (editor) {
    const isSelection = editor.somethingSelected();
    const selection = editor.getSelection();
    const curserStart = editor.getCursor('from');
    const curserEnd = editor.getCursor('to');
    const line = editor.getLine(curserStart.line);

    editor.focus();

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(item.id)) {
      const reStringExact = '^\\s*' + item.symbol + '+\\s*';
      const reStringAny = '^\\s*#+\\s*';
      const cleanedLine = line.replace(new RegExp(reStringAny, 'g'), '');
      let replacement = item.symbol + cleanedLine;

      // To delete the headings if the same heading is clicked twice
      if (new RegExp(reStringExact, 'g').test(line)) {
        replacement = cleanedLine;
      }

      // replace the hole line with the updated new line
      editor.replaceRange(
        replacement,
        { line: curserStart.line, ch: 0 },
        { line: curserStart.line, ch: line.length },
      );

      // Calculate the shift of the course depending on how many # are in the old and new line
      const oldNumberOfHeadings = R.match(/([#])/g, line).length;
      const newNumberOfHeadings = R.match(/([#])/g, replacement).length;
      let courserCorrection = newNumberOfHeadings - oldNumberOfHeadings;

      // If the old or the new line doesn't contain any heading than the course correction has to be corrected by the space after the # (### sdfsd)
      if (newNumberOfHeadings === 0) courserCorrection -= 1;
      if (oldNumberOfHeadings === 0) courserCorrection += 1;

      // finally set the new course position

      editor.setCursor(curserStart.line, curserStart.ch + courserCorrection);
    } else if (
      [
        'bold',
        'italic',
        'strikethrough',
        'codeInline',
        'link',
        'internalLink',
        'image',
        'underline',
        'highlight',
      ].includes(item.id)
    ) {
      if (isSelection) {
        editor.replaceSelection(
          item.symbol.substring(0, item.selectionInput) +
            selection +
            item.symbol.substring(item.selectionInput),
        );

        editor.setCursor(
          curserStart.line,
          curserStart.ch + selection.length + item.shift,
        );
      } else {
        editor.replaceRange(item.symbol, curserStart);
        editor.setCursor(curserStart.line, curserStart.ch + item.shift);
      }
    } else if (
      item.id === 'codeBlock' ||
      item.id === 'mermaidBlock'
    ) {
      if (isSelection) {
        const re = new RegExp('^(```).*(```)$', 'gs');
        const match = selection.trim().match(re);
        let replacment = selection.trim();

        if (match) {
          replacment = editor
            .getSelection()
            .trim()
            .replace(/^(```)/g, '')
            .replace(/(```)$/g, '');
          editor.replaceSelection(replacment);
        } else {
          editor.replaceSelection(
            item.symbol.substring(0, item.selectionInput) +
              '\n' +
              replacment +
              item.symbol.substring(item.selectionInput),
          );
          editor.setCursor(curserStart.line, curserStart.ch + item.shift);
        }
      } else {
        // If the current line already holds text, the block is appended on a
        // fresh line below it, otherwise it replaces the empty line in place.
        const hasContent = line.trim().length > 0;
        const pos = {
          line: curserStart.line,
          ch: hasContent ? line.length : 0,
        };
        const replacement = hasContent ? '\n' + item.symbol : item.symbol;

        editor.replaceRange(replacement, pos);

        // The opening fence always ends up on its own line, so the shift is
        // counted from the start of that line - not from the old cursor.
        editor.setCursor(
          hasContent ? curserStart.line + 1 : curserStart.line,
          item.shift,
        );
      }
    } else if (
      ['blockquote', 'bulletList', 'numberList', 'checkList'].includes(item.id)
    ) {
      // The symbol goes into a regex, so its own special characters have to be
      // escaped - '1. ' would otherwise let the dot match anything.
      const escapedSymbol = item.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const markerRe = new RegExp('^(\\s*)' + escapedSymbol);

      const hasMarker = (text: string) => markerRe.test(text);

      // Indentation is what makes markdown lists nest, so it has to survive
      // the toggle in both directions. A quote marker belongs in front of the
      // whole line, a list marker behind the indentation.
      const addMarker = (text: string) => {
        if (item.id === 'blockquote') return item.symbol + text;
        return text.replace(/^(\s*)/, (_full, indent) => indent + item.symbol);
      };

      const removeMarker = (text: string) => text.replace(markerRe, '$1');

      if (isSelection) {
        const selectionLines = selection.split('\n');
        const allAreItems = selectionLines.every(hasMarker);

        const convertedSelectionLines = selectionLines.map((selectionLine) => {
          if (allAreItems) return removeMarker(selectionLine);
          return hasMarker(selectionLine)
            ? selectionLine
            : addMarker(selectionLine);
        });

        editor.replaceSelection(convertedSelectionLines.join('\n'));
      } else {
        const replacement = hasMarker(line)
          ? removeMarker(line)
          : addMarker(line);

        editor.replaceRange(
          replacement,
          { line: curserStart.line, ch: 0 },
          { line: curserStart.line, ch: line.length },
        );
      }
    }
  }
}
