<template>
    <div v-show="isSee" id="singer">
       <div class="singerInfo cf" v-if="singerintro">
             <singer-item v-bind:data="singerintro" :fields="{'pic':true}"></singer-item>
            <div class="singer-intro">
                <p class="singer-name" v-if="singerintro.name&&isSee">{{singerintro.name}}</p>
                <p class="area cf">
                    <span class="fl">地区 :&nbsp; </span><span class="fl" v-if="singerintro.country">{{singerintro.country}}</span>
                </p>
                 <div class="button-wrap">
                <button-collect :allSongs="hotSingerSongList" :listid="singerintro.artist_id" :favourData="{'data':{'list_id': singerintro.artist_id,'source': 2},'showdata':{'nums':singerintro.collect_num,'iscollect':singerintro.is_collect,'pagetype':pagetype}}" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass&&this.isSongPage,'favour':this.isNotMass,'more':false,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}" :btnTxt="{'playall':'播放热歌'}"></button-collect>
                </div>
            </div>
        </div>
        <ul class="singer-tab">
            <li :class="{active:tab==='song'}" @click="changeTab('song')">歌曲({{singerintro.songs_total}})</li>
            <li :class="{active:tab==='album'}" @click="changeTab('album')">专辑({{singerintro.albums_total}})</li>
            <li :class="{active:tab==='intro'}" @click="changeTab('intro')">介绍</li>
        </ul>
        <!--歌曲列表-->
       <singer-song-list v-show="isLook" v-if="tab==='song'" v-bind:artistid="artistid" v-bind:tinguid="tinguid"></singer-song-list>
        <!--专辑列表-->
       <singer-album-list v-show="isLook" v-if="tab==='album'"  v-bind:artistid="artistid" v-bind:tinguid="tinguid"></singer-album-list>
        <!--歌手介绍-->
        <div class="albuminfo" v-show="isSee" v-if="tab==='intro'">
            <div class="singer-detail-box">
                <pre v-if="singerintro.intro" class="info-txt">{{singerintro.intro}}</pre>
                <span v-else class="empty-tips">暂时没有介绍</span>
            </div>
        </div>
       
    </div>
</template>
<script>
    import {
        mapGetters
    } from 'vuex'
    import singerSongList from 'components/public/singerSongList'
    import singerAlbumList from 'components/public/singerAlbumList'
    import singerItem from 'components/public/singer-item.vue'
    import sectionTitle from 'components/public/section-title.vue'
    import buttonCollect from 'components/button/button-collect.vue'
    export default {
        name: 'singer',
        data() {
            return {
                tab: 'song',
                artistid: 0,
                tinguid: 0,
                isShoeName: false,
                pagetype:'',
                isMass: false,
                isNotMass: true,
                isSongPage: true,
                isSee:false,
                isLook:false
            }
        },
        computed: {
            ...mapGetters({
                singerintro: 'singerInfo',
                songdata: 'singerSongdata',
                hotSingerSongList: 'hotSingerSongList'
            })
        },
        created: function() {
            this.pagetype = this.$route.params.type
            if (document.querySelector('.show')) {
                document.querySelector('.show').scrollTop = 0
            }
            this.fetchData(),
            eventBus.$on('isMass', (val) => {
                this.isMass = val
                this.isNotMass = !val
            })
            
        },
        updated:function(){
            setTimeout(() => {
                this.$data.isSee = true;
                setTimeout(() => {
                    this.$data.isLook = true;
                }, 500);
            }, 0);
          
        },
        watch: {
            '$route': 'fetchData'
        },
        components: {
            singerSongList,
            singerAlbumList,
            singerItem,
            sectionTitle,
            buttonCollect
        },
        methods: {
            changeTab(type) {
                this.tab = type
                eventBus.$emit('isMass', false);
                if (type != "song") {
                    this.isSongPage = false;
                } else {
                    this.isSongPage = true;
                }
                
            },
            fetchData() {
                this.isExist = true
                this.artistid = this.$route.params.id;
                this.tinguid = this.$route.params.tinguid;
                this.$store.dispatch('getSingerInfo', {
                    'artistid': this.artistid,
                    'tinguid': this.tinguid
                })
                this.$store.dispatch('getSingerSonglist', {
                    'artistid': this.artistid,
                    'tinguid': this.tinguid,
                    'limits': 20,
                    'offset': 0
                })
                this.$store.dispatch('emptyLinesSelected');
            }

        }
    }
</script>
<style scoped>
    #singer {
        font-size: 12px;
        padding-bottom: 10px;
    }
    
    .singerInfo {
        height: 174px;
        position: relative;
        background-color: #fafafa;
        display: flex;
        align-items: center;
        background-size: cover;
        padding-left: 40px;
    }
    
    .singer-intro {
        /*margin-top: 20px;*/
        margin-left: 27px;
        height: 128px;
        position: relative;
        padding-top: 10px;
    }
    
    .singer-intro .singer-name {
        text-align: left;
    }
    
    .singer-name {
        font-size: 22px;
        color: #333333;
        line-height: 40px;
        text-align: left;
    }
    
    .singer-intro .area span {
        margin: 0;
        color: #333333;
        font-size: 12px;
    }
    
    .singer-tab {
        display: flex;
        height: 26px;
        align-items: center;
        margin-top: 24px;
        padding: 0 17px;
    }
    
    .singer-tab li {
        width: 100px;
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        text-align: center;
    }
    
    .singer-tab li.active {
        color: #e13228;
        background: url('~static/images/line2.svg') no-repeat left bottom;
    }
    /*#singer .hot-line {
        margin-top: 16px;
    }*/
    
    .singer-detail-box {
        width: 100%;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        padding-left: 22px;
        margin-top: 20px;
    }
    
    .empty-tips {
        width: 100%;
        display: inline-block;
        text-align: center;
        margin-top: 10px;
    }
    
    .button-wrap {
        display: flex;
        width: 300px;
        position: absolute;
        bottom: 5px;
    }
    
    .albuminfo {
        padding: 0 17px;
    }
    
    .info-txt {
        white-space: pre-wrap;
        word-break: break-all;
    }
</style>