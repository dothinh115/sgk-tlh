const isDevelopment = import.meta.dev

const routeRules = isDevelopment
  ? {}
  : {
      '/': { swr: 30 },
      '/api/season-guide': { swr: 30 },
      '/api/season-guide/*': { swr: 30 }
    }

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
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

  routeRules,

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
