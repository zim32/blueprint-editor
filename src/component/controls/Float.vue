<template>

    <input class="number-control" style="width: 70px" v-model.number="localValue" type="number" step="0.01" />

</template>

<script>

    export default {

        data() {
            return {

            }
        },

        props: ['value'],

        computed: {
            localValue: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        }

    }

</script>