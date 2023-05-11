import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'
import { useGitlab } from 'src/api/gitlab'
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { useGroupStore } from 'stores/groups/group-store'
import { GroupTreeNode } from 'stores/groups/group-tree-node'
import { groupBy } from 'src/util/array'
import { ProjectRoot } from 'stores/projectRoots/project-root-store'

export interface VariableList {
  variables: VariableSchema[]
  name: string
  order: number
}

export type MultiEnvironmentVariableMap = Map<string, VariableList[]>
export type EnvironmentVariableMap = Map<string, VariableSchema[]>

export const useVariableStore = defineStore('variables', () => {
  const projectVariables: Ref<{ [key: number]: VariableSchema[] }> = ref({})
  const groupVariables: Ref<{ [key: number]: VariableSchema[] }> = ref({})

  async function getInheritedVariables(
    projectRoot: ProjectRoot,
    node: GroupTreeNode
  ): Promise<MultiEnvironmentVariableMap> {
    const { getRoot } = useGroupStore()
    const root = getRoot(projectRoot)
    const groups = root.getNodesParents(node)

    const resultMap: MultiEnvironmentVariableMap = new Map()

    const variableLoads = groups.map((group, idx) =>
      group.loader.load(async () => {
        const varsByEnv = await getVariables(group)

        for (const [env, vars] of varsByEnv) {
          if (!resultMap.has(env)) resultMap.set(env, [])
          const variableList: VariableList = {
            variables: vars,
            name: group.name,
            order: idx,
          }
          resultMap.get(env)!.push(variableList)
        }
      })
    )

    await Promise.all(variableLoads)

    resultMap.forEach((x) => x.sort((a, b) => a.order - b.order))

    return resultMap
  }

  async function getVariables(
    node: GroupTreeNode
  ): Promise<EnvironmentVariableMap> {
    const result = await node.loader.load(async () => {
      try {
        let results = []
        if (node.type === 'project') {
          results = await getProjectVariables(node.projectInfo!.id)
        } else {
          results = await getGroupVariables(node.groupInfo!.id)
        }
        return results
      } catch (error) {
        console.log(error)
        return []
      }
    })

    return groupBy(result, (x) => x.environment_scope || '')
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
    getInheritedVariables,
    getVariables,
  }
})
