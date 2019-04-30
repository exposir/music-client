<template>
    <div v-show="isSee" class="album-wrapper">
        <div class="albumInfo" v-if="albumInfo">
            <album-item :data="albumInfo" :classname="'albuminfo'" :fields="{'pic':true}"></album-item>
            <div class="content-border">
                <p v-if="isSee" class="album-title" :title="albumInfo.title">{{albumInfo.title}}</p>
                <div v-if="isSee" class="album-content">
                    <p>歌手 :
                        <router-link v-for="(item,i) in albumInfo.authorLinksArr" :to="'/music/public/singer/'+item.artist_id+'/0'" :title="item.artist_name">{{item.artist_name}}
                        <i v-if="i<albumInfo.authorLinksArr.length-1">,</i>
                    </router-link>
                    </p>
                    <p>发行时间 : {{albumInfo.publishtime}}</p>
                    <p>歌曲数：{{total}}</p>
                </div>
                <div class="detail-box" v-if="isSee"> 
                    <div class="detail-txt" v-if="albumInfo.info">
                        <p class="detail">简介：{{albumDetail}}</p>
                        <a v-if="isShowMorebtn" :class="{'more-close-btn':isShowMoreDetail,'more-open-btn':!isShowMoreDetail}"  @click.stop="isShowMoreDetail= !isShowMoreDetail"></a>
                    </div>
                    <p v-else class="detail">暂无专辑介绍</p>
                    <transition  v-on:enter="enter" v-on:leave="leave">
                        <div class="floating-layer" v-if="isShowMoreDetail">
                            <div class="triangle-up"></div>
                            <h3 class="layer-title">专辑简介</h3>
                            <pre class="info-txt">{{albumInfo.info}}</pre>
                        </div>
                    </transition>
                </div>
                <div class="button-wrap">
                    <button-collect v-if="songlist.length>0" :allSongs="songlist" :listid="albumInfo.album_id" :favourData="{'data':{'list_id': albumInfo.album_id,'source': 1},'showdata':{'nums':albumInfo.collect_num,'iscollect':albumdata.is_collect,'pagetype':pagetype}}" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':isNotMass,'more':this.isNotMass,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}" :moredata="{'albumInfo':albumdata}"></button-collect>
                </div>
            </div>
        </div>
    
        <div class="listInfo" v-if="isSee">
            <song-list  :data="songlist" :detail="{'classname':'','type':'album','list_id':albumid}" :fields="{'hot':true,'album_title':false,'singer':true}"></song-list>
  
        </div>
    </div>
</template>
<script>
    import {
        mapGetters
    } from 'vuex'
    import buttonCollect from 'components/button/button-collect.vue'
    import songList from 'components/public/song-list.vue'
    import albumItem from 'components/public/album-item.vue'
    import empty from 'components/empty/empty'
    import Velocity from 'velocity-animate'

    export default {
        name: 'album',
        data() {
            return {
                selected: null,
                isShowMoreDetail: false,
                isShowMorebtn: false,
                albumid: 0,
                needflag: true,
                pagetype: '',
                isMass: false,
                isSee:false,
                isNotMass: true
                
            }
        },
        created() {
            this.pagetype = this.$route.params.type

            this.fetchData()

            eventBus.$on('isMass', this.massOpChanged);
        },
        mounted() {
            document.body.addEventListener('click', this.clickEventListener);
        },
        updated:function(){
            setTimeout(() => {
                 this.$data.isSee = true;
            }, 0);
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.clickEventListener);
            eventBus.$off('isMass', this.massOpChanged);
        },
        computed: {
            ...mapGetters({
                albumdata: 'albumInfo'
            }),
            albumInfo() {
                return this.albumdata.albumInfo
            },
            albumDetail() {
                let str = this.albumInfo.info;
                let json = this.commonFuns.getStrByts(str, this.needflag);
                this.isShowMorebtn = json.needflag;
                return json.str;
            },
            songlist() {
                if (this.albumdata.songlist) {
                    return this.albumdata.songlist
                } else {
                    return []
                }
            },
            total() {
                if (Array.isArray(this.albumdata.songlist)) {
                    return this.albumdata.songlist.length
                }
            }
        },
        watch: {
            '$route': 'fetchData'
        },
        components: {
            songList,
            buttonCollect,
            albumItem,
            empty
        },

        methods: {
            massOpChanged(val) {
                this.isMass = val
                this.isNotMass = !val
            },
            clickEventListener(event){
                event.stopPropagation()
                if (!event.target.classList.contains('show-detail-more-btn') && !event.target.classList.contains('floating-layer')) {
                    this.isShowMoreDetail = false
                }
            },
            fetchData() {
                var albumid = this.$route.params.id;
                this.albumid = albumid
                this.$store.dispatch('getAlbumInfo', {
                    'album_id': albumid
                })
                this.$store.dispatch('emptyLinesSelected');
            },
            choose(index) {
                this.selected = index;
            },
            playSongUptoWholeSongList(paramsJson) {
                this.$store.dispatch('playSongUptoWholeSongList', paramsJson)
            },
            playWholeSongList(paramsJson) {
                this.$store.dispatch('playWholeSongList', paramsJson)
            },
            enter(el, done) {
                Velocity(el, 'slideDown', {
                    duration: 500
                }, {
                    complete: done
                })
            },
            leave(el, done) {
                Velocity(el, 'slideUp', {
                    duration: 500
                }, {
                    complete: done
                })
            }
        }
    }
