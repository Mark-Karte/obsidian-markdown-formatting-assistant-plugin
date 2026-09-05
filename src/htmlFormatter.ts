import { Editor } from 'obsidian';
import { baseFormatterSetting } from './formatter';
import { withIds } from './generalFunctions';

export interface htmlFormatterSetting extends baseFormatterSetting {
  symbol: string;
  shift: number;
  selectionInput: number;
}

/**
 * A pair of tags with the caret placed between them.
 *
 * The offset is derived rather than counted: '<div style="text-align: justify">'
 * is not a length anyone should be working out by hand, and a wrong one puts
 * the caret in the middle of an attribute.
 */
const wrapper = (des: string, open: string, close: string) => ({
  des,
  symbol: open + close,
  shift: open.length,
  selectionInput: open.length,
  objectType: 'htmlFormatterSetting',
});

export const htmlFormatterSettings = withIds({
  // Obsidian has no page break of its own, so this is the html people were
  // copying by hand - issues #49 and #35.
  pageBreak: wrapper(
    'page break',
    '<div style="page-break-after: always;">',
    '</div>',
  ),

  // Issue #44, which listed exactly these.
  alignLeft: wrapper('align left', '<div style="text-align: left">', '</div>'),
  alignCenter: wrapper(
    'align center',
    '<div style="text-align: center">',
    '</div>',
  ),
  alignRight: wrapper(
    'align right',
    '<div style="text-align: right">',
    '</div>',
  ),
  alignJustify: wrapper(
    'align justify',
    '<div style="text-align: justify">',
    '</div>',
  ),

  br: {
    des: '<br/>',
    symbol: '<br/>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  div: {
    des: '<div>',
    symbol: '<div></div>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  span: {
    des: '<span>',
    symbol: '<span></span>',
    shift: 6,
    selectionInput: 6,
    objectType: 'htmlFormatterSetting',
  },
  img: {
    des: '<img>',
    // img is a void element - a closing tag is rendered as literal text
    symbol: '<img src="" alt="" width="" height="">',
    // 10 = length of '<img src="', so both the cursor and a selection land
    // inside the src attribute
    shift: 10,
    selectionInput: 10,
    objectType: 'htmlFormatterSetting',
  },
  a: {
    des: '<a>',
    symbol: '<a></a>',
    shift: 3,
    selectionInput: 3,
    objectType: 'htmlFormatterSetting',
  },
  p: {
    des: '<p>',
    symbol: '<p></p>',
    shift: 3,
    selectionInput: 3,
    objectType: 'htmlFormatterSetting',
  },
  font: {
    des: '<font>',
    symbol:
      '<span style="font-family:default; font-size:default; color:red"></span>',
    shift: 64,
    selectionInput: 64,
    objectType: 'htmlFormatterSetting',
  },
  table: {
    des: '<table>',
    symbol: '<table></table>',
    shift: 7,
    selectionInput: 7,
    objectType: 'htmlFormatterSetting',
  },
  thead: {
    des: '<thead>',
    symbol: '<thead></thead>',
    shift: 7,
    selectionInput: 7,
    objectType: 'htmlFormatterSetting',
  },
  tbody: {
    des: '<tbody>',
    symbol: '<tbody></tbody>',
    shift: 7,
    selectionInput: 7,
    objectType: 'htmlFormatterSetting',
  },
  tfoot: {
    des: '<tfoot>',
    symbol: '<tfoot></tfoot>',
    shift: 7,
    selectionInput: 7,
    objectType: 'htmlFormatterSetting',
  },
  tr: {
    des: '<tr>',
    symbol: '<tr></tr>',
    shift: 4,
    selectionInput: 4,
    objectType: 'htmlFormatterSetting',
  },
  td: {
    des: '<td>',
    symbol: '<td></td>',
    shift: 4,
    selectionInput: 4,
    objectType: 'htmlFormatterSetting',
  },
  th: {
    des: '<th>',
    symbol: '<th></th>',
    shift: 4,
    selectionInput: 4,
    objectType: 'htmlFormatterSetting',
  },
  details: {
    des: '<details>',
    symbol: '<details></details>',
    shift: 9,
    selectionInput: 9,
    objectType: 'htmlFormatterSetting',
  },
  summary: {
    des: '<summary>',
    symbol: '<summary></summary>',
    shift: 9,
    selectionInput: 9,
    objectType: 'htmlFormatterSetting',
  },
  u: {
    des: '<u>',
    symbol: '<u></u>',
    shift: 3,
    selectionInput: 3,
    objectType: 'htmlFormatterSetting',
  },
  i: {
    des: '<i>',
    symbol: '<i></i>',
    shift: 3,
    selectionInput: 3,
    objectType: 'htmlFormatterSetting',
  },
  b: {
    des: '<b>',
    symbol: '<b></b>',
    shift: 3,
    selectionInput: 3,
    objectType: 'htmlFormatterSetting',
  },
  em: {
    des: '<em>',
    symbol: '<em></em>',
    shift: 4,
    selectionInput: 4,
    objectType: 'htmlFormatterSetting',
  },
  strong: {
    des: '<strong>',
    symbol: '<strong></strong>',
    shift: 8,
    selectionInput: 8,
    objectType: 'htmlFormatterSetting',
  },
  mark: {
    des: '<mark>',
    symbol: '<mark></mark>',
    shift: 6,
    selectionInput: 6,
    objectType: 'htmlFormatterSetting',
  },
  sup: {
    des: '<sup>',
    symbol: '<sup></sup>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  sub: {
    des: '<sub>',
    symbol: '<sub></sub>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  kbd: {
    des: '<kbd>',
    symbol: '<kbd></kbd>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  pre: {
    des: '<pre>',
    symbol: '<pre></pre>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  center: {
    des: '<center>',
    symbol: '<center></center>',
    shift: 8,
    selectionInput: 8,
    objectType: 'htmlFormatterSetting',
  },
  dfn: {
    des: '<dfn>',
    symbol: '<dfn></dfn>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
  abbr: {
    des: '<abbr>',
    symbol: '<abbr title=""></abbr>',
    // The cursor goes into the title attribute, while a selection becomes the
    // visible text after the opening tag - hence the two differ here.
    shift: 13,
    selectionInput: 15,
    objectType: 'htmlFormatterSetting',
  },
  hr: {
    des: '<hr/>',
    symbol: '<hr/>',
    shift: 5,
    selectionInput: 5,
    objectType: 'htmlFormatterSetting',
  },
});

export function htmlFormatter(editor: Editor, item: htmlFormatterSetting) {
  if (editor) {
    const isSelection = editor.somethingSelected();
    const selection = editor.getSelection();
    const curserStart = editor.getCursor('from');
    const curserEnd = editor.getCursor('to');
    const line = editor.getLine(curserStart.line);

    editor.focus();

    if (isSelection) {
      let replacment = selection.trim();

      editor.replaceSelection(
        item.symbol.substring(0, item.selectionInput) +
          replacment +
          item.symbol.substring(item.selectionInput),
      );
      editor.setCursor(curserStart.line, curserStart.ch + item.shift);
    } else {
      editor.replaceRange(item.symbol, curserStart);
      editor.setCursor(curserStart.line, curserStart.ch + item.shift);
    }
  }
}
