<template>
  <b-container fluid>
    <Header />
    <Navigation @navigate="navigate" />
    <BobyContent :type="navigationType" />
  </b-container>
</template>
<script>
import Header from "../components/Header.vue";
import Navigation from "../components/Navigation.vue";
import BobyContent from "../components/Content.vue";

export default {
  components: {
    Header,
    Navigation,
    BobyContent,
  },
  data() {
    return {
      navigationType: "About",
    };
  },
  methods: {
    navigate(type) {
      this.navigationType = type;
    },
  },
};
</script>
