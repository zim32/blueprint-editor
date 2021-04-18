<template>

    <div class="node" :style="nodeStyles" :class="nodeClasses">
        <div @click="$emit('click', $event)" ref="node-header" class="node-header d-flex" style="align-items: center" :style="nodeHeaderStyles()">
            <node-input v-if="mainExecPin(node.inputs)" ref="nodeInput" hide-name v-for="(input, idx) in [mainExecPin(node.inputs)]" :data="input" :key="input.name"></node-input>
            <div class="node-name mx-3" style="flex-grow: 1; text-align: center">{{ node.name }}</div>
            <node-output v-if="mainExecPin(node.outputs)" ref="nodeOutput" hide-name v-for="(output, idx) in [mainExecPin(node.outputs)]" :data="output" :key="output.name"></node-output>
        </div>

        <div style="display: flex; margin-top: 10px">
            <div style="flex-grow: 1">


<!--                <template v-if="node.name === 'integer'">-->
<!--                    <input type="number" v-model="privateData.value" :title="privateData.value" placeholder="0" style="width: 60px; margin-left: 10px" />-->
<!--                </template>-->

<!--                <template v-if="node.name === 'float'">-->
<!--                    <input type="text" v-model="privateData.value" :title="privateData.value" placeholder="0.0" style="width: 60px; margin-left: 10px" />-->
<!--                </template>-->

<!--                <template v-if="node.name === 'string'">-->
<!--                    <input type="text" v-model="privateData.value" :title="privateData.value" placeholder="" style="width: 60px; margin-left: 10px" />-->
<!--                </template>-->


                <node-input ref="nodeInput" v-for="input in otherExecPins(node.inputs)" :key="input.name" :data="input"></node-input>
                <node-input ref="nodeInput" v-for="input in dataPins(node.inputs)" :key="input.name" :data="input"></node-input>
            </div>
            <div style="flex-grow: 1; padding-left: 40px">
                <node-output ref="nodeOutput" v-for="output in otherExecPins(node.outputs)" :key="output.name" :data="output"></node-output>
                <node-output ref="nodeOutput" v-for="output in dataPins(node.outputs)" :key="output.name" :data="output"></node-output>
            </div>
        </div>
    </div>

</template>

<style>

    .node {
        position: absolute;
        /*height: 200px;*/
        background-color: #111;
        border-radius: 5px;
        box-shadow: 0 6px 6px -2px rgba(0, 0, 0, 0.8);
        user-select: none;
        cursor: default;
        color: #ccc;
        border: 1px solid transparent;
    }

    .node.selected {
        border-color: #888;
    }

    .node > .node-header {
        background-color: #333;
        background-image: linear-gradient(120deg, transparent, rgba(0,0,0,0.6));
        padding: 8px 0 8px 0;
        font-size: 0.9rem;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
        border-radius: 5px 5px 0 0;
        text-transform: capitalize;
    }

    .node > .node-header .node-name {
        white-space: nowrap;
    }

    .node .node-input {
        display: flex;
        align-items: center;
        padding: 5px 0 5px 0;
        position: relative;
    }

    .node .node-output {
        display: flex;
        align-items: center;
        padding: 5px 0 5px 0;
        position: relative;
    }

    .node .node-marker-wrapper {
        width: 20px;
        height: 20px;
        position: absolute;
        cursor: crosshair;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .node .node-marker {
        width: 12px;
        height: 12px;
        border-radius: 6px;
        /*position: absolute;*/
    }

    .node .node-input .node-marker-wrapper {
        left: -10px;
    }

    .node .node-output .node-marker-wrapper {
        right: -10px;
    }

    .node .node-input .node-marker {
        /*left: -6px;*/
    }

    .node .node-output .node-marker {
        /*right: -6px;*/
    }

    .node .node-label {
        font-size: 0.9rem;
        margin-left: 6px;
        text-transform: capitalize;
        white-space: nowrap;
    }

    .node .node-input .node-label {
        margin-left: 15px;
        margin-right: 8px;
    }

    .node .node-output .node-label {
        margin-right: 15px;
    }

    .node input{
        background-color: #ccc;
        border-radius: 3px;
        padding: 0 4px 0 4px;
    }

    .node select {
        background-color: #ccc;
        border-radius: 3px;
        padding: 0 4px 0 4px;
    }

</style>

<script>

    import NodeInput from './NodeInput.vue';
    import NodeOutput from './NodeOutput.vue';

    export default {

        components: { NodeInput, NodeOutput },

        data() {
            return {
                posX: 400,
                posY: 400,
                connections: [],
                privateData: {},
            }
        },

        props: {
            node: { type: Object, required: true }
        },

        inject: ['plugins'],

        created() {
            this.posX = this.node.initialX || this.ctxMenuX - this.viewportX;
            this.posY = this.node.initialY || this.ctxMenuY - this.viewportY;

            this.plugins.forEach(i => i.nodeCreated(this));
        },

        mounted() {
            this.plugins.forEach(i => i.nodeMounted(this));
        },

        destroyed() {
            this.plugins.forEach(i => i.nodeDestroyed(this));
        },

        computed: {
            nodeStyles() {
                return {
                    left: this.posX + 'px',
                    top: this.posY + 'px',
                }
            },
            nodeClasses() {
                const classes = { 'selected': false };

                if (this.selectedNodes.some(item => {
                    return item === this;
                })) {
                    classes.selected = true;
                }

                return classes;
            },
            svg() {
                return this.$store.state.svg;
            },
            svgNewConnection() {
                return this.$store.state.svgNewConnection;
            },
            viewportX() {
                return this.$store.state.viewportX;
            },
            viewportY() {
                return this.$store.state.viewportY;
            },
            ctxMenuX() {
                return this.$store.state.contextMenuMouseX
            },
            ctxMenuY() {
                return this.$store.state.contextMenuMouseY;
            },
            selectedNodes() {
                return this.$store.state.selectedNodes;
            }
        },

        methods: {
            nodeHeaderStyles() {
                return {
                    backgroundColor: this.node.nodeColor
                }
            },

            serialize() {
                const data = {
                    node: this.node,
                    posX: this.posX,
                    posY: this.posY,
                    inputs: [],
                    outputs: [],
                    privateData: this.privateData
                };

                if (this.$refs['nodeInput']) {
                    data.inputs = this.$refs['nodeInput'].map(i => i.serialize());
                }
                if (this.$refs['nodeOutput']) {
                    data.outputs = this.$refs['nodeOutput'].map(i => i.serialize());
                }

                return data;
            },

            dataPins(pins) {
                return pins.filter(item => item.type === 1);
            },

            execPins(pins) {
                return pins.filter(item => item.type === 2);
            },

            mainExecPin(pins) {
                const execPins = this.execPins(pins);

                if (!execPins.length) {
                    return null;
                }

                if (execPins.length > 1) {
                    return null;
                }

                return execPins[0];
            },

            otherExecPins(pins) {
                const execPins = this.execPins(pins);

                if (execPins.length > 1) {
                    return execPins;
                }

                return [];
            },

            findPinByName(name, type) {
                const candidates = type === 'input' ? this.$refs['nodeInput'] : this.$refs['nodeOutput'];
                return candidates.find(item => item.data.name === name);
            }
        }

    }

</script>