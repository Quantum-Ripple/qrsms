import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getStudent } from "../api/Students";

const KEY = "selectedChildId";

export const useChildStore = defineStore("child", () => {
  const children = ref([]);
  const selectedId = ref(Number(localStorage.getItem(KEY)) || null);
  const loaded = ref(false);

  const selected = computed(() =>
    children.value.find((c) => c.id === selectedId.value) || null
  );

  async function load() {
    if (loaded.value) return;
    const res = await getStudent();
    children.value = Array.isArray(res) ? res : res?.results ?? [];

    // Keep the saved choice only if it's still one of this parent's children.
    if (!children.value.some((c) => c.id === selectedId.value)) {
      select(children.value[0]?.id ?? null);
    }
    loaded.value = true;
  }

  function select(id) {
    selectedId.value = id;
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
  }

  return { children, selectedId, selected, load, select };
});