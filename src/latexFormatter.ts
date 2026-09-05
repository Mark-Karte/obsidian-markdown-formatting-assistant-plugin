import { Editor } from 'obsidian';
import { withIds } from './generalFunctions';

export interface latexFormatterSetting {
  des: string;
  text: string;
  symbol: string;
  shift: number;
  selectionInput: number;
  type: string;
  newLine: boolean;
  /** Kept out of the side panel; still reachable through the ALT+Q window. */
  suggestOnly?: boolean;
}

/**
 * An operator inserted whole, with the caret left after it.
 *
 * The offsets are derived rather than counted. Every one of them used to be a
 * hand-written number, which is fine until '\\Leftrightarrow' needs one.
 *
 * Most of these are `suggestOnly`. Issue #21 asked for many more operators
 * "only to the command suggestions to avoid saturating the side panel", which
 * is the right instinct: the useful set is far larger than a panel of buttons
 * can show without becoming a wall of symbols.
 */
const operator = (
  des: string,
  symbol: string,
  text: string,
  inPanel = false,
) => ({
  des,
  text,
  symbol,
  shift: symbol.length,
  selectionInput: symbol.length,
  type: 'text',
  newLine: false,
  suggestOnly: !inPanel,
  objectType: 'latexFormatterSetting',
});

/** An operator with braces to fill in, with the caret inside the first pair. */
const braced = (
  des: string,
  before: string,
  after: string,
  text: string,
  inPanel = false,
) => ({
  des,
  text,
  symbol: before + after,
  shift: before.length,
  selectionInput: before.length,
  type: 'text',
  newLine: false,
  suggestOnly: !inPanel,
  objectType: 'latexFormatterSetting',
});

