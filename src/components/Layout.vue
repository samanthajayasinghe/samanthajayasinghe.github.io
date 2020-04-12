<template>
  <div class="app">
    <div class="app__header">
      <Header />
    </div>
    <div class="app__body">
      <slot name="content" />
    </div>
    <div class="app__footer"></div>
  </div>
</template>
<script>
import Header from "../components/Header.vue";

export default {
  components: {
    Header,
  },
};
</script>
<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
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

  &__body {
    flex-grow: 5;
    height: 500px;
    background-color: #eef1f5;
  }
  &__footer {
    flex-grow: 1;
  }
}
</style>
