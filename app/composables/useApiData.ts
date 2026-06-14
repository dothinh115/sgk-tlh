import type { MaybeRefOrGetter, WatchSource } from 'vue'

export function useApiData<T>(
  url: string,
  options: {
    key: MaybeRefOrGetter<string>
    query?: MaybeRefOrGetter<Record<string, unknown> | undefined>
    watch?: WatchSource<unknown>[]
  }
) {
  const nuxtApp = useNuxtApp()

  return useFetch<T>(url, {
    key: options.key,
    query: options.query,
    watch: options.watch,
    getCachedData(cacheKey) {
      return nuxtApp.payload.data[cacheKey] ?? nuxtApp.static.data[cacheKey]
    }
  })
}
