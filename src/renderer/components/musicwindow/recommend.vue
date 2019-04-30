<template>
    <div class="recommend">
        <div class="recom-banner"  @click="commonFuns.crmStatistics('recommend','focus')">
            <swiper></swiper>
        </div>
        <!--歌单推荐-->
        <div class="newsong-release recom-gedan">
            <div @click="commonFuns.crmStatistics('recommend','gedanMore')">
            <section-title :data="{'title':'精选歌单','link':'/gedanIndex/全部/1'}" ></section-title>
            </div>
            <div class="gendanRcWrap">
                <ul class="gedan-recommend-list">
                    <li>
                        <div class="gedan-item-box">
                            <div class="img-border">
                                <img v-if="jxGedanList.list_pic_large" v-lazy="jxGedanList.list_pic_large">
                                <img v-else-if="jxGedanList.list_pic_middle" v-lazy="jxGedanList.list_pic_middle">
                                <img v-else-if="jxGedanList.list_pic_small" v-lazy="jxGedanList.list_pic_small">
                                <img v-else src="static/images/default_pic.svg" class="default-pic">
                                <div class="mask">
                                    <router-link :to="'/music/public/gedan/'+jxGedanList.list_id" @click.native="commonFuns.crmStatistics('recommend','jxGedanPic')"></router-link>
                                </div>
                                <div class="img-play" v-if="jxGedanList.list_id" @click="playJXGedan()"></div>
                                <div class="new_listen_num">
                                    <div class="listen_img"></div>
                                    <span class="listen_txt">{{jxGedanList.listen_num | transformNum}}</span>
                                    <!-- <span class="listen_txt">5.6万</span> -->
                                </div>
                            </div>
                            <p class="title-top">
                                <router-link v-if="jxGedanList.list_id" :to="'/music/public/gedan/'+jxGedanList.list_id"  @click.native="commonFuns.crmStatistics('recommend','jxGedanName')">{{jxGedanList.list_title}}</router-link>
                                <!-- <router-link v-if="jxGedanList.list_id" :to="'/music/public/gedan/'+jxGedanList.list_id">{{jxGedanList.list_desc}}</router-link> -->
                            </p> 
                        </div>
                    </li>
                    <li v-for="(val,index) in recomGedanlist">
                        <gedan-item :data="val" :fields="{'pic':true,'title':true,'listen_num':true,'resource':'recommend'}"></gedan-item>          
                    </li>
                </ul>
            </div>
        </div>
        <!-- 为您推荐 -->
        <div class="newsong-release recom-gedan">
            <section-title :data="{'title':'为您推荐'}"></section-title>
            <div class="recom-bangdan-box">
                <recForU :data="recomDailyList"></recForU>
            </div>
        </div>
        <!-- <div class="newsong-release recom-gedan">
            <section-title :data="{'title':'为您推荐'}"></section-title>
            <div class="recom-bangdan-box">
                <dailyList :data="recomDailyList"></dailyList>
            </div>
        </div> -->
        <!--歌曲排行榜-->
        <!-- <div class="newsong-release rec-bangdan">
            <section-title :data="{'title':'歌曲排行榜','link':'/bangdanIndex'}"></section-title>
            <div class="recom-bangdan-box">
                <rec-bangdan :data="newBangdanList" :titleData="{'title':'新歌榜','link':'/music/public/bangdan/1'}"></rec-bangdan>
                <rec-bangdan :data="hotBangdanList" :titleData="{'title':'热歌榜','link':'/music/public/bangdan/2'}"></rec-bangdan>
            </div>
        </div> -->
        <!--新歌首发-->
        <div class="newsong-release album-rec-box">
            <div @click="commonFuns.crmStatistics('recommend','newAlbumMore')">
            <section-title :data="{'title':'新碟上架','link':'/newSongIndex/0'}"></section-title>
            </div>
            <!--<section-title v-bind:data="{'title':'新碟上架'}"></section-title>-->
              <ul class="album-list">
                <li v-for="val in recomAlbumlist" :key='val.album_id'>
                    <album-item :data="val" :fields="{'pic':true,'title':true,'author':true}"></album-item>
                </li>
            </ul>
        </div>
        
        <!-- 精选MV -->
        <div class="mv-release">
            <div @click="commonFuns.crmStatistics('recommend','jxMvMore')">
            <section-title :data="{'title':'精选MV','link':'/mvvideo'}"></section-title>
            </div>
            <div class="mvRcWrap">
                <ul class="mvRecomm-list">
                    <li v-for="(val,index) in recomMvlist">
                        <rec-mv :data="val" :fields="{'pic':true,'title':true,'author':true}"></rec-mv>          
                    </li>
                </ul>
            </div>
        </div>

        <!-- 升级提示 -->
        <update-message></update-message> 
    </div>
