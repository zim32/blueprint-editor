import CreateNewConnectionContext from './context/CreateNewConnectionContext';
import * as mutations from '../vuex/mutations';
import { getElementCenterPoint } from '../helpers/dom';
import { selectInputPin, selectOutputPin, findFirstCompatibleNodePins, canCreateConnection } from '../helpers/utils';

export default class {

    constructor(store, eventBus) {
        this.store = store;
        this.eventBus = eventBus;

        this.store.watch(function(state) {
            return state.context;
        }, (newContext, oldContext) => {
            if (newContext instanceof CreateNewConnectionContext) {
                this.enterCreateConnectionContext(newContext, oldContext);
            }
            if (oldContext instanceof CreateNewConnectionContext) {
                this.leaveCreateConnectionContext(oldContext, newContext);
            }
        });
    }

    mainViewCreated() {

    }

    mainViewMounted() {

    }

    nodeCreated(node) {
        // next tick here is to access node $refs
        node.$nextTick(() => {
            const context = this.store.state.context;

            if (!(context instanceof CreateNewConnectionContext)) {
                return;
            }

            if (!context.newNode) {
                return;
            }

            if (node.node.hash === context.newNode.hash) {
                let pairs = [];

                if (context.initiator.pin.type === 'output') {
                    pairs = findFirstCompatibleNodePins(context.initiator.node, node);
                } else {
                    pairs = findFirstCompatibleNodePins(node, context.initiator.node);
                }

                pairs.forEach(pair => {
                    this.addConnection({ node: pair[0].$parent, pin: pair[0] }, { node: pair[1].$parent, pin: pair[1] });
                });

                this.store.commit(mutations.SET_CURRENT_CONTEXT, null);
            }
        });
    }

    nodeMounted(node) {
        if (node.$refs['nodeInput']) {
            node.$refs['nodeInput'].forEach(pin => {
                this.initPin(pin, node);
            });
        }

        if (node.$refs['nodeOutput']) {
            node.$refs['nodeOutput'].forEach(pin => {
                this.initPin(pin, node);
            });
        }


    }

    nodeDestroyed() {

    }

    initPin(pin, node) {
        if (!pin.$refs['marker']) {
            // marker is hidden
            return;
        }

        const el = pin.$el;

        el.addEventListener('mousedown', this.handleMouseDown.bind(this, pin, node));
        el.addEventListener('mouseenter', this.handleMouseEnter.bind(this, pin, node));
        // el.addEventListener('mouseleave', this.handleMouseLeave.bind(this, pin));
    }

    handleMouseDown(pin, node, e) {
        e.stopPropagation();
        const context = new CreateNewConnectionContext(node, pin);
        this.store.commit(mutations.SET_CURRENT_CONTEXT, context);
    }

    handleMouseMove(context, e) {
        const start = getElementCenterPoint(context.initiator.pin.$refs['marker']);
        this.eventBus.$emit('updateNewConnectionPoints', {from: start, to: { x: e.clientX, y: e.clientY } });
    }

    handleMouseEnter(pin, node, e) {
        const context = this.store.state.context;

        if (!(context instanceof CreateNewConnectionContext)) {
            return;
        }

        const initiator = context.initiator;

        if (!initiator.node) {
            return;
        }

        // prevent self connection
        if (initiator.node === node) {
            return;
        }

        const inPin  = selectInputPin(initiator.pin, pin);
        const outPin = selectOutputPin(initiator.pin, pin);

        if (this.canCreateConnection(outPin, inPin)) {
            this.eventBus.$emit('updateNewConnectionColor', 'green');

            e.target.addEventListener('mouseup', () => {
                this.addConnection(initiator, { node, pin });
            }, { once: true });

        } else {
            this.eventBus.$emit('updateNewConnectionColor', 'red')
        }
    }

    enterCreateConnectionContext(context) {
        this.store.commit(mutations.SET_SVG_EVENTS_ENABLED, false);

        let moveHandler = this.handleMouseMove.bind(this, context);
        window.addEventListener('mousemove', moveHandler);

        window.addEventListener('mouseup', e => {
            if (e.target.tagName === 'path') {
                this.store.commit(mutations.SET_CTX_MENU_MOUSE_POSITION, { x: e.clientX, y: e.clientY });
                this.store.commit(mutations.SHOW_ADD_NODE_DIALOG, true);

                this.store.state.addNodeDialog.$once('nodeAdded', newNode => {
                    context.newNode = newNode;
                    // this.addConnection(initiator, { node: newNode, newNode });
                });

                this.store.state.addNodeDialog.$once('closed', () => {
                    setTimeout(() => {
                        this.store.commit(mutations.SET_CURRENT_CONTEXT, null);
                    }, 1000);
                });

                window.removeEventListener('mousemove', moveHandler);
            } else {
                window.removeEventListener('mousemove', moveHandler);
                this.store.commit(mutations.SET_CURRENT_CONTEXT, null);
            }
        }, { once: true });
    }

    leaveCreateConnectionContext() {
        this.eventBus.$emit('updateNewConnectionPoints', { from: { x:0, y:0 }, to: { x:0, y:0 } });
        this.eventBus.$emit('updateNewConnectionColor', '#888');
        this.store.commit(mutations.SET_SVG_EVENTS_ENABLED, true);
    }

    canCreateConnection(inPin, outPin) {
        return canCreateConnection(inPin.data, outPin.data);
    }

    addConnection(from, to) {
        let connection;

        if (selectInputPin(from.pin, to.pin) === from.pin) {
            connection = {
                from: { node: to.node, pin: to.pin },
                to: { node: from.node, pin: from.pin }
            };
        } else {
            connection = {
                from: { node: from.node, pin: from.pin },
                to: { node: to.node, pin: to.pin }
            };
        }

        this.store.commit(mutations.ADD_CONNECTION, connection);
    }

    connectionPathCreated() {

    }

    connectionPathMounted() {

    }

    connectionPathDestroyed() {

    }

    rerouteNodeCreated() {

    }

    rerouteNodeMounted() {

    }

    rerouteNodeDestroyed() {

    }
}