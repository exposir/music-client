<template>
    <div class="fav-song-box my-wrapper">
        <div class="top-box fixedTab new-top-box">
            <button-collect v-if="localsonglist.length>0" :allSongs="currentPageLocalSonglist" :listid="'local_songlist'" :isShow="{'playall':this.isNotMass&&currentPageLocalSonglist.length>0,'massop':this.isNotMass&&currentPageLocalSonglist.length>0,'favour':false,'more':false,'delete':true,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass,'import':this.isNotMass}"></button-collect>
            <button-collect v-else :allSongs="currentPageLocalSonglist" :listid="'local_songlist'" :isShow="{'favour':false,'more':false,'delete':false,'play':false,'addto':false,'download':false,'massexit':false,'import':true}"></button-collect>
        </div>
        <user-song-list v-if="localsonglist.length>0" :data="currentPageLocalSonglist" :allDataSize="localsonglist.length" :type="'local'" :playingInex="playingInex" :list_id="'local_songlist'" :activeSongId="active_song_id"></user-song-list>
        <!-- <empty v-else :content="emptyPage.content" :btnText="emptyPage.btnText" :linkUrl="emptyPage.linkUrl"></empty> -->
        <div v-else class="is-empty">
            <img src="static/images/user/favour_blank.png" alt="">
            <div class="empty-tip">暂无本地歌曲</div> 
            <div class="empty-link"><router-link to="/muwindow"><span>去发现音乐看看</span></router-link></div>
        </div>
    </div>
</template>
<script>
    import constant from '../../constant.js'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import reportService from '../../service/reportService'
    import commonFuns from '../../components/commonFuns/common.js'
    import empty from '../empty/empty'
    import scrollBar from '../scrollBar/scrollBar.js'
    import userSongList from 'components/user/user-song-list.vue'
    import buttonCollect from 'components/button/button-collect.vue'
    const fs = require('fs');

    export default {
        name: 'munative',
        computed: {
            ...mapGetters({
                localsonglist: 'localSonglist',
                currentPageLocalSonglist:'currentPageLocalSonglist',
                playingInex: 'localListPlayingIndex',
                selectedSongsIndexs: 'ListSelectedLines',
            }),
            total() {
                let total = this.localsonglist.length;
                return total;
            }
        },
        data() {
            return {
                // selectedSongsIndexs:[] //多选
                active_song_id: "",
                isMass: false,
                isNotMass: true,
                emptyPage: {
                    content: '暂无本地歌曲',
                    btnText: '去发现音乐看看',
                    linkUrl: "/muwindow"
                }
            }
        },
        watch: {
            '$route' (to, from) {
                this.setActiveSong()
            }
        },
        created() {
            reportService.clickReport({
                'type': 'click',
                'page': 'functionlist',
                'pos': 'local'
            });
            this.setActiveSong();
            this.$store.dispatch('getCurrentPageLocalData', 0)
            eventBus.$on('isMass', this.massOpChanged);
        },
        beforeDestroy() {
            eventBus.$off('isMass', this.massOpChanged);
            this.$store.dispatch('emptyLinesSelected');
        },
        components: {
            empty,
            userSongList,
            buttonCollect
        },
        methods: {
            setActiveSong() {
                let song_id = this.$route.params.songid
                this.active_song_id = song_id
            },
            massOpChanged(val) {
                this.isMass = val
                this.isNotMass = !val
            }
        }
    }
</script>
<style scoped>
    .my-wrapper {
        height: 100%;
        overflow: hidden;
        margin: 0 17px;
        
    }
    
    .top-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 31px;
        height: 38px;
        padding-bottom: 12px;
    }

    .is-empty {
        width: 100%;
        height: calc(100% - 103px);
    }
    .is-empty img {
        position: absolute;
        left: 50%;
        margin-left: -80px;
        top: 190px;
    }
    .is-empty .empty-tip {
        top: 340px;
        position: absolute;
        left: 50%;
        margin-left: -41px;
        font-size: 14px;
        color: #333333;
    }
    .is-empty .empty-link {
        /* margin-top: 10px; */
        top: 360px;
        left: 50%;
        margin-left: -64px;
        position: absolute;
    }
    .is-empty .empty-link span {
        background-color: #e13228;
        display: inline-block;
        width: 130px;
        height: 30px;
        margin-top: 10px;
        font-size: 14px;
        line-height: 30px;
        color: #ffffff;
        border-radius: 15px;
        text-align: center;
    }
</style>