</template>
<script>
    import swiper from 'components/swiper/swiper.vue'
    import sectionTitle from 'components/public/section-title.vue'
    import albumItem from 'components/public/album-item.vue'
    import gedanItem from 'components/public/gedan-item.vue'
    import recBangdan from 'components/public/rec-bangdan.vue'
    import recForU from 'components/public/new-rec-forU.vue'
    // import dailyList from 'components/public/daily-list.vue'
    import recMv from 'components/public/rec-mv.vue'
    import reportService from 'service/reportService'
    import updateMessage from 'components/messageBox/updateMessage.vue'
    import {
        mapGetters
    } from 'vuex'
    const ipc = require('electron').ipcRenderer;

    export default {
        name: 'recommend',
        data() {
            return {
                sildeH: '200px'
            }
        },
        computed: {
            ...mapGetters({
                recomAlbumlist: 'recomAlbumlist',
                newBangdanList: 'newBangdanList',
                hotBangdanList: 'hotBangdanList',
                recomGedanlist: 'recomGedanlist',
                recomMvlist: 'recomMvlist',
                recomDailyList: 'recomDailyList',
                jxGedanList: 'jxGedanList'
            })
        },
        components: {
            swiper,
            sectionTitle,
            albumItem,
            gedanItem,
            recBangdan,
            updateMessage,
            recMv,
            recForU
            // dailyList
        },
        methods: {
            getMainH() {
                let mainMusicWrapperDom = document.querySelector('.mainMusicWrapper')
                if (mainMusicWrapperDom) {
                    let mainMusicWrapperHeight = this.domAction.getStyle(mainMusicWrapperDom, 'height')
                    let mainHeaderDom = mainMusicWrapperDom.querySelector('.main-menu-box')
                    let mainHeaderDomTotalHeight = this.domAction.getStyle(mainHeaderDom, 'height')

                    let mainWrapperHeight = parseFloat(mainMusicWrapperHeight) - parseFloat(mainHeaderDomTotalHeight)

                    let scrollBarBodyDom = document.querySelector('.scrollBarBody')
                    this.domAction.setStyle(scrollBarBodyDom, 'height', mainWrapperHeight + 'px')                    
                }
            },
            playJXGedan() {
                 this.commonFuns.crmStatistics('recommend','jxGedanPlay')
                this.$store.dispatch('playWholeGedan', '549371869')
                eventBus.$emit('isShowAddMusicIcon', true)
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
        },
        created: function() {
            
            let _self = this
            if(document.body.clientWidth >= 1200){
                _self.sildeH = "220px"
            }else {
                _self.sildeH = "200px"
            }
            window.onresize = function () {
                _self.getMainH()
                if(document.body.clientWidth >= 1200){
                    _self.sildeH = "220px"
                }else {
                    _self.sildeH = "200px"
                }
            }
            
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0
            }
            this.$store.dispatch('getRecommendAlbumLabel')
            this.$store.dispatch('getRecommendAlbum')
            this.$store.dispatch('getNewRecBangdanList')
            this.$store.dispatch('getHotRecBangdanList')
            this.$store.dispatch('getRecommendGedan')
            this.$store.dispatch('getRecommendMv')
            this.$store.dispatch('getJXGedan')
            this.$store.dispatch('getRecommendDaily',{ 'page_size':30,'page_no':1 })
            reportService.clickReport({
                'type': 'click',
                'page': 'musicwindow',
                'pos': 'recommend'
            })

            eventBus.$on('getDR', () => {
                this.$store.dispatch('getRecommendDaily',{ 'page_size':30,'page_no':1 })
            })
        },
        beforeDestroy() {
            eventBus.$off('getDR', this.massOpChanged);
        },
    }
</script>
<style scoped>
    .recom-banner {
        margin: 0 auto;
        /* padding-bottom: 12px; */
        overflow: hidden;
        /* margin-top: 21px; */
        padding: 0 17px;
    }
    
    .album-list {
        display: flex;
        flex-flow: row wrap;
        height: 188px;
        overflow: hidden;
        justify-content: space-between;
    }
    .gedan-recommend-list {
        display: flex;
        flex-flow: row wrap;
        margin-top: 15px;
        height: 408px;
        overflow: hidden;
        justify-content: space-between;
    }

    .album-list li,
    .gedan-recommend-list li {
        min-width: 140px;
        /* width: 20%; */
        margin-bottom: 24px;
        display: flex;
        justify-content:flex-start;
        align-items: flex-start;
        transition: width .3s;
        -webkit-transition: width .3s;
    }

    .gendanRcWrap .gedan-recommend-list:last-child {
        margin-top: 0;
    }
    
    .newsong-release {
        padding: 0 17px;
    }
    
    .mod-title {
        border-left: 4px solid #ffc000;
        height: 21px;
        line-height: 21px;
        padding-left: 8px;
        margin: 16px auto;
    }
    
    .mod-title-name {
        font-size: 18px;
    }
    
    .more {
        color: #727272;
        font-size: 14px;
        margin-left: 14px;
        cursor: pointer;
    }
    
    .more:hover {
        color: #e13228;
    }
    
    .more a {
        color: #727272;
    }
    
    .more:hover a {
        color: #e13228;
    }
    
    .recom-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
    }
    
    .recom-list li {
        flex: 0 0 20%;
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
    }
    
    .recom-bangdan-box {
        display: flex;
        justify-content: space-between;
    }
    
    .recom-mv .recom-list li {
        height: 151px;
    }
    
    .recom-mv .img-border {
        height: 100px;
    }
    
    .recom-mv .img-border img {
        height: 100px;
    }
    
    .recom-mv .img-border .mask {
        height: 100px;
        background: url(./images/imgborder-mask2.png) no-repeat;
    }
    
    .recom-mv .img-play {
        top: 32px;
    }
    
    .rec-bangdan {
        padding-top: 10px;
    }
    
    .album-rec-box {
        /* margin-top: 50px; */
    }
    .mv-release {
        padding: 0 17px;
        margin-bottom: 26px;
    }

    .mvRecomm-list {
        display: flex;
        flex-flow: row wrap;
        margin-top: 15px;
        height: 200px;
        overflow: hidden;
        justify-content: space-between;
    }
    .mvRecomm-list li {
        /* width: 33.33%; */
        height: 200px;
    }

    @media screen and (min-width: 1200px) {
        .album-list li,
        .gedan-recommend-list li{
            width: 16.5%;
            justify-content: flex-start;
        }
        .mvRecomm-list li {
            width: 25%;
            justify-content: flex-start;
        }
    }

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
        border: solid 1px #f2f2f2;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .img-border img[lazy=loaded] {
        width: 100%;
        height: 100%;
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