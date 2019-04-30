<template>
    <button-item :btnTxt="btnTxt" :icon="'icon_exit_mass_op'" :handleAction="massOperation"></button-item>
</template>
<script>
    import buttonItem from './button-item.vue'
    export default {
        name: 'mass-exit-btn',
        props: {
            data: Array,
            btnTxt: {
                default: '退出批量操作'
            }
        },
        components: {
            buttonItem
        },
        methods: {
            massOperation() {
                eventBus.$emit('isMass', false);
            }
        }
    }
</script>