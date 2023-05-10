import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, Ref, ref } from 'vue'
import shortid from 'shortid'
import { useCache } from 'src/util/cache'

export interface ProjectRoot {
  id?: string
  name: string
  apiKey: string
}

interface ProjectRootCollection {
  projectRoots: ProjectRoot[]
}

export const useProjectRootStore = defineStore('projectRoots', () => {
  const projectRootCache = useCache<ProjectRootCollection>()

  const projectRoots: Ref<ProjectRootCollection> = ref({ projectRoots: [] })

  const LocalStorageKey = 'project-roots'

  function loadProjectRoots() {
    const roots = projectRootCache.loadFromCache(LocalStorageKey)

    if (roots) projectRoots.value = roots
    else projectRoots.value.projectRoots = []
  }

  function saveProjectRoot(root: ProjectRoot) {
    const existingRoot = projectRoots.value.projectRoots.find(
      (x) => x.id === root.id
    )

    if (existingRoot) {
      existingRoot.apiKey = root.apiKey
      existingRoot.name = root.name
    } else {
      root.id = shortid()
      projectRoots.value.projectRoots.push(root)
    }

    projectRootCache.saveToCache(projectRoots.value, LocalStorageKey)
  }

  function getProjectRoot(id: string) {
    return projectRoots.value.projectRoots.find((x) => x.id === id)
  }

  return {
    loadProjectRoots,
    saveProjectRoot,
    getProjectRoot,
    projectRoots: computed(() => projectRoots.value),
  }
})
