<template>
  <q-page class=""> <project-root-view :root="root" /></q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ProjectRootView from 'components/ProjectRootView.vue'
import { useRoute } from 'vue-router'
import { useProjectRootStore } from 'stores/projectRoots/project-root-store'

const id = useRoute().params.id as string

//const props = defineProps<{ id: string }>()
/*
if (id) {
  await useRouter().push('/edit')
}
*/

const root = ref(useProjectRootStore().getProjectRoot(id))

if (!root.value) {
  throw new Error('Root not found')
  // await useRouter().push('/edit')
}
</script>
