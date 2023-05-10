import { assert, expect, test } from 'vitest'
import { useProjectRootStore } from 'stores/projectRoots/project-root-store'

test('Creating new root in store should contain root', () => {
  const store = useProjectRootStore()

  //store.saveProjectRoot()
})
