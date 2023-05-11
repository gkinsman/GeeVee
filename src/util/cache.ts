export const useCache = function <T>(
  keySelector: ((item: T) => string) | null = null
) {
  async function loadOrSave(key: string, loader: () => Promise<T>): Promise<T> {
    const fromCache = loadFromCache(key)
    if (fromCache) return fromCache

    const fresh = await loader()
    saveToCache(fresh, key)
    return fresh
  }

  function loadFromCache(key: string): T | null {
    const json = localStorage.getItem(key)
    if (!json) return null
    return JSON.parse(json) as T
  }

  function exists(key: string): boolean {
    return !!localStorage.getItem(key)
  }

  function saveToCache(item: T, key: string | null = null): void {
    const actualKey = key || keySelector?.(item)
    if (!actualKey)
      throw new Error('Must provide either a key function or a key')

    const json = JSON.stringify(item)
    localStorage.setItem(actualKey, json)
  }

  return { loadFromCache, saveToCache, loadOrSave, exists }
}
