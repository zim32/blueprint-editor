<template>

    <input type="checkbox" v-model="localValue" />

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
                    this.$emit('input', !!val);
                }
            }
        }

    }

</script>