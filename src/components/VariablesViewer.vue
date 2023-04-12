<template>
  <div class="q-gutter-md">
    <div class="text-h3">{{ activeNode?.name }}</div>
    <q-card class="q-pa-md" :key="env" v-for="env of allEnvironments">
      <span class="text-h6">{{ env }}</span>
      <div :key="v.key" v-for="v of varsForEnv(env)">
        {{ v.key }}
      </div>

      <q-expansion-item
        :key="inherited.name"
        :label="inherited.name"
        v-for="inherited of inheritedForEnv(env)"
        :caption="inherited.variables.length + ' inherited variables'"
      >
        <q-item-section>
          <div :key="v.key" v-for="v of inherited.variables">
            {{ v.key }}
          </div>
        </q-item-section>
      </q-expansion-item>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type {
  EnvironmentVariableMap,
  MultiEnvironmentVariableMap,
} from 'stores/variable-store'
import { GroupTreeNode } from 'stores/group-tree-node'
import { computed } from 'vue'

const props = defineProps<{
  activeNode: GroupTreeNode | null
  variables: EnvironmentVariableMap
  inheritedVariables: MultiEnvironmentVariableMap
}>()

const allEnvironments = computed(() => {
  return new Set(
    Array.from(props.variables.keys()).concat(
      Array.from(props.inheritedVariables.keys())
    )
  )
})

function varsForEnv(env: string) {
  return props.variables.get(env)
}

function inheritedForEnv(env: string) {
  return props.inheritedVariables.get(env)
}
</script>

<style scoped></style>
