<template>
  <q-page>
    <project-root-view v-if="root" :root="root" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import ProjectRootView from 'components/ProjectRootView.vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectRootStore } from 'stores/projectRoots/project-root-store'

const route = useRoute()
const root = ref()

watch(
  () => route.params.id,
  (id) => {
    const loadedRoot = useProjectRootStore().getProjectRoot(id as string)
    if (!loadedRoot) return
    root.value = loadedRoot
  },
  { immediate: true }
)

if (!root.value) {
  await useRouter().push('/edit')
}
</script>
