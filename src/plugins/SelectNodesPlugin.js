import SelectNodesContext from "./context/SelectNodesContext";
import * as mutations from "../vuex/mutations";

export default class {

    constructor(store, eventBus) {
        this.store = store;
        this.eventBus = eventBus;
        this.nodes = [];
        this.rerouteNodes = [];

        this.store.watch(function(state) {
            return state.context;
        }, (newContext, oldContext) => {
            if (newContext instanceof SelectNodesContext) {
                this.enterSelectNodesContext(newContext, oldContext);
            }
            if (oldContext instanceof SelectNodesContext) {
                this.leaveSelectNodesContext(oldContext, newContext);
            }
        });
    }

    mainViewCreated() {

    }

    mainViewMounted() {
        this.canvas = this.store.state.canvas;

        this.canvas.addEventListener('mousedown', e => {

            if (e.shiftKey) {
                return;
            }

            if (e.button !== 0) {
                return;
            }

            const context = new SelectNodesContext({x: e.clientX, y: e.clientY});
            this.store.commit(mutations.SET_CURRENT_CONTEXT, context);
        });
    }

    nodeCreated(node) {
        this.nodes.push(node);
    }

    nodeMounted() {

    }

    nodeDestroyed(node) {
        const idx = this.nodes.indexOf(node);

        if (idx !== -1) {
            this.nodes.splice(idx, 1);
        }
    }

    enterSelectNodesContext(context) {
        this.store.commit(mutations.SET_SELECTED_NODES, []);
        this.store.commit(mutations.SET_SELECTED_REROUTE_NODES, []);

        const moveHandler = e => {
            let x = context.startPosition.x;
            let y = context.startPosition.y;
            let w = e.clientX - context.startPosition.x;
            let h = e.clientY - context.startPosition.y;

            if (w < 0) {
                x = e.clientX;
                w = w * -1;
            }

            if (h < 0) {
                y = e.clientY;
                h = h * -1;
            }

            const bbox = { x, y, w, h, bottom: y + h, right: x + w };

            this.eventBus.$emit('updateSelectionBox', bbox);

            const selectedNodes = this.findSelectedNodes(bbox);
            const selectedRerouteNodes = this.findSelectedRerouteNodes(bbox);

            if (selectedNodes) {
                this.store.commit(mutations.SET_SELECTED_NODES, selectedNodes);
            }

            if (selectedRerouteNodes) {
                this.store.commit(mutations.SET_SELECTED_REROUTE_NODES, selectedRerouteNodes);
            }
        }

        this.canvas.addEventListener('mousemove', moveHandler);

        this.canvas.addEventListener('mouseup', () => {
            this.canvas.removeEventListener('mousemove', moveHandler);
            this.store.commit(mutations.SET_CURRENT_CONTEXT, null);
            this.eventBus.$emit('updateSelectionBox', null);
        }, { once: true });
    }

    leaveSelectNodesContext(context) {

    }

    findSelectedNodes(bbox) {
        return this.nodes.filter(node => this.intersects(bbox, node.$el.getBoundingClientRect()));
    }

    findSelectedRerouteNodes(bbox) {
        return this.rerouteNodes.filter(node => this.intersects(bbox, node.$el.getBoundingClientRect()));
    }

    intersects(outerBbox, innerBbox) {
        return innerBbox.x > outerBbox.x &&
            innerBbox.y > outerBbox.y &&
            innerBbox.right < outerBbox.right &&
            innerBbox.bottom < outerBbox.bottom;
    }

    connectionPathCreated() {

    }

    connectionPathMounted() {

    }

    connectionPathDestroyed() {

    }

    rerouteNodeCreated(node) {
        this.rerouteNodes.push(node);
    }

    rerouteNodeMounted() {

    }

    rerouteNodeDestroyed(node) {
        const idx = this.rerouteNodes.indexOf(node);

        if (idx !== -1) {
            this.rerouteNodes.splice(idx, 1);
        }
    }
}