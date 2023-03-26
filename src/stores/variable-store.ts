import { defineStore } from 'pinia'
import { computed, Ref, ref } from 'vue'
import { useGitlab } from 'src/api/gitlab'
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { useLoader } from 'src/util/loader'
import { useGroupStore } from 'stores/group-store'
import { GroupTreeNode } from 'stores/group-tree-node'

export interface NodeAndInheritedVariables {
  node: VariableSchema[]
  inherited: { [key: string]: VariableSchema[] }
}

export const useVariableStore = defineStore('variables', () => {
  const projectVariables: Ref<{ [key: number]: VariableSchema[] }> = ref({})
  const groupVariables: Ref<{ [key: number]: VariableSchema[] }> = ref({})

  const variables: Ref<{ [key: string]: VariableSchema[] }> = ref({})

  const loader = useLoader()

  async function getInheritedVariables(node: GroupTreeNode): Promise<void> {
    const { getNodeWithParents } = useGroupStore()
    const groups = getNodeWithParents(node)

    const variableLoads = groups.map((g) =>
      g.loader.load(() => getVariables(g))
    )

    await Promise.all(variableLoads)
  }

  async function getVariables(node: GroupTreeNode) {
    let results = []
    if (node.type === 'project') {
      results = await getProjectVariables(node.projectInfo!.id)
    } else {
      results = await getGroupVariables(node.groupInfo!.id)
    }
    node.loadedVariables = true

    return results
  }

  async function getGroupVariables(groupId: number): Promise<VariableSchema[]> {
    if (groupVariables.value[groupId]) return groupVariables.value[groupId]

    const { loadGroupVariables } = useGitlab()
    const loadedVariables = await loadGroupVariables(groupId)
    groupVariables.value[groupId] = loadedVariables
    return loadedVariables
  }

  async function getProjectVariables(
    projectId: number
  ): Promise<VariableSchema[]> {
    if (projectVariables.value[projectId])
      return projectVariables.value[projectId]

    const { loadProjectVariables } = useGitlab()
    const loadedVariables = await loadProjectVariables(projectId)
    projectVariables.value[projectId] = loadedVariables
    return loadedVariables
  }

  return {
    loading: computed(() => loader.loading),
    getInheritedVariables,
    getVariables,
  }
})
