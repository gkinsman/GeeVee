<template>
  <div class="q-gutter-md">
    <div class="text-h3">{{ activeNode?.name }}</div>

    <q-card class="q-pa-md" :key="env" v-for="env of allEnvironments">
      <div class="row justify-between">
        <div>
          <span class="q-pr-md text-h6">{{ env }}</span>
        </div>
        <div>
          <q-btn size="sm" outline @click="viewRaw(env)">View Raw</q-btn>
        </div>
      </div>
      <variable-view
        :variable="v"
        :key="v.key"
        v-for="v of varsForEnv(env)"
      ></variable-view>

      <q-expansion-item
        :key="inherited.name"
        :label="inherited.name"
        v-for="inherited of inheritedForEnv(env)"
        :caption="inherited.variables.length + ' inherited variables'"
      >
        <q-item-section class="q-pl-sm">
          <variable-view
            :variable="v"
            :key="v.key"
            v-for="v of inherited.variables"
          ></variable-view>
        </q-item-section>
      </q-expansion-item>
    </q-card>

    <q-dialog v-model="showJson">
      <q-card>
        <q-card-section> </q-card-section>

        <q-card-section class="q-pt-none">
          {{ jsonData }}
        </q-card-section>

        <q-card-actions>
          <q-btn
            @click="jsonData = ''"
            flat
            label="OK"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import type {
  EnvironmentVariableMap,
  MultiEnvironmentVariableMap,
} from 'stores/variables/variable-store'
import { GroupTreeNode } from 'stores/groups/group-tree-node'
import { computed, ref } from 'vue'
import VariableView from './VariableView.vue'

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

const showJson = computed(() => !!jsonData.value)
const jsonData = ref('')

function viewRaw(env: string) {
  const variables = props.variables.get(env) || []
  const inherited =
    props.inheritedVariables.get(env)?.flatMap((v) => v.variables) || []

  const allVars = [...variables, ...inherited]

  jsonData.value = JSON.stringify(allVars)
}

function varsForEnv(env: string) {
  return props.variables.get(env)
}

function inheritedForEnv(env: string) {
  return props.inheritedVariables.get(env)
}
</script>

<style scoped>
.q-expansion-item--expanded {
  border-left: 2px solid grey;
}
</style>
