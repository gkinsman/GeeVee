import { computed, ComputedRef, reactive } from 'vue'

export interface LoadFailure {
  id: string
  description: string
}

export interface Loader {
  loading: ComputedRef<boolean>
  loaded: ComputedRef<boolean>
  failure: ComputedRef<LoadFailure | null>
  load<T>(func: () => Promise<T>): Promise<T | null>
}
export function useLoader(): Loader {
  const state = reactive({
    loaded: false,
    inProgress: 0,
    failure: null,
  })

  const loading = computed(() => state.inProgress !== 0)
  const loaded = computed(() => state.loaded)
  const failure = computed(() => state.failure)

  async function load<T>(func: () => Promise<T>): Promise<T | null> {
    state.inProgress++
    try {
      const result = await func()
      state.failure = null
      return result
    } catch (error) {
      state.failure = error?.description || JSON.stringify(error)
      throw error
    } finally {
      state.inProgress--
      state.loaded = true
    }
  }

  return { load, loading, loaded, failure }
}
