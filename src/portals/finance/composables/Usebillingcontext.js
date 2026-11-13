import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAcademicContextStore } from '@/stores/academicContextStore'

// Keeps the selected term and class in the URL (?term=8&class=5) so both billing
// steps share them, survive a refresh, and can be bookmarked. When the page has
// not been manually overridden, it follows the app-wide academic context.
export function useBillingContext() {
  const route = useRoute()
  const router = useRouter()
  const academicContext = useAcademicContextStore()

  const toId = (v) => (v === '' || v === null || v === undefined ? '' : Number(v))
  const routeTerm = toId(route.query.term)
  const routeClass = toId(route.query.class)
  const localTermOverride = ref(route.query.term != null)
  let syncingFromGlobal = false

  const term = ref(routeTerm || toId(academicContext.selectedTermId) || '')
  const classLevel = ref(routeClass || '')

  watch(
    () => academicContext.selectedTermId,
    (nextTerm) => {
      if (!localTermOverride.value) {
        syncingFromGlobal = true
        term.value = toId(nextTerm)
      }
    },
    { immediate: true }
  )

  watch(term, (nextTerm, previousTerm) => {
    if (nextTerm === previousTerm || syncingFromGlobal) {
      syncingFromGlobal = false
      return
    }
    localTermOverride.value = true
    router.replace({
      query: { ...route.query, term: nextTerm || undefined, class: classLevel.value || undefined },
    })
  })

  watch(classLevel, (nextClass, previousClass) => {
    if (nextClass === previousClass) return
    router.replace({
      query: { ...route.query, term: term.value || undefined, class: nextClass || undefined },
    })
  })

  return { term, classLevel }
}