import * as mutations from '../vuex/mutations';
import MoveNodeContext from './context/MoveNodeContext';
import MoveRerouteNodeContext from './context/MoveRerouteNodeContext';

export default class {

    constructor(store) {
        this.store = store;
        this.prevMousePosition = null;

        this.store.watch(function(state) {
            return state.context;
        }, (newContext, oldContext) => {
            if (newContext instanceof MoveNodeContext) {
                this.enterMoveNodeContext(newContext, oldContext);
            }
            if (newContext instanceof MoveRerouteNodeContext) {
                this.enterMoveRerouteNodeContext(newContext, oldContext);
            }
            if (oldContext instanceof MoveNodeContext) {
                this.leaveMoveNodeContext(oldContext, newContext);
            }
            if (oldContext instanceof MoveRerouteNodeContext) {
                this.leaveMoveRerouteNodeContext(oldContext, newContext);
            }
        });
    }

    mainViewCreated() {

    }

    mainViewMounted() {

    }

    nodeCreated(node) {

    }

    nodeMounted(node) {
        const headerEl = node.$refs['node-header'];
        headerEl.addEventListener('mousedown', this.handleHeaderMouseDown.bind(this, node));
    }

    nodeDestroyed(node) {
        console.warn('Implement cleanup');
    }

    rerouteNodeMounted(node) {
        node.$el.addEventListener('mousedown', this.handleRerouteNodeMouseDown.bind(this, node));
    }

    rerouteNodeDestroyed(node) {
        node.$el.removeEventListener('mousedown', this.handleRerouteNodeMouseDown.bind(this, node));
    }

    handleHeaderMouseDown(node, e){
        e.stopPropagation();
        e.preventDefault();
        const context = new MoveNodeContext(node);
        this.store.commit(mutations.SET_CURRENT_CONTEXT, context);
    }

    handleRerouteNodeMouseDown(node, e){
        e.stopPropagation();
        e.preventDefault();
        const context = new MoveRerouteNodeContext(node);
        this.store.commit(mutations.SET_CURRENT_CONTEXT, context);
    }

    enterMoveNodeContext(context) {
        // if moved node is not in selected nodes, clear selected nodes
        if (this.store.state.selectedNodes.indexOf(context.node) === -1) {
            this.store.commit(mutations.SET_SELECTED_NODES, []);
        }

        this.registerMoveHandler();
    }

    enterMoveRerouteNodeContext(context) {
        // if moved node is not in selected nodes, clear selected nodes
        if (this.store.state.selectedRerouteNodes.indexOf(context.node) === -1) {
            this.store.commit(mutations.SET_SELECTED_REROUTE_NODES, []);
        }

        this.registerMoveHandler();
    }

    registerMoveHandler() {
        const moveHandler = this.handleMouseMove.bind(this);
        window.addEventListener('mousemove', moveHandler);

        window.addEventListener('mouseup', e => {
            e.stopPropagation();
            e.preventDefault();
            this.store.commit(mutations.SET_CURRENT_CONTEXT, null);
            window.removeEventListener('mousemove', moveHandler);
        }, { once: true });
    }

    leaveMoveNodeContext(context) {
        this.prevMousePosition = null;
    }

    leaveMoveRerouteNodeContext(context) {
        this.prevMousePosition = null;
    }

    handleMouseMove(e) {
        const context = this.store.state.context;

        if (!(context instanceof MoveNodeContext) && !(context instanceof MoveRerouteNodeContext)) {
            return;
        }

        if (!this.prevMousePosition) {
            this.prevMousePosition = {x: e.clientX, y: e.clientY};
            return;
        }

        const dx = e.clientX - this.prevMousePosition.x;
        const dy = e.clientY - this.prevMousePosition.y;

        let nodesToMove = [];

        if (this.store.state.selectedNodes.length) {
            nodesToMove = this.store.state.selectedNodes;
        } else if (context instanceof MoveNodeContext) {
            nodesToMove = [ context.node ];
        }

        nodesToMove.forEach(node => {
            node.posX += dx;
            node.posY += dy;
            node.$emit('nodeMoved', { newPos: { x: node.posX, y: node.posY } });
        });

        nodesToMove = [];

        if (this.store.state.selectedRerouteNodes.length) {
            nodesToMove = this.store.state.selectedRerouteNodes;
        } else if (context instanceof MoveRerouteNodeContext) {
            nodesToMove = [ context.node ];
        }

        // move reroute nodes
        nodesToMove.forEach(node => {
            node.point.x += dx;
            node.point.y += dy;
            node.$emit('nodeMoved', { newPos: { x: node.point.x, y: node.point.y } });
        });

        this.prevMousePosition = {x: e.clientX, y: e.clientY};
    }

    connectionPathCreated() {

    }

    connectionPathMounted() {

    }

    connectionPathDestroyed() {

    }

    rerouteNodeCreated() {

    }
}