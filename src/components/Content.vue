<template>
  <b-container fluid="lg">
    <b-row>
      <component :is="type" />
    </b-row>
  </b-container>
</template>
<script>
import About from "./content/About.vue";
import Code from "./content/Code.vue";
import Work from "./content/Work.vue";
export default {
  props: {
    type: String,
  },
  components: {
    About,
    Code,
    Work,
  },
  methods: {
    getComponent() {
      console.log(this.type);
      return this.type;
    },
  },
};
</script>
<style lang="scss">
.homeContent {
  display: flex;
  justify-content: center;
  font-size: 16px;
}
</style>
