<template>
  <q-page class="">
    <q-splitter v-model="splitter" unit="px" class="absolute-full">
      <template v-slot:before>
        <div class="q-pa-md">
          <group-tree
            @selectionChanged="nodeChanged"
            :group-tree="groupTree"
          ></group-tree>
        </div>
      </template>
      <template v-slot:after>
        <div class="q-pa-md">
          <variables-viewer :variables="variables"></variables-viewer>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import GroupTree from 'src/components/GroupTree.vue'
import { useGroupStore } from 'src/stores/group-store'
import { Ref, ref } from 'vue'
import { useVariableStore } from 'stores/variable-store'
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import VariablesViewer from 'components/VariablesViewer.vue'
import { GroupTreeNode } from 'stores/group-tree-node'

const splitter = ref(400)

const selectedGroup: Ref<GroupTreeNode | null> = ref(null)
const variables: Ref<VariableSchema[] | null> = ref(null)
const inheritedVariables: Ref<{ [key: string]: VariableSchema[] }> = ref({})

const groupStore = useGroupStore()
const variableStore = useVariableStore()

await groupStore.loadGroupsAndProjects()

const groupTree = groupStore.groupTree

async function nodeChanged(node: GroupTreeNode) {
  selectedGroup.value = node

  // when is variables.value getting set to undefined?!

  if (node.groupInfo) {
    const groupId = selectedGroup.value?.groupInfo?.id
    if (!groupId) return
    const selfVariables = await variableStore.getGroupVariables(groupId)

    variables.value = selfVariables
  } else if (node.projectInfo) {
    const projectId = selectedGroup.value?.projectInfo?.id
    if (!projectId) return
    const selfVariables = await variableStore.getProjectVariables(projectId)
    variables.value = selfVariables
  }

  const inheritedVariables = await variableStore.getInheritedVariables(
    node.id!,
    node.type
  )
}
</script>
