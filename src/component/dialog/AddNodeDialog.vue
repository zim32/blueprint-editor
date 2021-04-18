<template>

    <v-dialog v-if="$store.state.config" v-bind="$attrs" v-model="localValue" :transition="false" scrollable>
        <v-card id="add-node-dialog">

            <v-card-text style="height: 600px; padding-top: 10px">
                <v-text-field ref="searchInput" autofocus v-model="searchQuery" autocomplete="off" solo label="Type to search..." append-icon="mdi-text-box-search"></v-text-field>

                <v-expansion-panels accordion tile multiple v-model="openedPanels">
                    <v-expansion-panel v-for="category in nodesTree" :key="category.name">
                        <v-expansion-panel-header>
                            {{ category.name }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-list dense flat>
                                <v-list-item-group>
                                    <v-list-item v-for="node in category.children" :key="node.name" @click="handleNodeSelected(node)">
                                        <v-list-item-content>
                                            <v-list-item-title style="text-transform: capitalize" v-html="itemTitle(node.name)"></v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>

        </v-card>

    </v-dialog>

</template>

<style>

    #add-node-dialog .v-expansion-panel {
        transition: none !important;
    }

    #add-node-dialog .v-expansion-panel-content {
        transition: none !important;
    }

    #add-node-dialog .v-expansion-panel-header {
        transition: none !important;
    }

    #add-node-dialog .v-card__text {
        padding: 0;
    }

</style>

<script>

    import {ADD_NODE_TO_VIEWPORT} from '../../vuex/mutations';
    import { cloneObject, isTypesCompatible } from '../../helpers/utils';
    import CreateNewConnectionContext from '../../plugins/context/CreateNewConnectionContext';

    export default {

        data() {
            return {
                openedPanels: [],
                searchQuery: ''
            }
        },

        props: ['value'],

        watch: {
            searchQuery(newVal) {
                if (newVal) {
                    this.$nextTick(() => {
                        this.openedPanels = Array.from(this.nodesTree.keys());
                    });
                } else {
                    this.openedPanels = [];
                }
            }
        },

        computed: {
            localValue: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);

                    if (!val) {
                        this.$emit('closed');
                    }
                }
            },

            searchQueryLowerCase(){
                return this.searchQuery.toLowerCase();
            },

            allNodes() {
                return this.$store.state.config.nodes;
            },

            context() {
                return this.$store.state.context;
            },

            filteredNodes() {
                let result = this.allNodes;

                if (this.context instanceof CreateNewConnectionContext) {
                    const initiatorPin = this.context.initiator.pin;

                    result = result.filter(item => {
                        const pinsToCheck = initiatorPin.type === 'input' ? item.outputs : item.inputs;

                        return pinsToCheck.some(input => {
                            return isTypesCompatible(this.context.initiator.pin.data.types, input.types);
                        });
                    });
                }

                if (this.searchQuery) {
                    result = result.filter(node => {
                        return node.name.toLowerCase().includes(this.searchQueryLowerCase);
                    });
                }

                return result;
            },

            allCategories() {
                return this.$store.state.config.categories;
            },

            nodesTree() {
                let result = [];

                this.allCategories.forEach(category => {
                    const categoryItem = { name: category, children: this.getNodesInCategory(category) };
                    result.push(categoryItem);
                });

                // filter empty categories
                result = result.filter(item => item.children.length);

                return result;
            }
        },

        methods: {
            getNodesInCategory(category) {
                return this.filteredNodes.filter(node => node.category === category);
            },

            handleNodeSelected(node) {
                const clone = cloneObject(node);
                this.$store.commit(ADD_NODE_TO_VIEWPORT, clone);
                this.$emit('nodeAdded', clone);
                this.localValue = false;
            },

            itemTitle(name) {
                if (!this.searchQuery) {
                    return name;
                }

                return name.toLowerCase().replace(this.searchQueryLowerCase, `<span style="background-color: darkkhaki; color: #333">${this.searchQuery}</span>`);
            }
        }

    }

</script>