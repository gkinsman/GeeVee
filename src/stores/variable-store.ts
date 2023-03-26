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

  const loader = useLoader()

  async function getInheritedVariables(
    groupId: number,
    type: 'project' | 'group'
  ): Promise<void> {
    const { findNode, getNodeWithParents } = useGroupStore()
    const nodeId = `${type}-${groupId}`
    const node = findNode(nodeId)
    if (!node) throw new Error(`Node with id ${nodeId} not found`)
    const groups = getNodeWithParents(node!)

    const variableLoads = groups.map((g) =>
      g.loader.load(() => getVariables(g))
    )

    await Promise.all(variableLoads)
  }

  async function getVariables(node: GroupTreeNode) {
    if (node.type === 'project') {
      await getProjectVariables(node.id!)
    } else {
      await getGroupVariables(node.id!)
    }

    node.loadedVariables = true
  }

  async function getGroupVariables(groupId: number): Promise<VariableSchema[]> {
    if (groupVariables.value[groupId]) return projectVariables.value[groupId]

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
    getGroupVariables,
    getProjectVariables,
    getInheritedVariables,
  }
})
