<template>
  <div>
    <Data />
    <Graph />
  </div>
</template>

<script>
import Data from '../components/dashboard/Data.vue';
import Graph from '../components/dashboard/Graph.vue';


export default {
  components: {
    Data, 
    Graph
  },
}
</script>
