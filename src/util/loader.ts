import { computed, ref, Ref } from 'vue'

export interface LoadFailure {
  id: string
  description: string
}

export interface Loader {
  loading: Ref<boolean>
  loaded: Ref<boolean>
  load<T>(func: () => Promise<T>): Promise<T | null>
  failure: Ref<LoadFailure | null>
}
export function useLoader(): Loader {
  const loading = computed(() => inProgress.value !== 0)
  const loaded = ref(false)

  const inProgress = ref(0)

  const failure: Ref<LoadFailure | null> = ref(null)

  async function load<T>(func: () => Promise<T>): Promise<T | null> {
    inProgress.value++
    try {
      const result = await func()
      failure.value = null
      return result
    } catch (error) {
      failure.value = error?.description || JSON.stringify(error)
      throw error
    } finally {
      inProgress.value--
      loaded.value = true
    }
  }

  return { load, loading, loaded, failure }
}
