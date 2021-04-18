<template>

    <rect v-if="bbox" :x="bbox.x - viewportX" :y="bbox.y - viewportY" :width="bbox.w" :height="bbox.h" fill="black" fill-opacity="0.2" stroke="#209133" stroke-width="1" />

</template>

<script>

    export default {

        data() {
            return {
                bbox: { x: 0, y: 0, w: 0, h: 0 }
            }
        },

        inject: ['eventBus'],

        created() {
            this.eventBus.$on('updateSelectionBox', data => {
                this.bbox = data;
            });
        },

        computed: {
            viewportX() {
                return this.$store.state.viewportX;
            },
            viewportY() {
                return this.$store.state.viewportY;
            }
        },

    }

</script>