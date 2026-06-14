export const PRIMARY_COLOR_STORAGE_KEY = 'thang-long-primary-color'
export const DEFAULT_PRIMARY_COLOR = 'red'

const primaryColorShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

const primaryColorFallbacks = {
  red: {
    50: 'oklch(97.1% 0.013 17.38)',
    100: 'oklch(93.6% 0.032 17.717)',
    200: 'oklch(88.5% 0.062 18.334)',
    300: 'oklch(80.8% 0.114 19.571)',
    400: 'oklch(70.4% 0.191 22.216)',
    500: 'oklch(63.7% 0.237 25.331)',
    600: 'oklch(57.7% 0.245 27.325)',
    700: 'oklch(50.5% 0.213 27.518)',
    800: 'oklch(44.4% 0.177 26.899)',
    900: 'oklch(39.6% 0.141 25.723)',
    950: 'oklch(25.8% 0.092 26.042)'
  },
  orange: {
    50: 'oklch(98% 0.016 73.684)',
    100: 'oklch(95.4% 0.038 75.164)',
    200: 'oklch(90.1% 0.076 70.697)',
    300: 'oklch(83.7% 0.128 66.29)',
    400: 'oklch(75% 0.183 55.934)',
    500: 'oklch(70.5% 0.213 47.604)',
    600: 'oklch(64.6% 0.222 41.116)',
    700: 'oklch(55.3% 0.195 38.402)',
    800: 'oklch(47% 0.157 37.304)',
    900: 'oklch(40.8% 0.123 38.172)',
    950: 'oklch(26.6% 0.079 36.259)'
  },
  amber: {
    50: 'oklch(98.7% 0.022 95.277)',
    100: 'oklch(96.2% 0.059 95.617)',
    200: 'oklch(92.4% 0.12 95.746)',
    300: 'oklch(87.9% 0.169 91.605)',
    400: 'oklch(82.8% 0.189 84.429)',
    500: 'oklch(76.9% 0.188 70.08)',
    600: 'oklch(66.6% 0.179 58.318)',
    700: 'oklch(55.5% 0.163 48.998)',
    800: 'oklch(47.3% 0.137 46.201)',
    900: 'oklch(41.4% 0.112 45.904)',
    950: 'oklch(27.9% 0.077 45.635)'
  },
  green: {
    50: 'oklch(98.2% 0.018 155.826)',
    100: 'oklch(96.2% 0.044 156.743)',
    200: 'oklch(92.5% 0.084 155.995)',
    300: 'oklch(87.1% 0.15 154.449)',
    400: 'oklch(79.2% 0.209 151.711)',
    500: 'oklch(72.3% 0.219 149.579)',
    600: 'oklch(62.7% 0.194 149.214)',
    700: 'oklch(52.7% 0.154 150.069)',
    800: 'oklch(44.8% 0.119 151.328)',
    900: 'oklch(39.3% 0.095 152.535)',
    950: 'oklch(26.6% 0.065 152.934)'
  },
  blue: {
    50: 'oklch(97% 0.014 254.604)',
    100: 'oklch(93.2% 0.032 255.585)',
    200: 'oklch(88.2% 0.059 254.128)',
    300: 'oklch(80.9% 0.105 251.813)',
    400: 'oklch(70.7% 0.165 254.624)',
    500: 'oklch(62.3% 0.214 259.815)',
    600: 'oklch(54.6% 0.245 262.881)',
    700: 'oklch(48.8% 0.243 264.376)',
    800: 'oklch(42.4% 0.199 265.638)',
    900: 'oklch(37.9% 0.146 265.522)',
    950: 'oklch(28.2% 0.091 267.935)'
  },
  violet: {
    50: 'oklch(96.9% 0.016 293.756)',
    100: 'oklch(94.3% 0.029 294.588)',
    200: 'oklch(89.4% 0.057 293.283)',
    300: 'oklch(81.1% 0.111 293.571)',
    400: 'oklch(70.2% 0.183 293.541)',
    500: 'oklch(60.6% 0.25 292.717)',
    600: 'oklch(54.1% 0.281 293.009)',
    700: 'oklch(49.1% 0.27 292.581)',
    800: 'oklch(43.2% 0.232 292.759)',
    900: 'oklch(38% 0.189 293.745)',
    950: 'oklch(28.3% 0.141 291.089)'
  },
  pink: {
    50: 'oklch(97.1% 0.014 343.198)',
    100: 'oklch(94.8% 0.028 342.258)',
    200: 'oklch(89.9% 0.061 343.231)',
    300: 'oklch(82.3% 0.12 346.018)',
    400: 'oklch(71.8% 0.202 349.761)',
    500: 'oklch(65.6% 0.241 354.308)',
    600: 'oklch(59.2% 0.249 0.584)',
    700: 'oklch(52.5% 0.223 3.958)',
    800: 'oklch(45.9% 0.187 3.815)',
    900: 'oklch(40.8% 0.153 2.432)',
    950: 'oklch(28.4% 0.109 3.907)'
  }
} as const

export const primaryColors = [
  { label: 'Đỏ', value: 'red', class: 'bg-red-500' },
  { label: 'Cam', value: 'orange', class: 'bg-orange-500' },
  { label: 'Vàng', value: 'amber', class: 'bg-amber-500' },
  { label: 'Lục', value: 'green', class: 'bg-green-500' },
  { label: 'Lam', value: 'blue', class: 'bg-blue-500' },
  { label: 'Tím', value: 'violet', class: 'bg-violet-500' },
  { label: 'Hồng', value: 'pink', class: 'bg-pink-500' }
] as const

export type PrimaryColorValue = keyof typeof primaryColorFallbacks

export function isPrimaryColor(value: string | null | undefined): value is PrimaryColorValue {
  return Boolean(value && value in primaryColorFallbacks)
}

export function getPrimaryColorStyle(primary: PrimaryColorValue) {
  const fallbacks = primaryColorFallbacks[primary]

  return `:root{${primaryColorShades.map(shade => `--ui-color-primary-${shade}:var(--color-${primary}-${shade},${fallbacks[shade]})`).join(';')}}`
}

export function getPrimaryColorPreflightScript() {
  const colors = JSON.stringify(primaryColors.map(color => color.value))
  const fallbacks = JSON.stringify(primaryColorFallbacks)
  const shades = JSON.stringify(primaryColorShades)

  return `try{var c=localStorage.getItem('${PRIMARY_COLOR_STORAGE_KEY}');var p=${fallbacks};var s=${shades};if(${colors}.includes(c)){var e=document.createElement('style');e.id='tlh-primary-color-preflight';e.textContent=':root{'+s.map(function(x){return '--ui-color-primary-'+x+':var(--color-'+c+'-'+x+','+p[c][x]+')'}).join(';')+'}';document.head.appendChild(e)}}catch(e){}`
}
