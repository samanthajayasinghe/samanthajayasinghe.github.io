<template>
    <Layout slot="header">
        <template v-slot:content>
            <div>Home page</div>
        </template>

    </Layout>
</template>
<script>
    import Layout from "../components/Layout.vue";

    export default {
        components: {
            Layout
        }
    };
</script>
<style lang="scss">
    .main {
        display: flex;
        justify-content: center;
    }
</style>