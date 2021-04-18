<template>

    <div>
        <div v-if="!data.isHidden" class="node-input">
            <div v-if="!data.isMarkerHidden" class="node-marker-wrapper" :title="markerTitle">
                <div ref="marker" class="node-marker" :style="pinStyles"></div>
            </div>
            <div v-if="!hideName" class="node-label">{{ data.name }}</div>
            <template v-if="!connection && inputControl"><component class="ml-auto" :is="inputControl" v-model="data.runtimeValue"></component></template>
        </div>
        <div v-else></div>
    </div>

</template>

<style>

    .node-input .number-control, .node-input .string-control {
        transition: width 50ms ease-out;
    }

    .node-input .number-control:focus {
        width: 120px !important;
    }

    .node-input .string-control:focus {
        width: 200px !important;
    }

</style>


<script>

    import IntegerControl from '../controls/Integer';
    import FloatControl from '../controls/Float';
    import StringControl from '../controls/String';
    import BooleanControl from '../controls/Boolean';
    import VariableSelectControl from '../controls/VariableSelect';

    import * as mutations from '../../vuex/mutations';

    export default {

        name: 'NodeInput',

        data() {
            return {
                type: 'input',
            }
        },

        props: {
            data: { type: Object, required: true },
            hideName: { type: Boolean, required: false, default: false },
        },

        watch: {
            'data.runtimeValue': function(newVal) {
                const parentNode = this.$parent.node;

                if (parentNode.category === 'Variables') {
                    const variable = this.$store.state.variables[newVal];

                    let typeName = variable.type.type;

                    if (variable.isArray) {
                        typeName = `Array<${typeName}>`;
                    }

                    if (parentNode.name === 'setVariable' ) {
                        if (this.data.name === 'name') {
                            parentNode.inputs[1].types = [ { type: typeName, flags: 0, compatibleTypes: [typeName] } ];
                            this.$store.commit(mutations.REVALIDATE_CONNECTIONS_FOR_NODE, this.$parent);
                        }
                    }
                    if (parentNode.name === 'getVariable' ) {
                        if (this.data.name === 'name') {
                            parentNode.outputs[0].types = [ { type: typeName, flags: 0, compatibleTypes: [typeName] } ];
                            this.$store.commit(mutations.REVALIDATE_CONNECTIONS_FOR_NODE, this.$parent);
                        }
                    }
                }
            }
        },

        computed: {
            connection() {
                return this.$store.state.connections.find(c => {
                    return c.to.node === this.$parent && c.to.pin === this;
                });
            },

            pinStyles() {
                let color = '#3e40b8';

                if (this.data.type === 2) {
                    color = '#ccc';
                }

                return {
                    backgroundColor: color
                }
            },

            markerTitle() {
                return this.data.types.map(item => item.type).join("\n");
            },

            inputControl() {
                for (const type of this.data.types) {
                    const parentNode = this.$parent.node;

                    if (parentNode.category === 'Variables') {
                        if (parentNode.name === 'setVariable' ) {
                            if (this.data.name === 'name') {
                                return VariableSelectControl;
                            }
                        }
                        if (parentNode.name === 'getVariable' ) {
                            if (this.data.name === 'name') {
                                return VariableSelectControl;
                            }
                        }
                    }

                    switch (type.type) {
                        case 'integer':
                            return IntegerControl;
                        case 'float':
                            return FloatControl;
                        case 'string':
                            return StringControl;
                        case 'boolean':
                            return BooleanControl;
                    }
                }

                return null;
            }
        },

        methods: {

            serialize() {
                return {
                    data: this.data,
                    connection: this.connection ? this.serializeConnection(this.connection) : null
                };
            },

            serializeConnection(c) {
                return {
                    id: c.id,
                    from: {
                        node: c.from.node.node.id,
                        pin: c.from.pin.data.name
                    },
                    to: {
                        node: c.to.node.node.id,
                        pin: c.to.pin.data.name
                    }
                }
            },
        }

    }

</script>