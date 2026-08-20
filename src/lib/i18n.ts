export type Lang = 'en' | 'es'

export interface Dictionary {
  addService: string
  overview: string
  settings: string
  deployments: string
  envVars: string
  deploy: string
  cancel: string
  enabledLabel: string
  disabledLabel: string
  enableService: string
  disableService: string
  blockedNote: string
  confirmDisablePrefix: string
  confirmDisableWarning: string
  keepRunning: string
  noDeploys: string
  emptyTitle: string
  emptySub: string
  servicesFooter: string
  createService: string
  name: string
  type: string
  port: string
  optional: string
  addServiceChooserTitle: string
  manualConfig: string
  manualConfigDesc: string
  importFromGithub: string
  importFromGithubDesc: string
}

export const EN: Dictionary = {
  addService: 'Add service',
  overview: 'Overview',
  settings: 'Settings',
  deployments: 'Deployments',
  envVars: 'Environment variables',
  deploy: 'Deploy',
  cancel: 'Cancel',
  enabledLabel: 'Enabled',
  disabledLabel: 'Disabled',
  enableService: 'Enable service',
  disableService: 'Disable service',
  blockedNote: 'new deployments are blocked while disabled',
  confirmDisablePrefix: 'Disable',
  confirmDisableWarning: 'This will stop the service and its current deployment.',
  keepRunning: 'Keep running',
  noDeploys: 'no deployments yet',
  emptyTitle: 'No services in this project',
  emptySub: 'add a web, worker, cron or static service',
  servicesFooter: 'services · drag to arrange',
  createService: 'Create service',
  name: 'Name',
  type: 'Type',
  port: 'Port',
  optional: '— optional',
  addServiceChooserTitle: 'How do you want to add a service?',
  manualConfig: 'Manual configuration',
  manualConfigDesc: 'Define name, type and port yourself',
  importFromGithub: 'Import from GitHub',
  importFromGithubDesc: 'Pick a repo — services are detected from mitto.yaml',
}

export const ES: Dictionary = {
  addService: 'Agregar servicio',
  overview: 'Resumen',
  settings: 'Configuración',
  deployments: 'Despliegues',
  envVars: 'Variables de entorno',
  deploy: 'Deploy',
  cancel: 'Cancelar',
  enabledLabel: 'Habilitado',
  disabledLabel: 'Deshabilitado',
  enableService: 'Habilitar servicio',
  disableService: 'Deshabilitar servicio',
  blockedNote: 'los nuevos deployments quedan bloqueados mientras esté deshabilitado',
  confirmDisablePrefix: 'Deshabilitar',
  confirmDisableWarning: 'Esto detendrá el servicio y el despliegue en curso.',
  keepRunning: 'Mantener activo',
  noDeploys: 'sin deployments todavía',
  emptyTitle: 'No hay servicios en este proyecto',
  emptySub: 'agregá un servicio web, worker, cron o static',
  servicesFooter: 'servicios · arrastrá para ordenar',
  createService: 'Crear servicio',
  name: 'Nombre',
  type: 'Tipo',
  port: 'Puerto',
  optional: '— opcional',
  addServiceChooserTitle: '¿Cómo querés agregar el servicio?',
  manualConfig: 'Configuración manual',
  manualConfigDesc: 'Definí nombre, tipo y puerto vos mismo',
  importFromGithub: 'Importar desde GitHub',
  importFromGithubDesc: 'Elegí un repo — los servicios se detectan desde mitto.yaml',
}

export const DICTIONARIES: Record<Lang, Dictionary> = { en: EN, es: ES }

const LANG_KEY = 'mitto_lang'

export function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  return window.localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en'
}

export function storeLang(lang: Lang): void {
  window.localStorage.setItem(LANG_KEY, lang)
}
