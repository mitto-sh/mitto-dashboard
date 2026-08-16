export type Lang = 'en' | 'es'

export interface Dictionary {
  addService: string
  deployments: string
  envVars: string
  deploy: string
  cancel: string
  deleteService: string
  noDeploys: string
  emptyTitle: string
  emptySub: string
  servicesFooter: string
  createService: string
  name: string
  type: string
  port: string
  optional: string
}

export const EN: Dictionary = {
  addService: 'Add service',
  deployments: 'Deployments',
  envVars: 'Environment variables',
  deploy: 'Deploy',
  cancel: 'Cancel',
  deleteService: 'Delete service',
  noDeploys: 'no deployments yet',
  emptyTitle: 'No services in this project',
  emptySub: 'add a web, worker, cron or static service',
  servicesFooter: 'services · drag to arrange',
  createService: 'Create service',
  name: 'Name',
  type: 'Type',
  port: 'Port',
  optional: '— optional',
}

export const ES: Dictionary = {
  addService: 'Agregar servicio',
  deployments: 'Despliegues',
  envVars: 'Variables de entorno',
  deploy: 'Deploy',
  cancel: 'Cancelar',
  deleteService: 'Eliminar servicio',
  noDeploys: 'sin deployments todavía',
  emptyTitle: 'No hay servicios en este proyecto',
  emptySub: 'agregá un servicio web, worker, cron o static',
  servicesFooter: 'servicios · arrastrá para ordenar',
  createService: 'Crear servicio',
  name: 'Nombre',
  type: 'Tipo',
  port: 'Puerto',
  optional: '— opcional',
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
