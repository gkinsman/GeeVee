/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineStore } from 'pinia'
import { useGitlab } from 'src/api/gitlab'
import { GroupSchema } from '@gitbeaker/core/dist/types/resources/Groups'
import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects'
import { reactive } from 'vue'
import { useCache } from 'src/util/cache'
import { parseNamespace } from 'src/util/gitlab'
import { GroupTreeNode } from 'stores/groups/group-tree-node'
import { ProjectRoot } from 'stores/projectRoots/project-root-store'
import { LoadFailure } from 'src/util/loader'

export type GroupProjectMap = Map<string, GroupTreeNode>

interface ProjectRootGroupStore {
  loadGroupsAndProjects(): Promise<void>
  getNodesParents(group: GroupTreeNode): GroupTreeNode[]
  isCached: () => boolean
  clear(): void
  loadFailures: LoadFailure[]
  groupTree: GroupTreeNode[]
}

type ProjectRootMap = Map<string, ProjectRootGroupStore>

const groupCacheKey = (root: ProjectRoot) => `groups-${root.id}`
const projectCacheKey = (root: ProjectRoot) => `projects-${root.id}`

export const useGroupStore = defineStore('groups', () => {
  const groupCache = useCache<GroupSchema[]>()
  const projectCache = useCache<ProjectSchema[]>()

  const projectRoots: ProjectRootMap = new Map<string, ProjectRootGroupStore>()

  function getOrCreateRoot(
    projectRoot?: ProjectRoot
  ): ProjectRootGroupStore | undefined {
    if (!projectRoot) return
    if (projectRoots.has(projectRoot.id)) {
      return projectRoots.get(projectRoot.id)!
    } else {
      const newRoot = createProjectRoot(projectRoot)
      projectRoots.set(projectRoot.id, newRoot)
      return newRoot
    }
  }

  function clearRoot(projectRoot: ProjectRoot) {
    groupCache.remove(groupCacheKey(projectRoot))
    groupCache.remove(projectCacheKey(projectRoot))

    getOrCreateRoot(projectRoot)?.clear()
  }

  function deleteRoot(projectRoot: ProjectRoot) {
    clearRoot(projectRoot)
    projectRoots.delete(projectRoot.id)
  }

  function createProjectRoot(projectRoot: ProjectRoot): ProjectRootGroupStore {
    const groups: GroupSchema[] = reactive([])
    const projects: ProjectSchema[] = reactive([])
    const groupTree: GroupTreeNode[] = reactive([])
    const loadFailures: LoadFailure[] = reactive([])

    const groupProjectMap: GroupProjectMap = new Map()

    async function loadGroupsAndProjects() {
      const { listGroups, listProjects } = useGitlab(projectRoot)

      if (groups?.length || projects?.length || groupTree?.length) {
        return
      }

      loadFailures.splice(0)
      try {
        const loadedGroups = await groupCache.loadOrSave(
          groupCacheKey(projectRoot),
          listGroups
        )
        groups.splice(0)
        groups.push(...(loadedGroups || []))
        if (!groups.length) return

        groupTree.splice(0)
        groupTree.push(...createTree(groups))
        if (!groupTree) return
      } catch (error) {
        loadFailures.push({
          id: `groups-${projectRoot.id}`,
          description: error.description ?? 'Unknown',
        })
      }

      const firstGroup = groupTree[0]
      const rootGroupId = firstGroup?.groupInfo!.id // TODO: move this to root config

      if (loadFailures.length) return

      try {
        const loadedProjects = await projectCache.loadOrSave(
          projectCacheKey(projectRoot),
          async () => await listProjects(rootGroupId)
        )
        Object.assign(projects, loadedProjects)
      } catch (error) {
        loadFailures.push({
          id: `projects-${projectRoot.id}`,
          description: JSON.stringify(error),
        })
      }

      if (loadFailures.length) return

      populateTreeWithProjects()
    }

    function clear() {
      groups.splice(0)
      groupTree.splice(0)
      projects.splice(0)
    }

    function getNodesParents(group: GroupTreeNode): GroupTreeNode[] {
      const results = []
      let parent = group.parent

      while (parent) {
        results.push(parent)
        parent = parent.parent
      }

      return results
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
      if (!groupTree || !projects) return
      for (const root of groupTree) {
        for (const proj of projects) {
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

    function isCached(): boolean {
      return projectCache.exists(`projects-${projectRoot.id}`)
    }

    return {
      loadGroupsAndProjects,
      getNodesParents,
      isCached,
      groupTree,
      clear,
      loadFailures,
    }
  }

  return { getOrCreateRoot, deleteRoot, clearRoot }
})
