interface PrimaryColorOption {
  label: string
  value: string
  class: string
}

interface PrimaryColorService {
  colors: PrimaryColorOption[]
  current: Ref<string>
  set: (value: string | null) => void
}

const PRIMARY_COLOR_STORAGE_KEY = 'thang-long-primary-color'
const DEFAULT_PRIMARY_COLOR = 'red'
const PRIMARY_OVERRIDE_STYLE_ID = 'thang-long-primary-color'
const PRIMARY_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const primaryColors: PrimaryColorOption[] = [
  { label: 'Đỏ', value: 'red', class: 'bg-red-500' },
  { label: 'Cam', value: 'orange', class: 'bg-orange-500' },
  { label: 'Vàng', value: 'amber', class: 'bg-amber-500' },
  { label: 'Lục', value: 'green', class: 'bg-green-500' },
  { label: 'Lam', value: 'blue', class: 'bg-blue-500' },
  { label: 'Tím', value: 'violet', class: 'bg-violet-500' },
  { label: 'Hồng', value: 'pink', class: 'bg-pink-500' }
]

export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const current = useState<string>('primary-color', () => DEFAULT_PRIMARY_COLOR)

  function normalizePrimaryColor(value: string | null) {
    return primaryColors.some(color => color.value === value) ? value as string : DEFAULT_PRIMARY_COLOR
  }

  function setPrimaryColor(value: string | null) {
    const primary = normalizePrimaryColor(value)

    current.value = primary
    appConfig.ui.colors.primary = primary

    if (import.meta.client) {
      localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, primary)
      updatePrimaryOverrideStyle(primary)
    }
  }

  setPrimaryColor(import.meta.client ? localStorage.getItem(PRIMARY_COLOR_STORAGE_KEY) : DEFAULT_PRIMARY_COLOR)

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

function updatePrimaryOverrideStyle(primary: string) {
  let style = document.getElementById(PRIMARY_OVERRIDE_STYLE_ID)

  if (!style) {
    style = document.createElement('style')
    style.id = PRIMARY_OVERRIDE_STYLE_ID
    document.head.appendChild(style)
  }

  style.textContent = `:root{${PRIMARY_SHADES.map(shade => `--ui-color-primary-${shade}:var(--color-${primary}-${shade})`).join(';')}}`
}

declare module '#app' {
  interface NuxtApp {
    $primaryColor: PrimaryColorService
  }
}
