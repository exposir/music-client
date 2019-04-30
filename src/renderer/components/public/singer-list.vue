<template>
 <ul class="img-list" :class="from">
    <li v-if="data" v-for="(val,index) in data">
        <singer-item v-bind:data="val" :fields="{'pic':true,'title':true}"></singer-item>
    </li>
</ul>
</template>
<script>
    import singerItem from 'components/public/singer-item.vue'

    export default {
        name: 'singer-list',
        props: {
            data: Array,
            fields: Object,
            from: String
        },
        components: {
            singerItem
        }

    }
</script>
<style scoped>
    .img-list {
        width: 742px;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        overflow: hidden;
        transition: width .3s;
        -webkit-transition: width .3s;
    }
    .img-list.singerIndexlist {
        height: 350px;
    }
    
    .img-list li {
        width: 126px;
        height: 174px;
    }
    
    .singerlist#favour-singer-list .img-list li {
        margin-right: 28px;
    }
    
    .singerlist#favour-singer-list .img-list li:nth(5n) {
        margin-right: 0;
    }
    @media screen and (min-width: 1200px) {
        .img-list {
            width: 880px;
        }
    }
</style>