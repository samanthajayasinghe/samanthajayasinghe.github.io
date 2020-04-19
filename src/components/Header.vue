<template>
  <b-row>
    <div class="headerContent">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        class="headerContent__background"
      >
        <polygon points="0,200 200,0 200,200"></polygon>
      </svg>
      <div class="headerContent__image">
        <img src="assets/avatar.svg" />
      </div>
      <div class="headerContent__title">
        <h1>Samantha Jayasinghe</h1>
      </div>
      <div class="headerContent__tag-line">
        <span>In middle of the Software Engineering Journey </span>
      </div>
    </div>
  </b-row>
</template>
<script>
export default {};
</script>
<style lang="scss">
.headerContent {
  display: flex;
  flex-direction: column;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: #eef1f5;
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
  &__background {
    position: absolute;
    fill: #eef1f5;
    bottom: -1px;
    width: 100%;
    height: 3vw;
  }

  &__title {
    display: flex;
    justify-content: center;
    font-size: 16px;
    line-height: 1.5;
  }
  &__tag-line {
    display: flex;
    justify-content: center;
    font-size: 16px;
  }
  &__image {
    display: flex;
    justify-content: center;
  }
}
</style>
