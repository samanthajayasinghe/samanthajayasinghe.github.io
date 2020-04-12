<template>
    <Layout slot="header">
        <template v-slot:content>
            <div class="bodyContent">
                <p>Thanks for visiting samanthajayasinghe.github.io</p>

            </div>
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
    .bodyContent {
        display: flex;
        justify-content: center;
        font-size: 16px;
    }
</style>