import { LocaleDictionary } from './en';

/** 'view.displayName' is deliberately absent - the product name stays as is. */
export const ru: LocaleDictionary = {
  'command.openPanel': 'Открыть Markdown Formatting Assistant',
  'command.openCommandSelector': 'Открыть выбор команд',
  'command.openCalloutsSelector': 'Открыть выбор коллаутов',

  'section.textEdit': 'Текст',
  'section.tables': 'Таблицы',
  'section.html': 'HTML',
  'section.latex': 'LaTeX',
  'section.greekLetters': 'Греческие буквы',
  'section.colors': 'Цвета',
  'section.callouts': 'Коллауты',

  'tables.upcoming': 'скоро ...',
  'html.reportMissingTag': 'Не хватает тега? Сообщите!',
  'latex.introduction': 'Введение в математику LaTeX',
  'latex.reportMissingFunction': 'Не хватает функции LaTeX? Сообщите!',
  'greek.lowerCase': 'Строчные',
  'greek.upperCase': 'Прописные',
  'greek.overview': 'Обзор греческого алфавита',

  'colors.select': 'Выбрать цвет',
  'colors.save': 'Сохранить цвет',
  'colors.optionColor': ' Добавить "color: {your color}"',
  'colors.optionBackgroundColor': ' Добавить "background-color: {your color}"',
  'colors.optionStyleTag': ' Добавить атрибут: "style={your color}"',
  'colors.optionHtmlTag':
    ' Добавить HTML: "<font color={your color}>{selected text}</font>"',
  'colors.lastUsed': 'Последние цвета:',
  'colors.saved': 'Сохранённые цвета:',
  'colors.editInSettings':
    'Сохранённые цвета можно править прямо в настройках.',
  'colors.help': 'Нужна помощь?',
  'colors.copied': 'Цвет {color} скопирован в буфер обмена',
  'colors.copyFailed': 'Не удалось скопировать цвет в буфер обмена',

  'settings.title': 'Настройки Markdown Formatting Assistant',
  'settings.language.name': 'Язык',
  'settings.language.desc': 'Язык интерфейса плагина. (требуется перезапуск)',
  'settings.language.auto': 'Как в Obsidian',
  'settings.triggerChar.name': 'Символ-триггер',
  'settings.triggerChar.desc': 'Символ, запускающий автодополнение',
  'settings.triggerChar.placeholder':
    'Введите символ для запуска автодополнения',
  'settings.sidePaneSide.name': 'Сторона панели',
  'settings.sidePaneSide.desc': 'С какой стороны открывается боковая панель.',
  // 'left' and 'right' are the literal values this field accepts, so they are
  // not translated.
  'settings.sidePaneSide.placeholder': 'Введите left или right',
  'settings.toggleSection.name': 'Секция «{section}»',
  'settings.toggleSection.desc':
    'Включить или выключить секцию «{section}». (требуется перезапуск)',
  'settings.savedColors.name': 'Сохранённые цвета',
  'settings.savedColors.desc':
    'Цвета, сохранённые через палитру. Порядок тоже учитывается. Требуется перезапуск Obsidian.',
  'settings.savedColors.invalidFormat':
    'Цвет {color} в строке {line} имеет неверный формат и не будет сохранён.',

  'callout.note': 'Заметка',
  'callout.info': 'Информация',
  'callout.todo': 'Задача',
  'callout.abstract': 'Аннотация',
  'callout.summary': 'Сводка',
  'callout.tldr': 'Кратко',
  'callout.tip': 'Совет',
  'callout.hint': 'Подсказка',
  'callout.important': 'Важно',
  'callout.success': 'Успех',
  'callout.check': 'Проверено',
  'callout.done': 'Готово',
  'callout.question': 'Вопрос',
  'callout.help': 'Помощь',
  'callout.faq': 'ЧаВо',
  'callout.warning': 'Предупреждение',
  'callout.caution': 'Осторожно',
  'callout.attention': 'Внимание',
  'callout.failure': 'Неудача',
  'callout.fail': 'Провал',
  'callout.missing': 'Отсутствует',
  'callout.danger': 'Опасность',
  'callout.error': 'Ошибка',
  'callout.bug': 'Баг',
  'callout.example': 'Пример',
  'callout.quote': 'Цитата',
};
