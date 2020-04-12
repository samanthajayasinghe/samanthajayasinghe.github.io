<template>
    <div class="app">
        <div class="app__header">
            Header goes here
        </div>
        <div class="app__body">
            <slot name="content" />
        </div>
        <div class="app__footer">
            Footer goes here
        </div>
    </div>
</template>
<style lang="scss">
    .app {
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        &__header {
            background-color: aqua;
            flex-grow: 1;
        }

        &__body {
            flex-grow: 5;
            height: 500px;
        }
        &__footer {
            flex-grow: 1;
            background-color: aqua;
        }
    }
</style>