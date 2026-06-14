import {
  DEFAULT_PRIMARY_COLOR,
  getPrimaryColorStyle,
  isPrimaryColor,
  primaryColors,
  PRIMARY_COLOR_STORAGE_KEY,
  type PrimaryColorValue
} from '~/utils/primary-colors'

interface PrimaryColorOption {
  label: string
  value: PrimaryColorValue
  class: string
}

interface PrimaryColorService {
  colors: readonly PrimaryColorOption[]
  current: Ref<string>
  set: (value: string | null) => void
}

export default defineNuxtPlugin(() => {
  function initialPrimaryColor() {
    if (import.meta.client) {
      const storedColor = localStorage.getItem(PRIMARY_COLOR_STORAGE_KEY)

      if (isPrimaryColor(storedColor)) {
        return storedColor
      }
    }

    return DEFAULT_PRIMARY_COLOR
  }

  const current = useState<PrimaryColorValue>('primary-color', initialPrimaryColor)

  function syncPrimaryColorStyle(primary: PrimaryColorValue) {
    let element = document.getElementById('tlh-primary-color-preflight')

    if (!element) {
      element = document.createElement('style')
      element.id = 'tlh-primary-color-preflight'
      document.head.appendChild(element)
    }

    element.textContent = getPrimaryColorStyle(primary)
  }

  function setPrimaryColor(value: string | null) {
    const primary = isPrimaryColor(value) ? value : DEFAULT_PRIMARY_COLOR

    current.value = primary

    updateAppConfig({
      ui: {
        colors: {
          primary
        }
      }
    })

    if (import.meta.client) {
      localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, primary)
      syncPrimaryColorStyle(primary)
    }
  }

  setPrimaryColor(initialPrimaryColor())

  return {
    provide: {
      primaryColor: {
        colors: primaryColors,
        current,
        set: setPrimaryColor
      } satisfies PrimaryColorService
    }
  }
})

declare module '#app' {
  interface NuxtApp {
    $primaryColor: PrimaryColorService
  }
}
