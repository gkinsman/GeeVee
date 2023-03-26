import { GroupSchema } from '@gitbeaker/core/dist/types/resources/Groups'
import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects'
import { Loader, useLoader } from 'src/util/loader'
import { GroupProjectMap } from 'stores/group-store'

export class GroupTreeNode {
  public id?: string
  public children: GroupTreeNode[] = []
  public loader: Loader = useLoader()

  public groupInfo?: GroupSchema
  public projectInfo?: ProjectSchema

  get type() {
    if (this.groupInfo) return 'group'
    return 'project'
  }

  constructor(public name: string, public parent?: GroupTreeNode) {}

  getOrAdd(name: string): GroupTreeNode {
    if (this.name === name) return this
    let elem = this.find(name)
    if (elem) return elem

    elem = new GroupTreeNode(name, this)
    this.children.push(elem)

    return elem
  }

  find(name: string) {
    if (this.name == name) return this
    return this.children.find((c) => c.name === name)
  }

  populateGroup(info: GroupSchema, groupMap: GroupProjectMap) {
    this.groupInfo = info
    this.id = `group-${info.id}`

    groupMap.set(this.id, this)

    return this
  }

  populateProject(info: ProjectSchema, groupMap: GroupProjectMap) {
    this.projectInfo = info
    this.id = `project-${info.id}`

    groupMap.set(this.id, this)

    return this
  }
}