</script>
<style scoped>
    .album-wrapper {
        
    }
    .albumInfo {
        display: flex;
        padding: 23px 17px 18px 17px
    }
    
    .albumInfo a:hover {
        color: #e13228;
    }
    
    .albumInfo .content-border {
        margin-left: 20px;
        flex: 1 1 596px;
        position: relative;
    }
    
    .album-content {
        display: flex;
        align-items: center;
        height: 30px;
        color: #333333;
    }
    
    .album-content p {
        margin-right: 30px;
    }
    
    .img-border {
        width: 160px;
        height: 160px;
    }
    
    .img-border img {
        width: 100%;
        height: 100%;
        border: solid 2px #f2f2f2;
    }
    
    .album-title {
        font-size: 22px;
        color: #333333;
        max-height: 60px;
        overflow: hidden;
    }
    
    .listInfo {
        padding: 23px 17px 0 17px;
        margin: 0 auto;
    }
    
    .button-wrap {
        display: flex;
        width: 100%;
        position: absolute;
        bottom: 0px;
    }
    
    .detail-box {
        position: relative;
        top: -8px;
    }
    
    .info-detail {
        flex: 1 1 600px;
        margin-left: 28px;
        position: relative;
    }
    
    .detail {
        flex: 0 0 94%;
        color: #999999;
        font-size: 12px;
        height: 40px;
        line-height: 20px;
        position: relative;
        overflow: hidden;
        -webkit-line-clamp: 2;
        margin-top: 10px;
        margin-bottom: 20px;
    }
    
    .floating-layer {
        width: 100%;
        box-shadow: 1px 1px 10px 5px #cfcfcf;
        position: absolute;
        top: 45px;
        right: 0;
        z-index: 10;
        border-radius: 5px;
        color: #8c8c8c;
        line-height: 20px;
        padding: 16px;
        box-sizing: border-box;
        background: #fff;
    }
    
    .floating-layer .layer-title {
        color: #515151;
        margin-bottom: 5px;
    }
    
    .more-open-btn {
        position: absolute;
        right: 20px;
        top: 30px;
        width: 10px;
        height: 5px;
        background: url('~static/images/leftBar/icon12.svg') no-repeat;
    }
    
    .more-close-btn {
        position: absolute;
        right: 20px;
        top: 30px;
        width: 10px;
        height: 5px;
        background: url('~static/images/leftBar/icon12.svg') no-repeat;
        transform: rotate(180deg);
    }
    
    .triangle-up {
        width: 0;
        height: 0;
        border: solid 8px #fff;
        border-left: solid 8px transparent;
        border-right: solid 8px transparent;
        border-top: none;
        position: absolute;
        top: -8px;
        right: 16px;
    }
    
    .info-txt {
        white-space: pre-wrap;
        word-break: break-all;
    }
</style>