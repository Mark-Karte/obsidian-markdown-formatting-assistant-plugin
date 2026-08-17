import { LocaleDictionary } from './en';

export const pt: LocaleDictionary = {
  'command.openPanel': 'Abrir Markdown Formatting Assistant',
  'command.openCommandSelector': 'Abrir seletor de comandos',
  'command.openCalloutsSelector': 'Abrir seletor de destaques',

  'section.textEdit': 'Texto',
  'section.tables': 'Tabelas',
  'section.html': 'HTML',
  'section.latex': 'LaTeX',
  'section.greekLetters': 'Letras gregas',
  'section.colors': 'Cores',
  'section.callouts': 'Destaques',

  'tables.upcoming': 'em breve ...',
  'html.reportMissingTag': 'Falta alguma tag? Avise!',
  'latex.introduction': 'Introdução à matemática em LaTeX',
  'latex.reportMissingFunction': 'Falta alguma função do LaTeX? Avise!',
  'greek.lowerCase': 'Minúsculas',
  'greek.upperCase': 'Maiúsculas',
  'greek.overview': 'Visão geral do alfabeto grego',

  'colors.select': 'Escolher uma cor',
  'colors.save': 'Salvar cor',
  'colors.optionColor': ' Adicionar "color: {your color}"',
  'colors.optionBackgroundColor':
    ' Adicionar "background-color: {your color}"',
  'colors.optionStyleTag': ' Adicionar atributo: "style={your color}"',
  'colors.optionHtmlTag':
    ' Adicionar HTML: "<font color={your color}>{selected text}</font>"',
  'colors.lastUsed': 'Cores recentes:',
  'colors.saved': 'Cores salvas:',
  'colors.editInSettings':
    'As cores salvas podem ser editadas diretamente nas configurações.',
  'colors.help': 'Precisa de ajuda?',
  'colors.copied': 'Cor {color} copiada para a área de transferência',
  'colors.copyFailed': 'Não foi possível copiar a cor para a área de transferência',

  'settings.title': 'Configurações do Markdown Formatting Assistant',
  'settings.language.name': 'Idioma',
  'settings.language.desc':
    'Idioma da interface do plugin. (requer reinício)',
  'settings.language.auto': 'Igual ao Obsidian',
  'settings.triggerChar.name': 'Caractere de ativação',
  'settings.triggerChar.desc': 'Caractere que ativa o preenchimento automático',
  'settings.triggerChar.placeholder':
    'Digite um caractere para ativar o preenchimento automático',
  'settings.sidePaneSide.name': 'Lado do painel lateral',
  'settings.sidePaneSide.desc': 'Escolha de que lado o painel lateral aparece.',
  'settings.sidePaneSide.placeholder': 'Digite left ou right',
  'settings.toggleSection.name': 'Seção «{section}»',
  'settings.toggleSection.desc':
    'Ativar ou desativar a seção «{section}». (requer reinício)',
  'settings.savedColors.name': 'Cores salvas',
  'settings.savedColors.desc':
    'Cores salvas por meio do seletor de cores. A ordem também é considerada. Requer reiniciar o Obsidian.',
  'settings.savedColors.invalidFormat':
    'A cor {color} na linha {line} está em formato incorreto e não será salva.',

  'callout.note': 'Nota',
  'callout.info': 'Informação',
  'callout.todo': 'Tarefa',
  'callout.abstract': 'Resumo',
  'callout.summary': 'Síntese',
  'callout.tldr': 'Em resumo',
  'callout.tip': 'Dica',
  'callout.hint': 'Sugestão',
  'callout.important': 'Importante',
  'callout.success': 'Sucesso',
  'callout.check': 'Verificado',
  'callout.done': 'Concluído',
  'callout.question': 'Pergunta',
  'callout.help': 'Ajuda',
  'callout.faq': 'Perguntas frequentes',
  'callout.warning': 'Aviso',
  'callout.caution': 'Cuidado',
  'callout.attention': 'Atenção',
  'callout.failure': 'Falha',
  'callout.fail': 'Não aprovado',
  'callout.missing': 'Ausente',
  'callout.danger': 'Perigo',
  'callout.error': 'Erro',
  'callout.bug': 'Bug',
  'callout.example': 'Exemplo',
  'callout.quote': 'Citação',
};
