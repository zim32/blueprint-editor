import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export function createRouter(routes) {
    let router = new VueRouter({
        routes: routes,
    });

    return router;
}