<template>
    <button-item v-if="data && data.length > 0" :btnTxt="btnTxt" :icon="'icon_mass_op'" :handleAction="massOperation"></button-item>
    <button-item v-else :btnTxt="btnTxt" :icon="'icon_mass_op_none'"></button-item>
</template>
<script>
    import buttonItem from './button-item.vue'
    export default {
        name: 'mass-op-btn',
        props: {
            data: Array,
            btnTxt: {
                default: '批量操作'
            }
        },
        components: {
            buttonItem
        },
        methods: {
            massOperation() {
                eventBus.$emit('isMass', true);
            }
        }
    }
</script>