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

    return afterPageFinish(to.hash ? { el: to.hash, top: 0 } : { left: 0, top: 0 })
  }
} satisfies RouterConfig

function afterPageFinish(
  position: { left: number, top: number } | { el: string, top: number }
) {
  return new Promise<typeof position>((resolve) => {
    window.requestAnimationFrame(() => resolve(position))
  })
}
