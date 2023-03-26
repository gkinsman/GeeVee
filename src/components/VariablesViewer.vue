<template>
  <div class="q-gutter-md">
    <q-card class="q-pa-md" :key="key" v-for="[key, vars] of groups">
      <span class="text-h6">{{ key }}</span>
      <div :key="v.key" v-for="v of vars">
        {{ v.key }}
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { computed, Ref } from 'vue'
import { groupBy } from 'src/util/array'

const props = defineProps<{
  variables: VariableSchema[]
}>()

const groups = computed(() =>
  groupBy(props.variables || [], (x) => x.environment_scope || '')
)
</script>

<style scoped></style>
