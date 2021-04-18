import Vue from 'vue';
import Vuex from 'vuex';
import vuetify from './plugins/vuetify';
import routes from './routes';
import {createRouter} from './routes/router';
import {createStore} from './vuex/store';
import Main from './component/layout/Main.vue';
import Application from './application';
import { SET_CONFIG } from './vuex/mutations';

import TestPlugin from './plugins/TestPlugins';
import MoveNodesPlugin from './plugins/MoveNodesPlugin';
import CreateConnectionsPlugin from './plugins/CreateConnectionsPlugin';
import SelectNodesPlugin from './plugins/SelectNodesPlugin';
import PanZoomPlugin from './plugins/PanZoomPlugin';
import DeleteNodesPlugin from './plugins/DeleteNodesPlugin';

Vue.use(Vuex);

const store = createStore(Vuex, []);
window.vueStore = store;

let options = {routes};

const router = createRouter(options.routes);

const eventBus = new Vue({});

const plugins = [
    new TestPlugin(store, eventBus),
    new MoveNodesPlugin(store, eventBus),
    new CreateConnectionsPlugin(store, eventBus),
    new SelectNodesPlugin(store, eventBus),
    new PanZoomPlugin(store, eventBus),
    new DeleteNodesPlugin(store, eventBus),
];

const app = new Application(store);

new Vue({
    router : router,
    store  : store,
    vuetify: vuetify,
    async mounted() {
        const config = await app.loadConfig();
        store.commit(SET_CONFIG, config);
        app.run();
    },
    render : function (h) {
        return h(Main)
    },
    provide: () => {
        return {
            plugins : plugins,
            eventBus: eventBus,
            app: app
        }
    },
}).$mount('#app');