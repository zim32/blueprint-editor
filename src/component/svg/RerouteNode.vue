<template>

    <circle class="reroute-point" :class="classes" pointer-events="visiblePainted" :cx="point.x" :cy="point.y" r="6" fill="#ccc"></circle>

</template>

<style>

    .reroute-point:hover, .reroute-point.selected {
        fill: firebrick;
        cursor: pointer;
    }

</style>

<script>

    export default {

        data() {
            return {

            }
        },

        inject: ['plugins'],

        props: {
            point: { type: Object, required: true }
        },

        created() {
            this.plugins.forEach(i => i.rerouteNodeCreated(this));
        },

        mounted() {
            this.plugins.forEach(i => i.rerouteNodeMounted(this));
        },

        destroyed() {
            this.plugins.forEach(i => i.rerouteNodeDestroyed(this));
        },

        computed: {
            classes() {
                const selected = this.$store.state.selectedRerouteNodes.some(item => item === this);

                return { selected: selected }
            }
        }

    }

</script>