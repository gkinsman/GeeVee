import { defineStore } from 'pinia'
import { computed, Ref, ref } from 'vue'
import { useCache } from 'src/util/cache'
import shortid from 'shortid'

export interface ProjectRoot {
  id: string
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

  const saveToCache = () =>
    projectRootCache.saveToCache(projectRoots.value, LocalStorageKey)
  const loadFromCache = () => projectRootCache.loadFromCache(LocalStorageKey)

  function loadProjectRoots() {
    const roots = loadFromCache()

    if (roots) projectRoots.value = roots
    else projectRoots.value.projectRoots = []
  }

  function deleteProjectRoot(root: ProjectRoot): string {
    let roots = projectRoots.value.projectRoots

    const position: number = roots.findIndex((x) => x.id === root.id)
    projectRoots.value.projectRoots = roots.filter((x) => x.id !== root.id)
    saveToCache()

    roots = projectRoots.value.projectRoots
    return roots[position - 1]?.id || roots[position]?.id || roots[0]?.id || ''
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

    saveToCache()
  }

  function getProjectRoot(id?: string) {
    return projectRoots.value.projectRoots.find((x) => x.id === id)
  }

  return {
    loadProjectRoots,
    saveProjectRoot,
    getProjectRoot,
    deleteProjectRoot,
    projectRoots: computed(() => projectRoots.value),
  }
})
