<template>

    <select v-model="localValue">
        <option v-for="(item, idx) in allVariables" :value="idx">{{ item.name }}</option>
    </select>

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
        },
        allVariables() {
            return this.$store.state.variables;
        }
    }

}

</script>