<template>
  <div class="navigationContent">
    <a title="About Me" @click="navigate('About')">
      <div class="navigationContent__icon">
        <img src="assets/about.svg" />
        <p>ABOUT</p>
      </div>
    </a>
    <a title="Code" @click="navigate('Code')">
      <div class="navigationContent__icon">
        <img src="assets/code.svg" />
        <p>CODE</p>
      </div>
    </a>
    <a title="Work" @click="navigate('Work')">
      <div class="navigationContent__icon">
        <img src="assets/work.svg" />
        <p>WORK</p>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  methods: {
    navigate(type) {
      this.$emit("navigate", type);
    },
  },
};
</script>
<style lang="scss">
.navigationContent {
  display: flex;
  justify-content: space-around;
  &__icon {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    img {
      width: 60px;
    }

    p {
      font-weight: bold;
    }
  }
}
</style>
