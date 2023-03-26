import { defineStore } from 'pinia'
import { computed, Ref, ref } from 'vue'
import { useGitlab } from 'src/api/gitlab'
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { useLoader } from 'src/util/loader'
import { useGroupStore } from 'stores/group-store'
import { GroupTreeNode } from 'stores/group-tree-node'
import { groupBy } from 'src/util/array'

export type MultiEnvironmentVariableMap = Map<
  string,
  Map<string, VariableSchema[]>
>
export type EnvironmentVariableMap = Map<string, VariableSchema[]>

export const useVariableStore = defineStore('variables', () => {
  const projectVariables: Ref<{ [key: number]: VariableSchema[] }> = ref({})
  const groupVariables: Ref<{ [key: number]: VariableSchema[] }> = ref({})

  const loader = useLoader()

  async function getInheritedVariables(
    node: GroupTreeNode
  ): Promise<MultiEnvironmentVariableMap> {
    const { getNodesParents } = useGroupStore()
    const groups = getNodesParents(node)

    const resultMap: MultiEnvironmentVariableMap = new Map()

    const variableLoads = groups.map((g) =>
      g.loader.load(async () => {
        const varsByEnv = await getVariables(g)

        for (const [env, vars] of varsByEnv) {
          if (!resultMap.has(env)) resultMap.set(env, new Map())
          resultMap.get(env)!.set(g.name, vars)
        }
      })
    )

    await Promise.all(variableLoads)

    return resultMap
  }

  async function getVariables(
    node: GroupTreeNode
  ): Promise<EnvironmentVariableMap> {
    let results = []
    if (node.type === 'project') {
      results = await getProjectVariables(node.projectInfo!.id)
    } else {
      results = await getGroupVariables(node.groupInfo!.id)
    }

    return groupBy(results, (x) => x.environment_scope || '')
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
