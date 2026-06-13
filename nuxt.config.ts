// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },
  app: {
    head: {
      script: [
        {
          innerHTML: `(() => {
  const key = 'thang-long-primary-color'
  const colors = {
    red: ['oklch(97.1% 0.013 17.38)', 'oklch(93.6% 0.032 17.717)', 'oklch(88.5% 0.062 18.334)', 'oklch(80.8% 0.114 19.571)', 'oklch(70.4% 0.191 22.216)', 'oklch(63.7% 0.237 25.331)', 'oklch(57.7% 0.245 27.325)', 'oklch(50.5% 0.213 27.518)', 'oklch(44.4% 0.177 26.899)', 'oklch(39.6% 0.141 25.723)', 'oklch(25.8% 0.092 26.042)'],
    orange: ['oklch(98% 0.016 73.684)', 'oklch(95.4% 0.038 75.164)', 'oklch(90.1% 0.076 70.697)', 'oklch(83.7% 0.128 66.29)', 'oklch(75% 0.183 55.934)', 'oklch(70.5% 0.213 47.604)', 'oklch(64.6% 0.222 41.116)', 'oklch(55.3% 0.195 38.402)', 'oklch(47% 0.157 37.304)', 'oklch(40.8% 0.123 38.172)', 'oklch(26.6% 0.079 36.259)'],
    amber: ['oklch(98.7% 0.022 95.277)', 'oklch(96.2% 0.059 95.617)', 'oklch(92.4% 0.12 95.746)', 'oklch(87.9% 0.169 91.605)', 'oklch(82.8% 0.189 84.429)', 'oklch(76.9% 0.188 70.08)', 'oklch(66.6% 0.179 58.318)', 'oklch(55.5% 0.163 48.998)', 'oklch(47.3% 0.137 46.201)', 'oklch(41.4% 0.112 45.904)', 'oklch(27.9% 0.077 45.635)'],
    green: ['oklch(98.2% 0.018 155.826)', 'oklch(96.2% 0.044 156.743)', 'oklch(92.5% 0.084 155.995)', 'oklch(87.1% 0.15 154.449)', 'oklch(79.2% 0.209 151.711)', 'oklch(72.3% 0.219 149.579)', 'oklch(62.7% 0.194 149.214)', 'oklch(52.7% 0.154 150.069)', 'oklch(44.8% 0.119 151.328)', 'oklch(39.3% 0.095 152.535)', 'oklch(26.6% 0.065 152.934)'],
    blue: ['oklch(97% 0.014 254.604)', 'oklch(93.2% 0.032 255.585)', 'oklch(88.2% 0.059 254.128)', 'oklch(80.9% 0.105 251.813)', 'oklch(70.7% 0.165 254.624)', 'oklch(62.3% 0.214 259.815)', 'oklch(54.6% 0.245 262.881)', 'oklch(48.8% 0.243 264.376)', 'oklch(42.4% 0.199 265.638)', 'oklch(37.9% 0.146 265.522)', 'oklch(28.2% 0.091 267.935)'],
    violet: ['oklch(96.9% 0.016 293.756)', 'oklch(94.3% 0.029 294.588)', 'oklch(89.4% 0.057 293.283)', 'oklch(81.1% 0.111 293.571)', 'oklch(70.2% 0.183 293.541)', 'oklch(60.6% 0.25 292.717)', 'oklch(54.1% 0.281 293.009)', 'oklch(49.1% 0.27 292.581)', 'oklch(43.2% 0.232 292.759)', 'oklch(38% 0.189 293.745)', 'oklch(28.3% 0.141 291.089)'],
    pink: ['oklch(97.1% 0.014 343.198)', 'oklch(94.8% 0.028 342.258)', 'oklch(89.9% 0.061 343.231)', 'oklch(82.3% 0.12 346.018)', 'oklch(71.8% 0.202 349.761)', 'oklch(65.6% 0.241 354.308)', 'oklch(59.2% 0.249 0.584)', 'oklch(52.5% 0.223 3.958)', 'oklch(45.9% 0.187 3.815)', 'oklch(40.8% 0.153 2.432)', 'oklch(28.4% 0.109 3.907)']
  }
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
  const color = localStorage.getItem(key)
  if (!colors[color]) return
  const style = document.createElement('style')
  style.id = 'thang-long-primary-color'
  style.textContent = ':root{' + shades.map((shade, index) => '--ui-color-primary-' + shade + ':var(--color-' + color + '-' + shade + ',' + colors[color][index] + ')').join(';') + '}'
  document.head.appendChild(style)
})()`,
          tagPosition: 'head',
          tagPriority: -10
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
    classPrefix: '',
    classSuffix: '',
    disableTransition: true,
    dataValue: '',
    globalName: 'colorMode',
    componentName: 'ColorScheme',
    storage: 'localStorage'
  },

  runtimeConfig: {
    public: {
      seasonApiBase: '/api/season-guide'
    },
    seasonGuideSource:
      'https://script.google.com/macros/s/AKfycbz7D3W8Ut7iUCmVq-Ob-lu5__IixQI2P4d6IkJkwvXkPQATVB02BHH9tEsJlISebg0rqg/exec'
  },

  routeRules: {
    '/': { swr: 300 },
    '/api/season-guide': { swr: 300 }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
