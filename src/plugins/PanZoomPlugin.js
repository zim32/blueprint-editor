import * as mutations from '../vuex/mutations';
import PanViewportContext from './context/PanViewportContext';
import {VIEWPORT_STATE_INITIAL} from "../vuex/consts";
import {SET_VIEWPORT_POSITION} from "../vuex/mutations";

export default class {

    constructor(store) {
        this.store = store;
        this.canvas = null;

        this.store.watch(function(state) {
            return state.context;
        }, (newContext, oldContext) => {
            if (newContext instanceof PanViewportContext) {
                this.enterMoveNodeContext(newContext, oldContext);
            }
            if (oldContext instanceof PanViewportContext) {
                this.leaveMoveNodeContext(oldContext, newContext);
            }
        });
    }

    mainViewCreated() {

    }

    mainViewMounted() {
        this.canvas = this.store.state.canvas;

        this.canvas.addEventListener('mousedown', e => {
            if (e.shiftKey && e.button === 0) {
                const context = new PanViewportContext({x: e.clientX, y: e.clientY});
                this.store.commit(mutations.SET_CURRENT_CONTEXT, context);
            }
        });
    }

    nodeCreated() {

    }

    nodeMounted() {

    }

    nodeDestroyed() {

    }

    enterMoveNodeContext(context) {
        const prevMousePosition = {};

        const panViewportHandler = e => {
            if (!prevMousePosition.x) {
                prevMousePosition.x = e.clientX;
                prevMousePosition.y = e.clientY;
                return;
            }

            const dx = e.clientX - prevMousePosition.x;
            const dy = e.clientY - prevMousePosition.y;

            const newX = this.store.state.viewportX + dx;
            const newY = this.store.state.viewportY + dy;

            this.store.commit(SET_VIEWPORT_POSITION, { x: newX, y: newY });

            prevMousePosition.x = e.clientX;
            prevMousePosition.y = e.clientY;
        }

        this.canvas.addEventListener('mousemove', panViewportHandler);

        this.canvas.addEventListener('mouseup', () => {
            this.canvas.removeEventListener('mousemove', panViewportHandler);
            this.store.commit(mutations.SET_CURRENT_CONTEXT, null);
        }, { once: true });
    }

    leaveMoveNodeContext(context) {

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