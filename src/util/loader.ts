import { ref, Ref } from 'vue'

export interface Loader {
  loading: Ref<boolean>
  loaded: Ref<boolean>
  load<T>(func: () => Promise<T>): Promise<T>
}
export function useLoader(): Loader {
  const loading = ref(false)
  const loaded = ref(false)
  async function load<T>(func: () => Promise<T>): Promise<T> {
    loading.value = true
    const result = await func()
    loading.value = false
    loaded.value = true
    return result
  }

  return { load, loading, loaded }
}
