<template>
  <q-expansion-item dense class="q-my-xs" :label="props.variable.key">
    <q-item-section class="q-pl-md text-weight-medium">
      {{ variable.value }}
    </q-item-section>
  </q-expansion-item>
</template>
<script lang="ts" setup>
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'

const props = defineProps<{
  variable: VariableSchema
}>()
</script>
