import { GroupSchema } from '@gitbeaker/core/dist/types/resources/Groups'
import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects'
import { Loader, useLoader } from 'src/util/loader'
import { GroupMap } from 'stores/group-store'

export class GroupTreeNode {
  public id?: number
  public children: GroupTreeNode[] = []
  public loader: Loader = useLoader()

  public groupInfo?: GroupSchema
  public projectInfo?: ProjectSchema

  public loadedVariables = false

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

  populateGroup(info: GroupSchema, groupMap: GroupMap) {
    this.groupInfo = info
    this.id = info.id

    groupMap.set(`group-${this.id}`, this)

    return this
  }

  populateProject(info: ProjectSchema) {
    this.projectInfo = info
    this.id = info.id
    return this
  }
}
