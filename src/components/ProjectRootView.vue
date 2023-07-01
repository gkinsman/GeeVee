<template>
  <q-splitter v-model="splitter" unit="px" class="absolute-full">
    <template v-slot:before>
      <div class="q-pa-md">
        <group-tree-view
          @selectionChanged="nodeSelected"
          @refresh="refresh"
          :group-tree="groupTree"
        ></group-tree-view>
        <q-inner-loading
          :showing="treeLoader.loading.value"
          label="Please wait..."
          label-class="text-teal"
          label-style="font-size: 1.1em"
        >
        </q-inner-loading>
      </div>
    </template>
    <template v-slot:after>
      <div class="q-pa-md q-gutter-md">
        <div class="text-h3">{{ selectedGroup?.name }}</div>

        <q-banner v-if="loadFailures.length" class="error-banner shadow-2">
          <span
            class="text-weight-medium"
            :key="failure?.id"
            v-for="failure of loadFailures"
          >
            {{ selectedGroup?.loader.failure }}
          </span>
          <span :key="failure?.id" v-for="failure of loadFailures">{{
            failure?.description
          }}</span>
        </q-banner>

        <variables-viewer
          v-if="variables && inheritedVariables"
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
import { Ref, computed, onMounted, ref, watch } from 'vue'
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

const variables: Ref<EnvironmentVariableMap | null> = ref(null)
const inheritedVariables: Ref<MultiEnvironmentVariableMap | null> = ref(null)

const groupStore = useGroupStore()
const variableStore = useVariableStore()

const rootGroup = computed(() => groupStore.getOrCreateRoot(props.root))
const groupTree = computed(() => rootGroup.value?.groupTree)
const loadFailures = computed(() =>
  [
    selectedGroup?.value?.loader.failure?.value,
    ...(rootGroup.value?.loadFailures || []),
  ].filter((x) => !!x)
)

watch(
  () => props.root,
  async () => await updateRoot()
)

onMounted(updateRoot)

async function updateRoot() {
  const root = useProjectRootStore().getProjectRoot(props.root?.id)
  if (!root) return

  selectedGroup.value = null
  resetVariables()
  await load()
}
// TODO: need to show failures from rootStore variable somehow - computed?
async function nodeSelected(node: GroupTreeNode) {
  resetVariables()
  await loadNodeVariables(node)
}

async function loadNodeVariables(node: GroupTreeNode) {
  selectedGroup.value = node
  try {
    await variablesLoader.load(async () => {
      const rootStore = variableStore.getRootStore(props.root)
      if (!rootStore) return

      const getInherited = rootStore.getInheritedVariables(node)
      const getVariables = rootStore.getVariables(node)

      await Promise.all([getInherited, getVariables])

      inheritedVariables.value = await getInherited
      variables.value = await getVariables
    })
  } catch (error) {
    console.log(error)
  }
}

function resetVariables() {
  selectedGroup.value = null
  variables.value = null
  inheritedVariables.value = null
}

async function refresh() {
  if (props.root) groupStore.clearRoot(props.root)
  await load()
}

async function load() {
  if (!rootGroup.value) return
  await treeLoader.load(async () => {
    await rootGroup.value?.loadGroupsAndProjects()
  })
}
</script>

<style scoped>
.error-banner {
  border-left: 5px solid red;
}
</style>
