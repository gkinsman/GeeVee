<template>
  <q-expansion-item dense class="q-my-xs" :label="props.variable.key">
    <q-item-section class="q-pl-md text-weight-medium">
      <div>
        <q-btn
          class="q-pa-xs"
          clickable
          square
          size="sm"
          flat
          @click="copy"
          icon="content_copy"
        ></q-btn>
        {{ variable.value }}
      </div>
    </q-item-section>
  </q-expansion-item>
</template>
<script lang="ts" setup>
import { VariableSchema } from '@gitbeaker/core/dist/types/templates/types'
import { copyToClipboard } from 'quasar'

function copy() {
  copyToClipboard(props.variable.value)
}

const props = defineProps<{
  variable: VariableSchema
}>()
</script>
