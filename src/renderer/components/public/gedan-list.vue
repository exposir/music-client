<template>
<ul class="gedan_list">
    <li v-for="(val,index) in data">
        <gedan-item :data="val" :fields="fields"></gedan-item>          
    </li>
 </ul>
</template>
<script>
    import gedanItem from 'components/public/gedan-item.vue'
    export default {
        name: "gedan-list",
        props: {
            data: Array,
            fields: Object
        },
        components: {
            gedanItem
        }
    }
</script>
<style>
    .gedan_list {
        display: flex;
        flex-flow: row wrap;
        align-content: center;
    }
    
    .gedan_list li {
        /* flex: 0 0 20%; */
        width: 20%;
        display: flex;
        /*justify-content: center;*/
        align-items: flex-start;
        height: 200px;
        margin-bottom: 20px;
        transition: width .3s;
        -webkit-transition: width .3s;
    }
    @media screen and (min-width: 1200px) {
        .gedan_list li {
            width: 16.6%;
        }
    }
</style>