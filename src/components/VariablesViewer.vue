<template>
  <div class="q-gutter-md">
    <div class="text-h3">{{ activeNode?.name }}</div>
    <q-card class="q-pa-md" :key="key" v-for="[key, vars] of variables">
      <span class="text-h6">{{ key }}</span>
      <div :key="v.key" v-for="v of vars">
        {{ v.key }}
      </div>

      <q-expansion-item
        :key="group"
        :label="group"
        v-for="[group, inherited] of inheritedForEnv(key)"
      >
        <div :key="v.key" v-for="v of inherited">
          {{ v.key }}
        </div>
      </q-expansion-item>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { computed, Ref } from 'vue'
import { groupBy } from 'src/util/array'
import {
  EnvironmentVariableMap,
  MultiEnvironmentVariableMap,
} from 'stores/variable-store'
import { GroupTreeNode } from 'stores/group-tree-node'

const props = defineProps<{
  activeNode: GroupTreeNode | null
  variables: EnvironmentVariableMap
  inheritedVariables: MultiEnvironmentVariableMap
}>()

function inheritedForEnv(env: string) {
  return props.inheritedVariables.get(env)
}
</script>

<style scoped></style>
