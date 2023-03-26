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
          <variables-viewer
            :activeNode="selectedGroup"
            :variables="variables"
            :inherited-variables="inheritedVariables"
          ></variables-viewer>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import GroupTree from 'src/components/GroupTree.vue'
import { useGroupStore } from 'src/stores/group-store'
import { Ref, ref } from 'vue'
import {
  EnvironmentVariableMap,
  MultiEnvironmentVariableMap,
  useVariableStore,
} from 'stores/variable-store'
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import VariablesViewer from 'components/VariablesViewer.vue'
import { GroupTreeNode } from 'stores/group-tree-node'

const splitter = ref(400)

const selectedGroup: Ref<GroupTreeNode | null> = ref(null)
const variables: Ref<EnvironmentVariableMap> = ref(new Map())
const inheritedVariables: Ref<MultiEnvironmentVariableMap> = ref(new Map())

const groupStore = useGroupStore()
const variableStore = useVariableStore()

await groupStore.loadGroupsAndProjects()

const groupTree = groupStore.groupTree

async function nodeChanged(node: GroupTreeNode) {
  selectedGroup.value = node

  variables.value = await variableStore.getVariables(node)
  inheritedVariables.value = await variableStore.getInheritedVariables(node)
}
</script>
