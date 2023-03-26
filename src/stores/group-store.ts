import { defineStore } from 'pinia'
import { useGitlab } from 'src/api/gitlab'
import { GroupSchema } from '@gitbeaker/core/dist/types/resources/Groups'
import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects'
import { Ref, ref } from 'vue'
import { useCache } from 'src/util/cache'
import { parseNamespace } from 'src/util/gitlab'
import { GroupTreeNode } from 'stores/group-tree-node'

export type GroupProjectMap = Map<string, GroupTreeNode>

export const useGroupStore = defineStore('groups', () => {
  const groupCache = useCache<GroupSchema[]>()
  const projectCache = useCache<ProjectSchema[]>()

  const groups: Ref<GroupSchema[]> = ref([])
  const projects: Ref<ProjectSchema[]> = ref([])
  const groupTree: Ref<GroupTreeNode[]> = ref([])

  const groupProjectMap: GroupProjectMap = new Map()

  async function loadGroupsAndProjects() {
    const { listGroups } = useGitlab()
    const { listProjects } = useGitlab()

    groups.value = await groupCache.loadOrSave('groups', listGroups)
    groupTree.value = createTree(groups.value)

    projects.value = await projectCache.loadOrSave(
      'projects',
      async () => await listProjects(groupTree.value[0].groupInfo!.id)
    )

    populateTreeWithProjects()
  }

  function getNodeWithParents(group: GroupTreeNode): GroupTreeNode[] {
    const results = [group]
    let parent = group.parent

    while (parent) {
      results.push(parent)
      parent = parent.parent
    }

    return results
  }

  function findNode(nodeId: string): GroupTreeNode | undefined {
    return groupProjectMap.get(nodeId)
  }

  function findGroupByPath(root: GroupTreeNode, path: string[]) {
    let curr = root
    for (const p of path) {
      const child = curr.find(p)
      if (!child) {
        console.log(`Couldn't find path ${path}`)
        return null
      }
      curr = child
    }
    return curr
  }

  function populateTreeWithProjects() {
    for (const root of groupTree.value) {
      for (const proj of projects.value) {
        const path = parseNamespace(proj.namespace.full_path)
        const group = findGroupByPath(root, path)

        if (!group) continue
        group.getOrAdd(proj.name).populateProject(proj, groupProjectMap)
      }
    }
  }

  function addChild(children: GroupTreeNode[], newNode: GroupTreeNode) {
    children.push(newNode)
    groupProjectMap.set(`${newNode.type}-${newNode.id}`, newNode)
  }

  function createTree(groups: GroupSchema[]): GroupTreeNode[] {
    const roots: GroupTreeNode[] = []

    for (const group of groups) {
      const parts = group.full_path.split('/')
      const parents = parts.slice(1, -1)
      const name = parts.slice(-1)[0]
      const first = parts[0]

      let curr = ensureRoot(roots, first)
      for (const parent of parents) {
        curr = curr.getOrAdd(parent)
      }

      curr.getOrAdd(name).populateGroup(group, groupProjectMap)
    }

    return roots
  }

  function ensureRoot(roots: GroupTreeNode[], root: string): GroupTreeNode {
    let rootNode = roots.find((r) => r.name === root)
    if (!rootNode) {
      rootNode = new GroupTreeNode(root)
      addChild(roots, rootNode)
    }
    return rootNode
  }

  return {
    loadGroupsAndProjects,
    groups,
    groupTree,
    findNode,
    getNodeWithParents,
  }
})
