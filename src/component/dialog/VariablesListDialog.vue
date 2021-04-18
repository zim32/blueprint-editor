<template>

    <v-dialog v-if="$store.state.config" v-bind="$attrs" v-model="localValue" :transition="false" scrollable>
        <v-card id="variables-list-dialog">
            <v-card-text>

                <div class="my-3">
                    <v-btn depressed @click="handleAddVariable"><v-icon>mdi-plus</v-icon> Add variable</v-btn>
                </div>

                <v-data-table :headers="headers" :items="variables" dense>

                    <template #item.name="{item}">
                        <v-text-field v-model="item.name"></v-text-field>
                    </template>

                    <template #item.isArray="{item}">
                        <input type="checkbox" v-model="item.isArray" />
                    </template>

                    <template #item.type="{item}">
                        <v-autocomplete :items="allTypes" item-text="type" return-object v-model="item.type"></v-autocomplete>
                    </template>

                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<style>

    #variables-list-dialog table tr:hover {
        background-color: transparent !important;
    }

</style>

<script>

    import * as mutations from '../../vuex/mutations';

    export default {

        data() {
            return {
                headers: [
                    {
                        text: 'Name',
                        value: 'name'
                    },
                    {
                        text: 'Type',
                        value: 'type'
                    },
                    {
                        text: 'Array',
                        value: 'isArray'
                    },
                ],
            }
        },

        props: {
            value: { required: true }
        },

        computed: {
            localValue: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            variables() {
                return this.$store.state.variables;
            },
            allTypes() {
                return Object.values(this.$store.state.config.typesHashMap);
            }
        },

        methods: {
            handleAddVariable() {
                this.$store.commit(mutations.ADD_VARIABLE, {
                    name: 'New variable...',
                    type: null,
                    isArray: false,
                });
            }
        }
    }

</script>