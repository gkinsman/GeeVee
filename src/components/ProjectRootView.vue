<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<template>
  <q-splitter v-model="splitter" unit="px" class="absolute-full">
    <template v-slot:before>
      <div class="q-pa-md">
        <group-tree-view
          @selectionChanged="nodeChanged"
          :group-tree="groupTree"
        ></group-tree-view>
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
      <q-inner-loading
        :showing="variablesLoader.loading.value"
        label="Please wait..."
        label-class="text-teal"
        label-style="font-size: 1.1em"
      >
      </q-inner-loading>
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import { useGroupStore } from 'src/stores/groups/group-store'
import { Ref, ref, watch } from 'vue'
import {
  EnvironmentVariableMap,
  MultiEnvironmentVariableMap,
  useVariableStore,
} from 'stores/variables/variable-store'
import { GroupTreeNode } from 'stores/groups/group-tree-node'
import { useLoader } from 'src/util/loader'
import VariablesViewer from 'components/VariablesViewer.vue'
import {
  ProjectRoot,
  useProjectRootStore,
} from 'stores/projectRoots/project-root-store'
import GroupTreeView from 'components/GroupTreeView.vue'

const props = defineProps<{
  root?: ProjectRoot
}>()

const splitter = ref(400)
const variablesLoader = useLoader()
const treeLoader = useLoader()

const selectedGroup: Ref<GroupTreeNode | null> = ref(null)
const variables: Ref<EnvironmentVariableMap> = ref(new Map())
const inheritedVariables: Ref<MultiEnvironmentVariableMap> = ref(new Map())

const groupStore = useGroupStore()
const variableStore = useVariableStore()

const rootNode: Ref<ProjectRoot | undefined> = ref()
const groupTree: Ref<GroupTreeNode[]> = ref(null!)

await updateRoot()

watch(
  () => props.root,
  async () => await updateRoot()
)

async function updateRoot() {
  const root = useProjectRootStore().getProjectRoot(props.root?.id)
  if (!root) return

  rootNode.value = root

  await variablesLoader.load(async () => {
    const groupStoreRoot = groupStore.getRoot(root)
    await groupStoreRoot.loadGroupsAndProjects()
    groupTree.value = groupStoreRoot.groupTree.value
  })
}

async function nodeChanged(node: GroupTreeNode) {
  selectedGroup.value = node

  await variablesLoader.load(async () => {
    var rootStore = variableStore.getRootStore(rootNode.value!)
    variables.value = await rootStore.getVariables(node)
    inheritedVariables.value = await rootStore.getInheritedVariables(node)
  })
}
</script>

<style scoped></style>
