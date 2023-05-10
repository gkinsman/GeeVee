<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title shrink>
          <div class="row items-center">
            <span class="q-pr-md">GeeVee</span>
            <span class="text-caption text">
              A Gitlab Project and Variable Viewer
            </span>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          stretch
          v-for="root in projectRoots.projectRoots"
          :key="root.id"
          :label="root.name"
          :to="`/edit/${root.id}`"
        ></q-btn>
        <q-btn stretch flat icon="add" to="/edit">Add Project Root</q-btn>

        <q-space />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useProjectRootStore } from 'stores/projectRoots/project-root-store'

const { projectRoots } = useProjectRootStore()
</script>