export const latexFormatterSettings = withIds({
  inlineEquation: {
    des: 'inline equation',
    text: '$$x$$',
    symbol: '$$$$',
    shift: 2,
    selectionInput: 2,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  equation: {
    des: 'equation',
    text: '$x$',
    symbol: '$$',
    shift: 1,
    selectionInput: 1,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  division: {
    des: 'frac',
    text: 'division',
    symbol: '\\frac{}{}',
    shift: 6,
    selectionInput: 6,
    type: 'icon',
    newLine: true,
    objectType: 'latexFormatterSetting',
  },
  multiplication: {
    des: 'times cross product',
    text: 'multiplication',
    symbol: '\\times',
    shift: 6,
    selectionInput: 6,
    type: 'icon',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  sup: {
    des: 'superscript',
    text: 'x<sup>y</sup>',
    symbol: '^{}',
    shift: 2,
    selectionInput: 2,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  div: {
    // Raises to the power of -1 - this is the reciprocal, not a division.
    // 'division' is the fraction entry above, whose icon is named that way.
    des: 'inverse',
    text: 'x<sup>-1</sup>',
    symbol: '^{-1}',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  sub: {
    des: 'subscript',
    text: 'x<sub>y</sub>',
    symbol: '_{}',
    shift: 2,
    selectionInput: 2,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  e: {
    des: 'e',
    text: 'e<sup>x</sup>',
    symbol: 'e^{}',
    shift: 3,
    selectionInput: 3,
    type: 'text',
    newLine: true,
    objectType: 'latexFormatterSetting',
  },
  exp: {
    des: 'exp',
    text: 'exp',
    symbol: '\\exp()',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  log: {
    des: 'log',
    text: 'log',
    symbol: '\\log()',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  sin: {
    des: 'sin',
    text: 'sin',
    symbol: '\\sin()',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: true,
    objectType: 'latexFormatterSetting',
  },
  cos: {
    des: 'cos',
    text: 'cos',
    symbol: '\\cos()',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  tan: {
    des: 'tan',
    text: 'tan',
    symbol: '\\tan()',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  cot: {
    des: 'cot',
    text: 'cot',
    symbol: '\\cot()',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  sin2: {
    des: 'sin^2',
    text: 'sin<sup>2</sup>',
    symbol: '\\sin^2()',
    shift: 7,
    selectionInput: 7,
    type: 'text',
    newLine: true,
    objectType: 'latexFormatterSetting',
  },
  cos2: {
    des: 'cos^2',
    text: 'cos<sup>2</sup>',
    symbol: '\\cos^2()',
    shift: 7,
    selectionInput: 7,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  tan2: {
    des: 'tan^2',
    text: 'tan<sup>2</sup>',
    symbol: '\\tan^2()',
    shift: 7,
    selectionInput: 7,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  cot2: {
    des: 'cot^2',
    text: 'cot<sup>2</sup>',
    symbol: '\\cot^2()',
    shift: 7,
    selectionInput: 7,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  roundBrackets: {
    des: 'round brackets',
    text: '(x)',
    symbol: '\\left(\\right)',
    shift: 6,
    selectionInput: 6,
    type: 'text',
    newLine: true,
    objectType: 'latexFormatterSetting',
  },
  squareBrackets: {
    des: 'square brackets',
    text: '[x]',
    symbol: '\\left[\\right]',
    shift: 6,
    selectionInput: 6,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  curlyBrackets: {
    des: 'curly brackets',
    text: '{x}',
    symbol: '\\left\\{\\right\\}',
    shift: 7,
    selectionInput: 7,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  pipeBrackets: {
    des: 'pipe brackets',
    text: '|x|',
    symbol: '\\left|\\right|',
    shift: 6,
    selectionInput: 6,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  doublePipeBrackets: {
    des: 'double pipe brackets',
    text: '||x||',
    symbol: '\\left\\|\\right\\|',
    shift: 7,
    selectionInput: 7,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  sum: {
    des: 'sum',
    text: '∑',
    symbol: '\\sum_{}^{}',
    shift: 6,
    selectionInput: 6,
    type: 'text',
    newLine: true,
    objectType: 'latexFormatterSetting',
  },
  integral: {
    des: 'integral',
    text: '∫',
    symbol: '\\int_{}^{}',
    shift: 6,
    selectionInput: 6,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  sqrt: {
    des: 'square root',
    text: '√',
    symbol: '\\sqrt{}',
    shift: 6,
    selectionInput: 6,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  cdot: {
    des: 'cdot',
    text: '·',
    symbol: '\\cdot',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  hat: {
    des: 'hat',
    text: 'hat',
    symbol: '\\hat{}',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
  // ---- calculus, on the panel ------------------------------------------
  // Named in issues #38 and #21 as the gap that made the section "quite
  // limited". Four is what fits without turning the panel into a wall.
  infinity: braced('infinity', '\\infty', '', '∞', true),
  limit: braced('limit', '\\lim_{', '}', 'lim', true),
  partial: operator('partial derivative', '\\partial', '∂', true),
  product: braced('product', '\\prod_{', '}^{}', '∏', true),

  // ---- everything below is ALT+Q only ----------------------------------
  nabla: operator('nabla del', '\\nabla', '∇'),
  contourIntegral: braced('contour integral', '\\oint_{', '}^{}', '∮'),
  doubleIntegral: braced('double integral', '\\iint_{', '}^{}', '∬'),

  leq: operator('less than or equal', '\\leq', '≤'),
  geq: operator('greater than or equal', '\\geq', '≥'),
  neq: operator('not equal', '\\neq', '≠'),
  approx: operator('approximately equal', '\\approx', '≈'),
  equiv: operator('equivalent', '\\equiv', '≡'),
  propto: operator('proportional to', '\\propto', '∝'),
  simeq: operator('similar to', '\\sim', '∼'),

  elementOf: operator('element of', '\\in', '∈'),
  notElementOf: operator('not element of', '\\notin', '∉'),
  subset: operator('subset', '\\subset', '⊂'),
  subseteq: operator('subset or equal', '\\subseteq', '⊆'),
  union: operator('union', '\\cup', '∪'),
  intersection: operator('intersection', '\\cap', '∩'),
  emptySet: operator('empty set', '\\emptyset', '∅'),

  forAll: operator('for all', '\\forall', '∀'),
  exists: operator('there exists', '\\exists', '∃'),
  negation: operator('not negation', '\\neg', '¬'),
  logicalAnd: operator('logical and', '\\land', '∧'),
  logicalOr: operator('logical or', '\\lor', '∨'),

  arrowTo: operator('arrow to', '\\to', '→'),
  implies: operator('implies', '\\Rightarrow', '⇒'),
  iff: operator('if and only if', '\\Leftrightarrow', '⇔'),
  mapsTo: operator('maps to', '\\mapsto', '↦'),

  plusMinus: operator('plus minus', '\\pm', '±'),
  minusPlus: operator('minus plus', '\\mp', '∓'),
  angle: operator('angle', '\\angle', '∠'),
  degree: operator('degree', '^\\circ', '°'),
  ellipsis: operator('dots ellipsis', '\\dots', '…'),

  binomial: braced('binomial coefficient', '\\binom{', '}{}', 'binom'),
  overline: braced('overline', '\\overline{', '}', 'overline'),
  underline: braced('underline', '\\underline{', '}', 'underline'),
  textMode: braced('text inside maths', '\\text{', '}', 'text'),
  blackboardBold: braced('blackboard bold', '\\mathbb{', '}', 'ℝ'),

  vec: {
    des: 'vector',
    text: 'vec',
    symbol: '\\vec{}',
    shift: 5,
    selectionInput: 5,
    type: 'text',
    newLine: false,
    objectType: 'latexFormatterSetting',
  },
});

export function latexFormatter(editor: Editor, item: latexFormatterSetting) {
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
