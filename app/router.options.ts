import type { RouterConfig } from '@nuxt/schema'

function seasonSlug(path: string) {
  const [, section, slug] = path.split('/')

  return section === 'seasons' ? slug : ''
}

export default {
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    const toSeason = seasonSlug(to.path)
    const fromSeason = seasonSlug(from.path)

    if (toSeason && toSeason === fromSeason) {
      return false
    }

    return { left: 0, top: 0 }
  }
} satisfies RouterConfig
