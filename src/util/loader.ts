import { ref, Ref } from 'vue'

export interface Loader {
  loading: Ref<boolean>
  load<T>(func: () => Promise<T>): Promise<T>
}
export function useLoader(): Loader {
  const loading = ref(false)
  async function load<T>(func: () => Promise<T>): Promise<T> {
    loading.value = true
    const result = await func()
    loading.value = false
    return result
  }

  return { load, loading }
}
