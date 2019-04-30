<template>
      <ul class="album-list">
        <li v-for="(val,index) in data">
            <album-item :data="val" :fields="fields"></album-item>
        </li>
    </ul>
</template>
<script>
    import albumItem from './album-item.vue'
    export default {
        name: 'album-list',
        props: {
            data: Array,
            fields: Object
        },
        components: {
            albumItem
        }
    }
</script>
<style scoped>
    .album-list {
        display: flex;
        flex-flow: row wrap;
        align-content: center;
    }
    
    .album-list li {
        flex: 0 0 20%;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        transition: all .3s;
        -webkit-transition:all .3s;
    }
    
    #singer .album-list {
        justify-content: flex-start;
    }
    @media screen and (min-width: 1100px) {
        .album-list {
            width: 100%;
        }
        .album-list li{
            flex: 0 0 15%;
        }
    }
</style>