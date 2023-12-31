import { Gitlab } from '@gitbeaker/browser'
import { GroupSchema } from '@gitbeaker/core/dist/types/resources/Groups'
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects'
import { ProjectRoot } from 'stores/projectRoots/project-root-store'

export function useGitlab(projectRoot: ProjectRoot) {
  const api = new Gitlab({
    token: projectRoot.apiKey,
  })

  async function listGroups(): Promise<GroupSchema[]> {
    return await api.Groups.all()
  }

  async function listProjects(groupId: number): Promise<ProjectSchema[]> {
    return await api.Groups.projects(groupId, {
      includeSubgroups: true,
      archived: false,
    })
  }

  async function loadGroupVariables(
    groupId: string | number
  ): Promise<VariableSchema[]> {
    console.log(`Loading variables for group ${groupId}`)

    return await api.GroupVariables.all(groupId)
  }

  async function loadProjectVariables(
    projectId: string | number
  ): Promise<VariableSchema[]> {
    console.log(`Loading variables for project ${projectId}`)
    return await api.ProjectVariables.all(projectId)
  }

  return {
    listGroups,
    listProjects,
    loadGroupVariables,
    loadProjectVariables,
  }
}
