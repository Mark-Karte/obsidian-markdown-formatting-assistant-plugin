import { LocaleDictionary } from './en';

export const fr: LocaleDictionary = {
  'command.openPanel': 'Ouvrir Markdown Formatting Assistant',
  'command.openCommandSelector': 'Ouvrir le sélecteur de commandes',
  'command.openCalloutsSelector': 'Ouvrir le sélecteur d’encadrés',

  'section.textEdit': 'Texte',
  'section.tables': 'Tableaux',
  'section.html': 'HTML',
  'section.latex': 'LaTeX',
  'section.greekLetters': 'Lettres grecques',
  'section.colors': 'Couleurs',
  'section.callouts': 'Encadrés',

  'tables.upcoming': 'bientôt ...',
  'html.reportMissingTag': 'Une balise manque ? Signalez-le !',
  'latex.introduction': 'Introduction aux mathématiques en LaTeX',
  'latex.reportMissingFunction': 'Une fonction LaTeX manque ? Signalez-le !',
  'greek.lowerCase': 'Minuscules',
  'greek.upperCase': 'Majuscules',
  'greek.overview': 'Aperçu de l’alphabet grec',

  'colors.select': 'Choisir une couleur',
  'colors.save': 'Enregistrer la couleur',
  'colors.optionColor': ' Ajouter "color: {your color}"',
  'colors.optionBackgroundColor': ' Ajouter "background-color: {your color}"',
  'colors.optionStyleTag': ' Ajouter l’attribut : "style={your color}"',
  'colors.optionHtmlTag':
    ' Ajouter du HTML : "<font color={your color}>{selected text}</font>"',
  'colors.lastUsed': 'Couleurs récentes :',
  'colors.saved': 'Couleurs enregistrées :',
  'colors.editInSettings':
    'Les couleurs enregistrées se modifient directement dans les paramètres.',
  'colors.help': 'Besoin d’aide ?',
  'colors.copied': 'Couleur {color} copiée dans le presse-papiers',
  'colors.copyFailed':
    'Impossible de copier la couleur dans le presse-papiers',

  'settings.title': 'Paramètres de Markdown Formatting Assistant',
  'settings.language.name': 'Langue',
  'settings.language.desc':
    'Langue de l’interface du plugin. (redémarrage requis)',
  'settings.language.auto': 'Comme Obsidian',
  'settings.triggerChar.name': 'Caractère déclencheur',
  'settings.triggerChar.desc': 'Caractère qui déclenche l’autocomplétion',
  'settings.triggerChar.placeholder':
    'Saisissez un caractère pour déclencher l’autocomplétion',
  'settings.sidePaneSide.name': 'Côté du volet latéral',
  'settings.sidePaneSide.desc':
    'Choisissez de quel côté apparaît le volet latéral.',
  'settings.sidePaneSide.placeholder': 'Saisissez left ou right',
  'settings.toggleSection.name': 'Section « {section} »',
  'settings.toggleSection.desc':
    'Activer ou désactiver la section « {section} ». (redémarrage requis)',
  'settings.savedColors.name': 'Couleurs enregistrées',
  'settings.savedColors.desc':
    'Couleurs enregistrées via le sélecteur de couleur. L’ordre est également pris en compte. Nécessite un redémarrage d’Obsidian.',
  'settings.savedColors.invalidFormat':
    'La couleur {color} à la ligne {line} a un format incorrect et ne sera pas enregistrée.',

  'callout.note': 'Note',
  'callout.info': 'Info',
  'callout.todo': 'À faire',
  'callout.abstract': 'Résumé',
  'callout.summary': 'Synthèse',
  'callout.tldr': 'En bref',
  'callout.tip': 'Astuce',
  'callout.hint': 'Indice',
  'callout.important': 'Important',
  'callout.success': 'Succès',
  'callout.check': 'Vérifié',
  'callout.done': 'Terminé',
  'callout.question': 'Question',
  'callout.help': 'Aide',
  'callout.faq': 'FAQ',
  'callout.warning': 'Avertissement',
  'callout.caution': 'Prudence',
  'callout.attention': 'Attention',
  'callout.failure': 'Échec',
  'callout.fail': 'Non validé',
  'callout.missing': 'Manquant',
  'callout.danger': 'Danger',
  'callout.error': 'Erreur',
  'callout.bug': 'Bogue',
  'callout.example': 'Exemple',
  'callout.quote': 'Citation',
};
