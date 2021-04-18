<template>

    <connection-path @redraw="redraw=!redraw" :connectionID="connection.id" :points="points" color="#aaa" :width="width"></connection-path>

</template>


<script>

    import ConnectionPath from './ConnectionPath.vue';
    import { getElementCenterPoint } from '../../helpers/dom';

    export default {

        components: { ConnectionPath },

        data() {
            return {
                redraw: false
            }
        },

        props: {
            connection: { type: Object, required: true }
        },

        created() {
            this.connection.from.node.$on('nodeMoved', this.handleNodeMoved);
            this.connection.to.node.$on('nodeMoved', this.handleNodeMoved);
        },

        destroyed() {
            this.connection.from.node.$off('nodeMoved', this.handleNodeMoved);
            this.connection.to.node.$off('nodeMoved', this.handleNodeMoved);
        },

        computed: {
            points() {
                const redraw = this.redraw;

                const pinFrom = this.connection.from.pin;
                const pinTo = this.connection.to.pin;

                const pointFrom = getElementCenterPoint(pinFrom.$refs['marker']);
                const pointTo = getElementCenterPoint(pinTo.$refs['marker']);

                return { from: pointFrom, to: pointTo };
            },

            width() {
                return this.connection.from.pin.data.type === 2 ? 3 : 2;
            }
        },

        methods: {
            handleNodeMoved() {
                this.redraw = !this.redraw;
            },

            serialize() {
                const data = {
                    connection: this.serializeConnection(this.connection)
                };

                return data;
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
            },
        }

    }

</script>