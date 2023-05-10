<template>
  <q-page>
    <div class="row justify-center" v-if="doesntExistMessage">
      <div class="col-12 row justify-center q-pt-xl">
        <div class="col-10 col-sm-6 text-center text-h4">
          {{ doesntExistMessage }}
        </div>
      </div>

      <q-btn color="primary" class="q-ma-lg" size="xl" to="/edit">
        Create It</q-btn
      >
    </div>
    <div class="row justify-center" v-if="!doesntExistMessage">
      <div class="col-12 row justify-center q-pa-md">
        <div class="text-h4" v-if="mode === 'New'">Add New Project Root</div>
        <div class="text-h4" v-if="mode === 'Edit'">
          Editing Project Root {{ projectRoot.name }}
        </div>
      </div>

      <div class="row col-4 justify-center q-pt-lg">
        <q-form class="q-gutter-md">
          <q-input
            v-model="projectRoot.name"
            filled
            label="Name"
            hint="We'll show this in the title bar"
            :rules="[
              (val) => (val && val.length > 0) || 'Name cannot be empty',
            ]"
          ></q-input>

          <q-input
            filled
            label="GitLab API Key"
            v-model="projectRoot.apiKey"
            :rules="[
              (val) => (val && val.length > 0) || 'GitLab API key is required',
            ]"
          ></q-input>

          <q-btn color="primary" label="Save" @click="save"></q-btn>
          <q-btn color="negative" label="Delete" @click="remove"></q-btn>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  ProjectRoot,
  useProjectRootStore,
} from 'stores/projectRoots/project-root-store'
import { computed, ComputedRef, Ref, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ id: string }>()
const projectRoot: Ref<ProjectRoot> = ref({
  apiKey: '',
  name: '',
})

const doesntExistMessage: Ref<string> = ref('')

const { getProjectRoot, saveProjectRoot, deleteProjectRoot } =
  useProjectRootStore()

update()

watch(
  () => props.id,
  () => update()
)

function update() {
  doesntExistMessage.value = ''

  const loadedProjectRoot = getProjectRoot(props.id)
  if (loadedProjectRoot) {
    projectRoot.value = loadedProjectRoot
  } else if (props.id?.length) {
    doesntExistMessage.value =
      "Sorry that project root doesn't exist, do you want to"
  } else {
    projectRoot.value = {
      apiKey: '',
      name: '',
    }
  }
}

const router = useRouter()

function save() {
  saveProjectRoot(projectRoot.value)
  router.push(`/edit/${projectRoot.value.id}`)
}

function remove() {
  const newRootId = deleteProjectRoot(projectRoot.value)
  router.push(`/edit/${newRootId}`)
}

type PageMode = 'Edit' | 'New'

const mode: ComputedRef<PageMode> = computed(() =>
  !!props.id ? 'Edit' : 'New'
)
</script>

<style scoped></style>
