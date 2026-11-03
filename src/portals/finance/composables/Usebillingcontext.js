import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Keeps the selected term and class in the URL (?term=8&class=5) so both billing
// steps share them, survive a refresh, and can be bookmarked.
export function useBillingContext() {
  const route = useRoute()
  const router = useRouter()

  const toId = (v) => (v ? Number(v) : '')
  const term = ref(toId(route.query.term))
  const classLevel = ref(toId(route.query.class))

  watch([term, classLevel], ([t, c]) => {
    router.replace({
      query: { ...route.query, term: t || undefined, class: c || undefined },
    })
  })

  return { term, classLevel }
}