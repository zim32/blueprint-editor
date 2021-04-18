<template>

    <g>
        <path @dblclick="handleDblClick" pointer-events="visiblePainted" @mouseenter="hover=true" @mouseleave="hover=false" ref="path" :d="pathAttribute" :stroke="color" :stroke-width="localWidth" fill="none"></path>
        <reroute-node @nodeMoved="handleRerouteNodeMoved" v-for="(point, idx) in reroutePoints" :key="idx" :point="point"></reroute-node>
    </g>


</template>

<style>

</style>

<script>

    import { cloneObject } from '../../helpers/utils';
    import * as mutations from '../../vuex/mutations';
    import RerouteNode from './RerouteNode';

    export default {

        components: { RerouteNode },

        data() {
            return {
                pathAttribute: '',
                hover: false,
            }
        },

        inject: ['plugins'],

        props: {
            points: { type: Object, required: true },
            color: { type: String, required: false, default: '#888' },
            forceRedraw: { type: Boolean, required: false, default: false },
            width: { type: Number, required: false, default: 3 },
            connectionID: { type: String, required: false }
        },

        watch: {
            points(newPoints){
                this.drawPath(newPoints.from, newPoints.to);
            },
            // forceRedraw() {
            //     this.drawPath(this.points.from, this.points.to);
            // },
            reroutePoints(newVal) {
                this.$emit('redraw');
            }
        },

        created() {
            this.plugins.forEach(i => i.connectionPathCreated(this));
        },

        mounted() {
            this.drawPath(this.points.from, this.points.to);
            this.drawReroutePoints();

            this.plugins.forEach(i => i.connectionPathMounted(this));
        },

        destroyed() {
            this.plugins.forEach(i => i.connectionPathDestroyed(this));
        },

        computed: {
            viewportX() {
                return this.$store.state.viewportX;
            },
            viewportY() {
                return this.$store.state.viewportY;
            },
            localWidth() {
                return this.hover ? this.width + 2 : this.width;
            },
            svgEventsEnabled() {
                return this.$store.state.svgEventsEnabled;
            },
            reroutePoints() {
                return this.$store.state.reroutePoints.filter(item => item.connectionID === this.connectionID);
            }
        },

        methods: {
            drawPath(from, to) {
                if (!this.$refs['path']) {
                    return '';
                }

                if (!from || !to) {
                    return '';
                }

                from = cloneObject(from);
                to = cloneObject(to);

                let points = this.generatePoints(from, to);

                // convert points to path
                this.pathAttribute = this.pointsToPath(points);
            },

            drawReroutePoints() {

            },

            generatePoints(from, to) {
                let points = [];

                points.push(from);

                const reroutePoints = this.reroutePoints.map(item => {
                    return { x: item.x, y: item.y, reroute: true }
                });

                points = [...points, ...reroutePoints];

                points.push(to);

                // handle panning (convert to svg coordinates)
                points.forEach(p => {
                    if (!p.reroute) {
                        p.x -= this.viewportX;
                        p.y -= this.viewportY;
                    }
                });

                return points;
            },

            pointsToPath(points) {
                if (points.length < 2) {
                    return '';
                }

                let result = `M${points[0].x} ${points[0].y}`;

                let bezie = [];

                for(let x = 1; x < points.length; x++) {
                    const curr = points[x];
                    const prev = points[x-1];
                    const dx = curr.x - prev.x;

                    let element = {
                        ctrl1: { x: prev.x + dx*0.4, y: prev.y },
                        ctrl2: { x: curr.x - dx*0.4, y: curr.y },
                        p: curr
                    };

                    bezie.push(element);
                }

                bezie.forEach(i => {
                   result += ` C${i.ctrl1.x} ${i.ctrl1.y}, ${i.ctrl2.x} ${i.ctrl2.y}, ${i.p.x} ${i.p.y}`;
                });

                return result;
            },

            handleDblClick(e) {
                this.$store.commit(mutations.ADD_REROUTE_POINT, {x: e.clientX - this.viewportX, y: e.clientY - this.viewportY, connectionID: this.connectionID});
                this.$emit('redraw');
                // this.drawPath(this.points.from, this.points.to);
            },

            handleRerouteNodeMoved() {
                this.$emit('redraw');
                // this.drawPath(this.points.from, this.points.to);
            }
        }
    }

</script>