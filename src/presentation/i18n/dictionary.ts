import type { Locale } from '@domain/shared/Locale'
import type { DurationLabels } from '../lib/format'

/**
 * UI chrome only.
 *
 * Content — chapters, the CV, project copy — is localised by the content
 * adapters, not here. This dictionary covers the words the interface itself
 * needs: labels, buttons, states. Keeping the two apart means adding a
 * language never means editing a component.
 */
export interface UiStrings {
  readonly skipToContent: string
  readonly siteRole: string
  readonly localeSwitchLabel: string
  readonly switchTo: string
  readonly scrollHint: string
  readonly present: string
  readonly featured: string
  readonly repository: string
  readonly setupLayers: Readonly<Record<string, string>>
  readonly viewCode: string
  readonly viewDemo: string
  readonly builtWith: string
  readonly inProgress: string
  readonly experienceLabel: string
  readonly duration: DurationLabels
  readonly proficiency: Readonly<Record<'core' | 'working' | 'familiar', string>>
  readonly skillCategory: Readonly<
    Record<'language' | 'database' | 'framework' | 'devops' | 'tool' | 'methodology', string>
  >
  readonly workMode: Readonly<Record<'onsite' | 'remote' | 'hybrid', string>>
  readonly languagesHeading: string
  readonly certificationsHeading: string
  readonly footerNote: string
  readonly motionDisabled: string
  readonly graphLabel: string
  readonly opensInNewTab: string
}

const es: UiStrings = {
  skipToContent: 'Saltar al contenido',
  siteRole: 'Portafolio personal',
  localeSwitchLabel: 'Cambiar idioma',
  switchTo: 'English',
  scrollHint: 'Desplazá para recorrer la red',
  present: 'Actualidad',
  featured: 'Destacado',
  repository: 'Repositorio',
  setupLayers: {
    distro: 'Sistema',
    shell: 'Shell',
    multiplexer: 'Multiplexor',
    editor: 'Editor',
    tooling: 'Herramientas',
    theme: 'Tema',
  },
  viewCode: 'Ver código',
  viewDemo: 'Ver demo',
  builtWith: 'Construido con',
  inProgress: 'En curso',
  experienceLabel: 'de experiencia profesional',
  duration: {
    year: { one: 'año', other: 'años' },
    month: { one: 'mes', other: 'meses' },
  },
  proficiency: {
    core: 'Uso diario',
    working: 'Con soltura',
    familiar: 'Conozco',
  },
  skillCategory: {
    language: 'Lenguajes',
    database: 'Bases de datos',
    framework: 'Frameworks',
    devops: 'Sistemas y DevOps',
    tool: 'Herramientas',
    methodology: 'Metodologías',
  },
  workMode: {
    onsite: 'Presencial',
    remote: 'Remoto',
    hybrid: 'Híbrido',
  },
  languagesHeading: 'Idiomas',
  certificationsHeading: 'Formación complementaria',
  footerNote: 'Construido con React, Three.js y una arquitectura hexagonal.',
  motionDisabled: 'Animación reducida por preferencia del sistema.',
  graphLabel: 'Visualización decorativa de la red de trayectoria',
  opensInNewTab: '(abre en una pestaña nueva)',
}

const en: UiStrings = {
  skipToContent: 'Skip to content',
  siteRole: 'Personal portfolio',
  localeSwitchLabel: 'Change language',
  switchTo: 'Español',
  scrollHint: 'Scroll to travel the network',
  present: 'Present',
  featured: 'Featured',
  repository: 'Repository',
  setupLayers: {
    distro: 'System',
    shell: 'Shell',
    multiplexer: 'Multiplexer',
    editor: 'Editor',
    tooling: 'Tooling',
    theme: 'Theme',
  },
  viewCode: 'View code',
  viewDemo: 'View demo',
  builtWith: 'Built with',
  inProgress: 'In progress',
  experienceLabel: 'of professional experience',
  duration: {
    year: { one: 'year', other: 'years' },
    month: { one: 'month', other: 'months' },
  },
  proficiency: {
    core: 'Daily driver',
    working: 'Comfortable',
    familiar: 'Familiar',
  },
  skillCategory: {
    language: 'Languages',
    database: 'Databases',
    framework: 'Frameworks',
    devops: 'Systems & DevOps',
    tool: 'Tools',
    methodology: 'Methodologies',
  },
  workMode: {
    onsite: 'On site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  },
  languagesHeading: 'Languages',
  certificationsHeading: 'Additional training',
  footerNote: 'Built with React, Three.js and a hexagonal architecture.',
  motionDisabled: 'Motion reduced to match your system preference.',
  graphLabel: 'Decorative visualisation of the career network',
  opensInNewTab: '(opens in a new tab)',
}

export const DICTIONARY: Readonly<Record<Locale, UiStrings>> = { es, en }
