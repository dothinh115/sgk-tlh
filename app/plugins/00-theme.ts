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
  const current = useState<string>('primary-color', () => DEFAULT_PRIMARY_COLOR)

  function normalizePrimaryColor(value: string | null) {
    return primaryColors.some(color => color.value === value) ? value as string : DEFAULT_PRIMARY_COLOR
  }

  function setPrimaryColor(value: string | null) {
    const primary = normalizePrimaryColor(value)

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

declare module '#app' {
  interface NuxtApp {
    $primaryColor: PrimaryColorService
  }
}
