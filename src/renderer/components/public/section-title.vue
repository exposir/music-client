<template>
    <p class="section-title-box" v-cloak :class="{'big':data.classname==='big','small':data.classname==='small','normal':data.classname==='normal'}">
        <span class="section-title-name">{{data.title}}</span>
        <span class="nums" v-if="data.nums">{{data.nums}}</span>
        <router-link v-if="data.link" class="more" :to="data.link">更多 ></router-link>
    </p>
</template>
<script>
    export default {
        name: "section-title",
        props: {
            data: Object
        }
    }
</script>
<style scoped>
    .section-title-box {
        height: 21px;
        line-height: 21px;
        margin: 45px 0 16px;
        position: relative;
    }
    
    .section-title-name {
        font-size: 20px;
        color: #333;
        /* letter-spacing: 3px; */
        font-weight: bold;
    }
    
    .big .section-title-name {
        font-size: 20px;
    }
    
    .small .section-title-name {
        font-size: 12px;
    }
    
    .normal .section-title-name {
        font-size: 14px;
    }
    
    .more {
        font-size: 14px;
        color: #999999;
        /* margin-left: 4px; */
        position: absolute;
        right: 0;
    }
</style>