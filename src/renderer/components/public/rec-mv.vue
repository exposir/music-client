<template>
    <div class="mv-item-box" :class="classname">
        <div  v-if="fields.pic"  class="img-border">
            <img v-if="data.thumbnail2" v-lazy="data.thumbnail2" alt="">
            <img v-else src="static/images/default_pic.svg" class="default-pic">
            <div class="mask" @click="playmv(data.type_id)">
            </div>
            <div class="img-play" @click="playmv(data.type_id)"></div>
        </div>
     
        <p v-if="fields.title" class="title-top" :title="data.title" @click="playmv_title(data.type_id)" >
            {{data.title}}
        </p>

        <p v-if="fields.author" class="title-bottom" :title="data.author">
            <router-link   @click.native="commonFuns.crmStatistics('recommend','jxMvSinger')"  v-for="(item,i) in data.authorLinksArr"  :to="'/music/public/singer/'+item.artist_id+'/0'">{{item.artist_name}}<i v-if="i<data.authorLinksArr.length-1">,</i></router-link>
        </p> 
    </div>
</template>
<script>
    import mvService from '../../service/mvService'
    import playMv from '../../utils/mv/playMv.js'   

    export default {
        name: 'rec-mv',
        props: {
            data: Object,
            fields: Object,
            classname: {
                default: ''
            }
        },
        methods: {
            playmv(mv_id) {
                this.commonFuns.crmStatistics('recommend','jxMvPic','click')
                let data =  {'mv_id':mv_id}
                let _self = this;
                mvService.getMvPlayUrl(data, res => {
                    if (res.error_code == 22000) {
                        playMv.playMv(res.result ? res.result : {})
                    }
                }, function(err) {
                    console.log(err)
                })  
            },
                        playmv_title(mv_id) {
                this.commonFuns.crmStatistics('recommend','jxMvName','click')
                let data =  {'mv_id':mv_id}
                let _self = this;
                mvService.getMvPlayUrl(data, res => {
                    if (res.error_code == 22000) {
                        playMv.playMv(res.result ? res.result : {})
                    }
                }, function(err) {
                    console.log(err)
                })  
            }
        }
    }
</script>
<style scoped>
    .mv-item-box {
        width: 245px;
        height: auto;
    }
    
    .img-border {
        width: 100%;
        height: 140px;
        margin-bottom: 8px;
        position: relative;
        border: solid 1px #f2f2f2;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #ECECEC;
    }
    
    .img-border img[lazy=loaded] {
        width: 100%;
        height: 100%;
    }
    
    .img-border .mask {
        width: 100%;
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
        top: 50%;
        left: 50%;
        margin-top: -18px;
        margin-left: -18px;
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
        cursor: default;
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
    
    .mv-item-box a:hover {
        color: #e13228;
    }
    
    .img-border img.default-pic {
        width: 100%;
        height: 100%;
    }
</style>