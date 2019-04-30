<template>
<div>
      <router-link v-if="fields.pic" :to="'/music/public/singer/'+data.artist_id+'/0'" tag="div" class="singer-img" @click.native="commonFuns.crmStatistics('singer','singerPic')">
            <img v-if="data.avatar_middle" v-lazy="data.avatar_middle" alt="">
            <img v-else src="static/images/default_pic.svg" alt="">
        </router-link>
        <p v-if="fields.title" class="person-name" >
            <router-link @click.native="commonFuns.crmStatistics('singer','singerName')" :to="'/music/public/singer/'+data.artist_id+'/0'">{{data.name}}</router-link>
        </p>
</div>
</template>
<script>
    export default {
        name: "singer-item",
        props: {
            data: Object,
            fields: Object
        }
    }
</script>
<style scoped>
    .singer-img {
        width: 118px;
        height: 118px;
        cursor: pointer;
    }
    
    .singer-img a {
        display: block;
        height: 100%;
        width: 100%;
    }
    
    .singer-img img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 5px solid #f2f2f2;
    }
    
    .person-name {
        width: 126px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        height: 32px;
        line-height: 32px;
        margin-top: 14px;
    }
    
    .person-name a:hover {
        color: #e13228;
    }
</style>