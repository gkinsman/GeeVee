import { computed, ref, Ref } from 'vue'

export interface Loader {
  loading: Ref<boolean>
  loaded: Ref<boolean>
  load<T>(func: () => Promise<T>): Promise<T | null>
  failure: Ref<string>
}
export function useLoader(): Loader {
  const loading = computed(() => inProgress.value !== 0)
  const loaded = ref(false)

  const inProgress = ref(0)

  const failure = ref('')

  async function load<T>(func: () => Promise<T>): Promise<T | null> {
    inProgress.value++
    try {
      const result = await func()
      failure.value = ''
      return result
    } catch (error) {
      failure.value = error.description
      return null
    } finally {
      inProgress.value--
      loaded.value = true
    }
  }

  return { load, loading, loaded, failure }
}
