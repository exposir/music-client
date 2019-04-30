<template>
<div class="gedan-item-box" :class="classname">
<!--这个组件比较恶心，api返回的字段不统一，需要判断下-->
<div class="img-border">
    <img v-if="data.pic_300" v-lazy="data.pic_300">
    <img v-else-if="data.list_pic_middle" v-lazy="data.list_pic_middle">
    <img v-else-if="data.pic" v-lazy="data.pic">
    <img v-else-if="data.list_pic" v-lazy="data.list_pic">
    <img v-else-if="data.list_pic_large" v-lazy="data.list_pic_large">
    <img v-else src="static/images/default_pic.svg" class="default-pic">
    <!--这里其实应该调到用户页面，但是我们现在没有用户页面，所以暂时屏蔽-->
    <div class="mask">
        <router-link v-if="data.listid&&data.gedanType!='self'" :to="'/music/public/gedan/'+data.listid"  @click.native="gedanStatistics" ></router-link>
        <router-link v-if="data.list_id&&data.gedanType!='self'" :to="'/music/public/gedan/'+data.list_id" @click.native="gedanStatistics"></router-link>
    </div>
    <!-- <div class="listen_num"><span class="txt">{{data.listen_num | transformNum}}</span></div> -->
    <div class="img-play" v-if="data.listid" @click="playWholeGedan(data.listid)"></div>
    <div class="img-play" v-if="data.list_id" @click="playWholeGedan(data.list_id)"></div>
    <!-- <div class="listen-num-box" v-if="fields.listen_num">
        <span class="txt">{{data.listen_num | transformNum}}</span>
    </div> -->
    <div class="new_listen_num" v-if="fields.listen_num">
        <div class="listen_img"></div>
        <span class="listen_txt">{{data.listen_num | transformNum}}</span>
    </div>
</div>
<p class="title-top" :title="data.title" v-if="fields.title">
    <router-link v-if="data.listid" :to="getGendanUrl(data.listid, fields.suffix)" @click.native="gedanNameStatistics">{{data.title}}</router-link>
    <router-link v-if="data.list_id" :to="getGendanUrl(data.list_id, fields.suffix)" @click.native="gedanNameStatistics">{{data.title}}</router-link>
    <router-link v-if="data.list_id" :to="getGendanUrl(data.list_id, fields.suffix)" @click.native="gedanNameStatistics">{{data.list_title}}</router-link>
</p>       
</div>
</template>
<script>
    export default {
        name: 'gedan-item',
        props: {
            data: Object,
            fields: Object,
            classname: {
                default: ''
            }
        },
        methods: {
            playWholeGedan(list_id) {
                this.$store.dispatch('playWholeGedan', list_id)
                if (this.fields.resource == 'recommend') {
                    this.commonFuns.crmStatistics('recommend','gedanPlay')
                } else {
                    this.commonFuns.crmStatistics('gedan','play')
                }
                eventBus.$emit('isShowAddMusicIcon', true)
            },
            getGendanUrl(listId, suffix){
                // suffix: 与router.config.js的 :type?/:cate? 格式对应，目前只在 “我的收藏”->“歌单”的列表项中(favourGedan.vue)，取值了/online/favour
                if(suffix){
                    return "/music/public/gedan/" + listId + suffix
                }else{
                    return "/music/public/gedan/" + listId
                }

            },
            gedanStatistics() {
                if (this.fields.resource == 'recommend') {
                    this.commonFuns.crmStatistics('recommend','gedanPic')
                } else {
                    this.commonFuns.crmStatistics('gedan','gedanPic')
                }
            },
            gedanNameStatistics() {
                if (this.fields.resource == 'recommend') {
                    this.commonFuns.crmStatistics('recommend','gedanName')
                } else {
                    this.commonFuns.crmStatistics('gedan','name')
                }
            }
        }, 
        filters: {
            transformNum: (value) => {
                if (!value) return 0
                if (value > 10000) {
                    let num = (value / 10000).toFixed(1) + '万'
                    return num
                } else {
                    return value
                }
            }
        }
    }
</script>
<style scoped>
    .gedan-item-box {
        width: 140px;
        height: auto;
    }
    
    .gedan-detail {
        width: 160px;
        height: 160px;
    }
    
    .img-border {
        width: 100%;
        height: 100%;
        margin-bottom: 8px;
        position: relative;
        /* border: solid 1px #f2f2f2; */
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .img-border img[lazy=loaded] {
        width: 100%;
        height: 100%;
        border: solid 1px #f2f2f2;
    }
    
    .img-border img.default-pic {
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
        background: url('~static/images/mc.png') no-repeat;
        /* opacity: 0.5; */
        z-index: 1;
        transition: opacity .5s;
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }
    
    .gedan-detail .img-border .mask {
        display: block;
    }
    
    .gedan-detail .img-border:hover .mask {
        display: block;
    }
    
    .img-border .mask a {
        width: 100%;
        height: 100%;
        display: block;
    }
    
    .img-border:hover .mask {
        opacity: 0.5;
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
    
    .gedan-detail .img-border .img-play {
        display: none;
    }
    
    .title-top {
        width: 100%;
        line-height: 22px;
        color: #333333;
        /* cursor: pointer; */
        font-size: 14px;
    }
    
    .listen-num-box {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        height: 24px;
        color: #fff;
        position: relative;
        bottom: 0;
        z-index: 10;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
    }
    
    .listen-num-box .txt {
        margin-right: 6px;
        left: 20px;
        position: absolute;
        bottom: 10px;
        /* display: flex; */
        align-items: center;
    }
    
    .listen-num-box .txt::before {
        display: inline-block;
        content: "";
        width: 20px;
        height: 20px;
        background: url('~static/images/icon_listen.svg') no-repeat;
        position: absolute;
        bottom: 10px;
        left: 10px;
    }
    
    .gedan-item-box a:hover {
        color: #e13228;
    }

    .new_listen_num {
        z-index: 999;
    }

    .new_listen_num .listen_img {
        position: absolute;
        bottom: 12px;
        left: 10px;
        width: 14px;
        height: 14px;
        background: url('~static/images/icon_listen.svg') no-repeat;
    }

    .new_listen_num .listen_txt {
        position: absolute;
        bottom: 9px;
        left: 28px;
        font-size: 12px;
        color: #fff;
    }
</style>