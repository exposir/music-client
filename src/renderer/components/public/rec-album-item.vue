<template>
<div class="album-item-box" :class="classname">
    <div  v-if="fields.pic"  class="img-border">
        <img v-if="data.pic_big" v-lazy="data.pic_big" alt="">
          <img v-else src="static/images/default_pic.svg" class="default-pic">
        <div class="mask">
            <router-link  @click.native="commonFuns.crmStatistics('album','albumPic')"  :to="'/music/public/album/'+data.album_id"></router-link>
        </div>
        <div class="img-play" @click="playWholeAlbum(data.album_id)"></div>
    </div>
    <p v-if="fields.title" class="title-top" :title="data.title">
        <router-link  :to="'/music/public/album/'+data.album_id">{{data.title}}</router-link>
    </p>
    <p v-if="fields.author" class="title-bottom" :title="data.author">
        <router-link  v-for="(item,i) in data.authorLinksArr"  :to="'/music/public/singer/'+item.artist_id+'/0'">{{item.artist_name}}<i v-if="i<data.authorLinksArr.length-1">,</i></router-link>
    </p>
    <p v-if="fields.time" class="title-bottom">{{data.publishtime}}</p>    
    </div>
</template>
<script>
    export default {
        name: 'rec-album-item',
        props: {
            data: Object,
            fields: Object,
            classname: {
                default: ''
            }
        },
        methods: {
            playWholeAlbum(album_id) {
                this.commonFuns.crmStatistics('album','albumPlay')
                this.$store.dispatch('playWholeAlbum', album_id)
                eventBus.$emit('isShowAddMusicIcon', true)
            }
        }
    }
</script>
<style scoped>
    .album-item-box {
        width: 176px;
        height: 160px;
        background: url('~static/images/record_bg.png') no-repeat;
        background-size: cover;
    }
    
    .img-border {
        width: 160px;
        height: 100%;
        margin-bottom: 8px;
        margin-right: 16px;
        position: relative;
        border: solid 1px #e5e5e5;
    }
    
    .img-border img[lazy=loaded] {
        width: 158px;
        height: 158px;
        margin-right: 16px;
    }
    
    .img-border .mask {
        width: 160px;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        z-index: 1;
        transition: opacity .5s;
    }
    
    .img-border:hover .mask {
        opacity: 1;
    }
    
    .img-border .mask a {
        width: 100%;
        height: 100%;
        display: block;
    }
    
    .img-border:hover .mask {
        display: block;
    }
    
    .img-border .img-play {
        width: 36px;
        height: 36px;
        position: absolute;
        right: 10px;
        bottom: 12px;
        display: none;
        cursor: pointer;
        background: url('~static/images/btn_play.svg') no-repeat;
        z-index: 2;
    }
    
    .img-border:hover .img-play {
        display: block;
    }
    
    .title-top {
        height: 22px;
        width: 100%;
        line-height: 22px;
        color: #333333;
        /* cursor: pointer; */
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-size: 14px;
    }
    
    .title-bottom {
        width: 100%;
        cursor: pointer;
        color: #999999;
        height: 18px;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .title-bottom a {
        color: #999999;
        font-size: 12px;
    }
    
    .album-item-box a:hover {
        color: #e13228;
    }
    
    .img-border img.default-pic {
        width: 100%;
        height: 100%;
    }
</style>