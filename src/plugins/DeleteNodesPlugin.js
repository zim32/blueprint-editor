import * as mutations from '../vuex/mutations';

export default class {

    constructor(store) {
        this.store = store;
    }

    mainViewCreated() {

    }

    mainViewMounted(mainView) {
        window.addEventListener('keypress', e => {
            if (e.code === 'Delete') {
                const selectedNodes = this.store.state.selectedNodes;

                selectedNodes.forEach(node => {
                    this.store.commit(mutations.REMOVE_NODE_FROM_VIEWPORT, node.node.id);
                });
            }
        });
    }

    nodeCreated() {

    }

    nodeMounted() {

    }

    nodeDestroyed() {

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