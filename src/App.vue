<template>
  <Suspense>
    <router-view />
  </Suspense>
</template>

<script setup lang="ts">
import { useProjectRootStore } from 'stores/projectRoots/project-root-store'

const { loadProjectRoots } = useProjectRootStore()
loadProjectRoots()
</script>
