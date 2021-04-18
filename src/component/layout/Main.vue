<template>

    <v-app id="inspire" dark>

        <div class="d-flex grey darken-3 elevation-6" style="z-index: 1">
            <v-btn @click="handleShowAddNodeDialog" text dark large>Add node</v-btn>
            <v-btn @click="showVariablesListDialog=true" class="ml-2" text dark large>Variables</v-btn>
            <v-btn @click="handleSave" text dark large class="ml-2">Save</v-btn>
        </div>

        <div
            ref="canvas"
            id="canvas"
            @contextmenu.prevent="handleShowAddNodeDialog"
            :class="canvasClasses"
        >

            <svg id="svg-viewport" ref="svg" width="100vw" height="100vh" pointer-events="none">
                <selection-box></selection-box>
                <connection-path
                    ref="newConnection"
                    :points="newConnectionPoints"
                    :color="newConnectionColor"
                    :vpX="viewportPosX"
                    :vpY="viewportPosY"
                ></connection-path>

                <nodes-connection ref="connections" v-for="item in connections" :connection="item" :key="item.id"></nodes-connection>
            </svg>


            <div ref="viewport" id="viewport" :style="viewportStyles">
                <node
                    ref="nodes"
                    v-for="node in nodes"
                    :key="node.id"
                    :node="node"
                >
                </node>
            </div>

        </div>

        <add-node-dialog ref="addNodeDialog" v-model="showAddNodeDialog" :width="500"></add-node-dialog>
        <variables-list-dialog v-model="showVariablesListDialog" :width="1200"></variables-list-dialog>

    </v-app>

</template>

<style>

html, body {
    padding: 0;
    margin: 0;
    overflow: hidden;
}

::-webkit-scrollbar {
    width: 2px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}

::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    outline: 1px solid slategrey;
}

#canvas {
    position: absolute;

    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    overflow: hidden;

    background: #333;
    background-image: linear-gradient(rgba(0, 0, 0, .1) .1em, transparent .1em), linear-gradient(90deg, rgba(0, 0, 0, .1) .1em, transparent .1em);
    background-size: 1em 1em;
}

#canvas.panning {
    cursor: pointer;
}

#svg-viewport {
    position: fixed;
}

#viewport {
    will-change: transform;
    position: absolute;

    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
}

</style>

<script>

import Node from '../node/Node.vue';

import * as mutations from '../../vuex/mutations';

import AddNodeDialog from '../dialog/AddNodeDialog.vue';
import VariablesListDialog from '../dialog/VariablesListDialog';
import ConnectionPath from '../../component/svg/ConnectionPath.vue';
import NodesConnection from '../../component/svg/NodesConnection.vue';
import SelectionBox from '../../component/svg/SelectionBox';

import PanViewportContext from '../../plugins/context/PanViewportContext';

export default {

    mixins: [],

    components: { Node, AddNodeDialog, ConnectionPath, NodesConnection, SelectionBox, VariablesListDialog },

    data() {
        return {
            viewportScale: 1,
            newConnectionPoints: { from: {x:0 , y:0}, to: {x:0 , y:0} },
            newConnectionColor: '#888',
            showVariablesListDialog: false
        }
    },

    inject: ['plugins', 'eventBus', 'app'],

    async created() {
        this.plugins.forEach(i => i.mainViewCreated(this));
    },

    mounted() {
        this.$store.state.mainView         = this;
        this.$store.state.svg              = this.$refs['svg'];
        this.$store.state.svgNewConnection = this.$refs['newConnection'];
        this.$store.state.addNodeDialog    = this.$refs['addNodeDialog'];
        this.$store.state.canvas           = this.$refs['canvas'];
        this.$store.state.viewport         = this.$refs['viewport'];

        this.plugins.forEach(i => i.mainViewMounted(this));

        this.eventBus.$on('updateNewConnectionPoints', data => {
            this.newConnectionPoints = data;
        });

        this.eventBus.$on('updateNewConnectionColor', data => {
            this.newConnectionColor = data;
        });

        // set initial svg viewbox
        this.updateSvgViewBox();
    },

    computed: {
        nodes() {
            return this.$store.state.nodes;
        },

        connections() {
            return this.$store.state.connections;
        },

        viewportStyles() {
            return {
                transform: `translate(${this.viewportPosX}px, ${this.viewportPosY}px) scale(${this.viewportScale})`
            }
        },

        currentContext() {
            return this.$store.state.context;
        },

        canvasClasses() {
            const classes = {
                panning: false
            }

            if (this.currentContext instanceof PanViewportContext) {
                classes.panning = true;
            }

            return classes;
        },

        viewportPosX() {
            return this.$store.state.viewportX;
        },

        viewportPosY() {
            return this.$store.state.viewportY;
        },

        showAddNodeDialog: {
            get() {
                return this.$store.state.showAddNodeDialog;
            },
            set(val) {
                this.$store.commit(mutations.SHOW_ADD_NODE_DIALOG, val);
            }
        }
    },

    watch: {
        viewportPosX() {
            this.updateSvgViewBox();
        },
        viewportPosY() {
            this.updateSvgViewBox();
        }
    },

    methods: {
        updateSvgViewBox() {
            const svg = this.$refs['svg'];

            if (!svg) {
                return;
            }

            const svgWidth = svg.clientWidth
            const svgHeight = svg.clientHeight

            const viewbox = `${-this.viewportPosX} ${-this.viewportPosY} ${svgWidth} ${svgHeight}`;
            svg.setAttribute('viewBox', viewbox);
        },

        async handleSave() {
            try {
                await this.app.saveState();
                alert('Data saved');
            } catch (e) {
                alert('Error. Can not save data. See dev console');
                throw e;
            }
        },

        handleShowAddNodeDialog(e) {
            this.$store.commit(mutations.SET_CTX_MENU_MOUSE_POSITION, { x: e.clientX, y: e.clientY });
            this.showAddNodeDialog = true;
        },

        findNodeById(id) {
            return this.$refs['nodes'].find(item => item.node.id === id);
        }
    }
}

</script>