<template>

    <div class="node-output">
        <div v-if="!hideName"  class="node-label">{{ data.name }}</div>
        <div class="node-marker-wrapper" :title="markerTitle">
            <div ref="marker" class="node-marker" :style="pinStyles"></div>
        </div>
    </div>

</template>

<script>

    export default {

        data() {
            return {
                type: 'output',
            }
        },

        props: {
            data: { type: Object, required: true },
            hideName: { type: Boolean, required: false, default: false },
        },

        computed: {
            connections() {
                return this.$store.state.connections.filter(c => {
                    return c.from.node === this.$parent && c.from.pin === this;
                });
            },

            pinStyles() {
                let color = '#3e9b3c';

                if (this.data.type === 2) {
                    color = '#ccc';
                }

                return {
                    backgroundColor: color
                }
            },

            markerTitle() {
                return this.data.types.map(item => item.type).join("\n");
            }
        },

        methods: {
            serialize() {
                return {
                    data: this.data,
                    connections: this.connections.map(i => this.serializeConnection(i))
                };
            },

            serializeConnection(c) {
                return {
                    id: c.id,
                    from: {
                        node: c.from.node.node.id,
                        pin: c.from.pin.data.name
                    },
                    to: {
                        node: c.to.node.node.id,
                        pin: c.to.pin.data.name
                    }
                }
            }
        }

    }

</script>