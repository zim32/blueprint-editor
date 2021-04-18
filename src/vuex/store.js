import * as mutations from './mutations';
import * as actions from './actions';
import { v4 as uuidv4 } from 'uuid';
import DataProviderPlugin from '../plugins/DataProviderPlugin';

import {
    selectInputPinFromConnection,
    selectOutputPinFromConnection,
    isConnectionValid
} from '../helpers/utils';

const dataProvider = new DataProviderPlugin();

export function createStore(Vuex, plugins) {

    return new Vuex.Store({
        plugins: plugins,

        state: {
            config: null,
            viewportX: 0,
            viewportY: 0,
            context: null,
            contextMenuMouseX: 0,
            contextMenuMouseY: 0,
            showAddNodeDialog: false,
            addNodeDialog: null,
            selectedNodes: [],
            selectedRerouteNodes: [],
            svgEventsEnabled: true,
            mainView: null,
            canvas: null,
            viewport: null,
            svg: null,
            svgNewConnection: null,
            nodes: [],
            connections: [],
            reroutePoints: [],
            connectionInitiator: {
                node: null,
                pin: null
            },
            variables: []
        },

        mutations: {
            [mutations.SET_CURRENT_CONTEXT](state, payload) {
                state.context = payload;
            },

            [mutations.SET_VIEWPORT_STATE](state, payload) {
                state.viewportState = payload;
            },

            [mutations.SET_CONFIG](state, payload) {
                state.config = payload;
            },

            [mutations.ADD_VARIABLE](state, payload) {
                state.variables.push(payload);
            },

            [mutations.ADD_NODE_TO_VIEWPORT](state, payload) {
                if (!payload.hasOwnProperty('id')) {
                    payload['id'] = uuidv4();
                }
                state.nodes.push(payload);
            },

            [mutations.REMOVE_NODE_FROM_VIEWPORT](state, nodeID) {
                const idx = state.nodes.findIndex(node => node.id === nodeID);
                const node = state.nodes[idx];

                if (idx !== -1) {
                    state.nodes.splice(idx, 1);

                    // remove connections
                    const connectionsToRemove = state.connections.filter(conn => {
                        return conn.from.node.node.id === nodeID || conn.to.node.node.id === nodeID;
                    });

                    connectionsToRemove.forEach(conn => {
                        const idx = state.connections.indexOf(conn);

                        if (idx !== -1) {
                            state.connections.splice(idx, 1);
                        }
                    });
                }
            },

            [mutations.SET_CONNECTION_INITIATOR](state, payload) {
                state.connectionInitiator = payload;
            },

            [mutations.SET_CTX_MENU_MOUSE_POSITION](state, payload) {
                state.contextMenuMouseX = payload.x;
                state.contextMenuMouseY = payload.y;
            },

            [mutations.SHOW_ADD_NODE_DIALOG](state, payload) {
                state.showAddNodeDialog = payload;
            },

            [mutations.SET_SELECTED_NODES](state, payload) {
                state.selectedNodes = payload;
            },

            [mutations.SET_SELECTED_REROUTE_NODES](state, payload) {
                state.selectedRerouteNodes = payload;
            },

            [mutations.SET_SVG_EVENTS_ENABLED](state, payload) {
                state.svgEventsEnabled = payload;
            },

            [mutations.ADD_REROUTE_POINT](state, payload) {
                state.reroutePoints.push(payload);
            },

            [mutations.ADD_CONNECTION](state, payload) {
                if (!payload.hasOwnProperty('id')) {
                    payload['id'] = uuidv4();
                }

                // clear existing connection for input pin
                const inPin = selectInputPinFromConnection(payload);

                let existingConnection = state.connections.find(c => {
                    return c.from.pin === inPin || c.to.pin === inPin;
                });

                if (existingConnection) {
                    const idx = state.connections.indexOf(existingConnection);

                    if (idx !== -1) {
                        state.connections.splice(idx, 1);
                    }
                }

                // if output pin is exec pin, remove all exec connections for this node and this pin
                const outPin = selectOutputPinFromConnection(payload);

                if (outPin.data.type === 2) {
                    let existingConnection = state.connections.find(c => {
                        return c.from.node === payload.from.node && c.from.pin === outPin;
                    });

                    if (existingConnection) {
                        const idx = state.connections.indexOf(existingConnection);

                        if (idx !== -1) {
                            state.connections.splice(idx, 1);
                        }
                    }
                }


                state.connections.push(payload);
            },

            [mutations.REMOVE_CONNECTION](state, connectionID) {
                const idx = state.connections.findIndex(conn => conn.id === connectionID);

                if (idx !== -1) {
                    state.connections.splice(idx, 1);
                }
            },

            [mutations.SET_VIEWPORT_POSITION](state, payload) {
                state.viewportX = payload.x;
                state.viewportY = payload.y;
            },

            [mutations.REVALIDATE_CONNECTIONS_FOR_NODE](state, node) {
                const connections = state.connections.filter(c => {
                    return c.from.node === node || c.to.node === node;
                });

                connections.forEach(c => {
                    if(!isConnectionValid(c)) {
                        const idx = state.connections.findIndex(conn => conn.id === c.id);

                        if (idx !== -1) {
                            state.connections.splice(idx, 1);
                        }
                    }
                });
            }
        },

        actions: {
            async [actions.DUMP_STATE](context) {
                const mainView = context.state.mainView;

                const nodes        = (mainView.$refs['nodes'] || []).map(n => n.serialize());
                const connections  = (mainView.$refs['connections'] || []).map(n => n.serialize());
                const rerouteNodes = context.state.reroutePoints;
                const variables    = context.state.variables;

                return {
                    nodes,
                    connections,
                    rerouteNodes,
                    variables
                };
            },

            [actions.RESTORE_STATE](context, data) {
                return new Promise(async (resolve, reject) => {
                    const mainView = context.state.mainView;

                    context.state.nodes = [];
                    context.state.connections = [];
                    context.state.reroutePoints = [];
                    context.state.selectedNodes = [];
                    context.state.selectedRerouteNodes = [];
                    context.state.variables = [];

                    data.nodes.forEach(node => {
                        node.node.initialX = node.posX;
                        node.node.initialY = node.posY;
                        context.commit(mutations.ADD_NODE_TO_VIEWPORT, node.node);
                    });

                    data.variables = data.variables || [];

                    data.variables.forEach(variable => {
                        context.commit(mutations.ADD_VARIABLE, variable);
                    });

                    mainView.$nextTick(() => {
                        data.connections.forEach(conn => {
                            const c = { from: {}, to: {}, id: conn.connection.id };

                            c.from.node = mainView.findNodeById(conn.connection.from.node);
                            c.from.pin  = c.from.node.findPinByName(conn.connection.from.pin, 'output');
                            c.to.node   = mainView.findNodeById(conn.connection.to.node);
                            c.to.pin    = c.to.node.findPinByName(conn.connection.to.pin, 'input');

                            context.commit(mutations.ADD_CONNECTION, c);
                        });

                        mainView.$nextTick(() => {
                            data.rerouteNodes.forEach(node => {
                                context.commit(mutations.ADD_REROUTE_POINT, node);
                            });
                        });

                        resolve();
                    });

                });
            }
        }

    });

}