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
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

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
  const primaryColorCookie = useCookie<string>(PRIMARY_COLOR_STORAGE_KEY, {
    maxAge: ONE_YEAR_SECONDS,
    path: '/',
    sameSite: 'lax'
  })

  function normalizePrimaryColor(value: string | null) {
    return primaryColors.some(color => color.value === value) ? value as string : DEFAULT_PRIMARY_COLOR
  }

  const current = useState<string>('primary-color', () => normalizePrimaryColor(primaryColorCookie.value))

  function setPrimaryColor(value: string | null) {
    const primary = normalizePrimaryColor(value)

    current.value = primary
    primaryColorCookie.value = primary

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

  setPrimaryColor(current.value)

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
