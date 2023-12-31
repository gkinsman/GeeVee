<template>
  <div>
    <q-input ref="filterRef" filled v-model="filter" label="Filter">
      <template v-slot:append>
        <q-icon
          v-if="filter !== ''"
          name="clear"
          class="cursor-pointer"
          @click="resetFilter"
        />
      </template>
    </q-input>

    <q-btn-group spread class="q-my-md">
      <q-btn @click="treeRef.expandAll()" icon="unfold_more"></q-btn>
      <q-btn @click="treeRef.collapseAll()" icon="unfold_less"></q-btn>
      <q-btn @click="emit('refresh')" color="accent" icon="refresh"></q-btn>
    </q-btn-group>
    <q-tree
      class=""
      dense
      ref="treeRef"
      :nodes="props.groupTree || []"
      :filter="filter"
      node-key="id"
      children-key="children"
      label-key="name"
      default-expand-all
      v-model:selected="selected"
      @update:selected="selectedChanged"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-icon
            :name="getNodeIcon(prop.node)[1]"
            :color="getNodeIcon(prop.node)[0]"
            size="16px"
            class="q-mr-sm"
          >
          </q-icon>
          <q-tooltip v-if="prop.node.loader.failure">{{
            prop.node.loader.failure
          }}</q-tooltip>
          <div class="text-weight-bold text-primary">{{ prop.node.name }}</div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue'
import { QTree } from 'quasar'
import { GroupTreeNode } from 'stores/groups/group-tree-node'

const filter: Ref<string> = ref('')

const treeRef: Ref<QTree> = ref(null!)
const selected: Ref<GroupTreeNode | null> = ref(null)

const props = defineProps<{
  groupTree: GroupTreeNode[] | undefined
}>()

const emit = defineEmits<{
  (e: 'selection-changed', node: GroupTreeNode): void
  (e: 'refresh'): void
}>()

watch(props.groupTree ?? {}, (_, __) => {
  treeRef.value.expandAll()
})

function getNodeIcon(node: GroupTreeNode): [string, string] {
  if (node.loader.failure) return ['red', 'cancel']
  if (node.loader.loading) return ['yellow', 'sync']
  if (node.loader.loaded) return ['green', 'check_circle']
  return ['grey', 'help_outline']
}

async function selectedChanged(newSelection: string) {
  if (!newSelection) return
  const node = treeRef.value?.getNodeByKey(newSelection) as GroupTreeNode
  emit('selection-changed', node)
}

function resetFilter() {
  filter.value = ''
}
</script>

<style scoped></style>
