import { defineStore } from 'pinia'
import { useGitlab } from 'src/api/gitlab'
import { GroupSchema } from '@gitbeaker/core/dist/types/resources/Groups'
import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects'
import { Ref, computed, ref, ComputedRef } from 'vue'
import { useCache } from 'src/util/cache'
import { parseNamespace } from 'src/util/gitlab'
import { GroupTreeNode } from 'stores/groups/group-tree-node'
import { ProjectRoot } from 'stores/projectRoots/project-root-store'

export type GroupProjectMap = Map<string, GroupTreeNode>

interface ProjectRootGroupStore {
  loadGroupsAndProjects(): Promise<void>
  getNodesParents(group: GroupTreeNode): GroupTreeNode[]
  projects: Ref<ProjectSchema[]>
  groups: Ref<GroupSchema[]>
  groupTree: Ref<GroupTreeNode[]>
  isCached: () => boolean
}

type ProjectRootMap = Map<string, ProjectRootGroupStore>

export const useGroupStore = defineStore('groups', () => {
  const groupCache = useCache<GroupSchema[]>()
  const projectCache = useCache<ProjectSchema[]>()

  const projectRoots: ProjectRootMap = new Map<string, ProjectRootGroupStore>()

  function getRoot(projectRoot: ProjectRoot): ProjectRootGroupStore {
    if (projectRoots.has(projectRoot.id)) {
      return projectRoots.get(projectRoot.id)!
    } else {
      const newRoot = createProjectRoot(projectRoot)
      projectRoots.set(projectRoot.id, newRoot)
      return newRoot
    }
  }

  function deleteRoot(projectRoot: ProjectRoot) {
    projectRoots.delete(projectRoot.id)
  }

  function createProjectRoot(projectRoot: ProjectRoot): ProjectRootGroupStore {
    const groups: Ref<GroupSchema[]> = ref([])
    const projects: Ref<ProjectSchema[]> = ref([])
    const groupTree: Ref<GroupTreeNode[]> = ref([])

    const groupProjectMap: GroupProjectMap = new Map()

    async function loadGroupsAndProjects() {
      const { listGroups, listProjects } = useGitlab(projectRoot)

      groups.value = await groupCache.loadOrSave(
        `root-${projectRoot.id}`,
        listGroups
      )
      groupTree.value = createTree(groups.value)

      projects.value = await projectCache.loadOrSave(
        `projects-${projectRoot.id}`,
        async () => await listProjects(groupTree.value[0].groupInfo!.id)
      )

      populateTreeWithProjects()
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

    function isCached(): boolean {
      return projectCache.exists(`projects-${projectRoot.id}`)
    }

    return {
      loadGroupsAndProjects,
      getNodesParents,
      projects,
      isCached,
      groups,
      groupTree: groupTree,
    }
  }

  return { getRoot, deleteRoot }
})
