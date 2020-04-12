<template>
  <Layout>
    <template v-slot:content>
      <ContentHome />
    </template>
  </Layout>
</template>
<script>
import Layout from "../components/Layout.vue";
import ContentHome from "../components/content/ContentHome.vue";

export default {
  components: {
    Layout,
    ContentHome,
  },
};
</script>
