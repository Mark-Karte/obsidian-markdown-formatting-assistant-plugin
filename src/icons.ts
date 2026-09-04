import * as R from 'ramda';
import { addIcon } from 'obsidian';
import * as mdiIcons from '@mdi/js';
import { removeIcon } from 'obsidian';
import * as iconPaths from './iconPaths';
import { splitMarkup } from './markup';

function pathToSvg(icon: string) {
  return `
    <svg style="width:24px;height:24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="${icon}" />
    </svg>`;
}

function importIconPaths() {
  let res = {};
  R.forEachObjIndexed((value, key, obj) => {
    // @ts-ignore
    res = R.mergeLeft(res, R.map(pathToSvg, value));
  }, iconPaths);
  return res;
}

export const icons: Record<string, string> = {
  ...importIconPaths(),

  division: pathToSvg(mdiIcons.mdiDivision),
  multiplication: pathToSvg(mdiIcons.mdiCircleSmall),

  h1: pathToSvg(mdiIcons.mdiFormatHeader1),
  h2: pathToSvg(mdiIcons.mdiFormatHeader2),
  h3: pathToSvg(mdiIcons.mdiFormatHeader3),
  h4: pathToSvg(mdiIcons.mdiFormatHeader4),
  h5: pathToSvg(mdiIcons.mdiFormatHeader5),
  h6: pathToSvg(mdiIcons.mdiFormatHeader6),
  bold: pathToSvg(mdiIcons.mdiFormatBold),
  italic: pathToSvg(mdiIcons.mdiFormatItalic),
  strikethrough: pathToSvg(mdiIcons.mdiFormatStrikethroughVariant),
  codeInline: pathToSvg(mdiIcons.mdiCodeTags),
  codeBlock: pathToSvg(mdiIcons.mdiXml),
  link: pathToSvg(mdiIcons.mdiLinkVariant),
  mermaidBlock: pathToSvg(mdiIcons.mdiGraph),
  fileLink: pathToSvg(mdiIcons.mdiFileLink),
  image: pathToSvg(mdiIcons.mdiImage),
  quote: pathToSvg(mdiIcons.mdiFormatIndentIncrease),
  bulletList: pathToSvg(mdiIcons.mdiFormatListBulleted),
  numberList: pathToSvg(mdiIcons.mdiFormatListNumbered),
  checkList: pathToSvg(mdiIcons.mdiFormatListBulletedSquare),
  viewIcon: pathToSvg(mdiIcons.mdiLanguageMarkdown),
  underline: pathToSvg(mdiIcons.mdiFormatUnderline),
  menu: pathToSvg(mdiIcons.mdiMenu),
  expandArrowDown: pathToSvg(mdiIcons.mdiChevronDown),
  expandArrowUp: pathToSvg(mdiIcons.mdiChevronUp),
  highlight: pathToSvg(mdiIcons.mdiMarker),
};

export const addIcons = (): void => {
  Object.keys(icons).forEach((key) => {
    addIcon(key, icons[key]);
  });
};

/**
 * addIcon is a module-level function, not a Plugin method, so Component's
 * automatic teardown does not cover it - without this the icons stay in the
 * app's global registry after the plugin is disabled.
 */
export const removeIcons = (): void => {
  Object.keys(icons).forEach((key) => {
    removeIcon(key);
  });
};

/**
 * Convert an svg string into an HTML element.
 *
 * @param svgText svg image as a string
 */
export const svgToElement = (key: string | number): HTMLElement => {
  if (key.toString().includes('.svg')) {
    const img = document.createElement('img');
    img.src = key.toString();
    img.addClass('mfa-icon-image');

    return img;
  } else {
    const parser = new DOMParser();
    return parser.parseFromString(icons[key], 'text/xml').documentElement;
  }
};

/**
 * Writes a button label, honouring the `<sup>` and `<sub>` some of them carry.
 *
 * Built node by node rather than handed to innerHTML: see the note in
 * markup.ts for why that matters even for the plugin's own constants.
 */
export const appendLabel = (parent: HTMLElement, label: string): void => {
  splitMarkup(label).forEach((part) => {
    if (part.tag === 'text') {
      parent.appendText(part.value);
    } else {
      parent.createEl(part.tag).setText(part.value);
    }
  });
};
