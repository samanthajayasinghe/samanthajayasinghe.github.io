<template>
  <div class="app">
    <div class="app__header">
      <Header />
    </div>
    <div class="app__navigation">
      <Navigation @navigate="navigate" />
    </div>
    <div class="app__body">
      <BobyContent :type="navigationType" />
    </div>
    <div class="app__footer"></div>
  </div>
</template>
<script>
import Header from "./Header.vue";
import Navigation from "./Navigation.vue";
import BobyContent from "./Content.vue";
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
<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: #eef1f5;
  &__header {
    justify-content: center;
    position: relative;
    height: 300px;
    background: rgb(2, 0, 36);
    background: linear-gradient(
      270deg,
      rgba(2, 0, 36, 1) 0%,
      rgba(48, 58, 69, 1) 40%,
      rgba(58, 124, 138, 1) 100%
    );
    color: #eef1f5;
    width: 100%;
  }

  &__navigation {
    margin-top: 10px;
  }

  &__body {
    flex-grow: 5;
    height: 500px;
  }
  &__footer {
    flex-grow: 1;
  }
}
</style>
