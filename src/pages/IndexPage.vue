<template>
  <q-page class=""> <project-root-view v-if="root" :root="root" /></q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ProjectRootView from 'components/ProjectRootView.vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectRootStore } from 'stores/projectRoots/project-root-store'

const id = useRoute().params.id as string
const root = ref(useProjectRootStore().getProjectRoot(id))

if (!root.value) {
  await useRouter().push('/edit')
}
</script>
