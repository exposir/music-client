<template>
    <div class="down-song-box my-wrapper">
        <div class="top-box fixedTab new-top-box">
            <div>
                <button-collect v-if="downloadedSongList.length>0" :allSongs="downloadedSongList" :listid="'downloaded_songlist'" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':false,'more':false,'delete':true,'play':this.isMass,'addto':this.isMass,'download':false,'massexit':this.isMass}"></button-collect>
            </div>
            <div class="open-dir-link">
                <a @click="openDownloadFolder()">打开下载目录</a><span class="right-btn"></span>
            </div>
        </div>
        <user-song-list v-if="downloadedSongList.length>0" :data="currentpageDownloadedSonglist" :allDataSize="downloadedSongList.length" :type="'downloaded'" :playingInex="downloadedPlayingIndex" :list_id="'downloaded_songlist'" :activeSongId="'active_song_id'"></user-song-list>
        <div v-else class="is-empty">
            <img src="static/images/user/favour_blank.png" alt="">
            <div class="empty-tip">暂无已下载歌曲</div> 
            <div class="empty-link"><router-link to="/muwindow"><span>去发现音乐看看</span></router-link></div>
        </div>
    </div>
</template>
<script>
    import buttonCollect from 'components/button/button-collect.vue'
    import userSongList from 'components/user/user-song-list.vue'
    import userSerive from 'service/userService.js'
    import pathutil from '../../../pathUtils/pathUtils.js'
    import {
        mapGetters
    } from 'vuex'
    const shell = require('electron').shell;
    export default {
        name: 'downloaded',
        computed: mapGetters({
            downloadedSongList: 'downloadedSonglist',
            currentpageDownloadedSonglist: 'currentpageDownloadedSonglist',
            downloadedPlayingIndex: 'downloadedListPlayingIndex'
        }),
        data() {
            return {
                tabname: 'downloaded',
                active_song_id: "",
                isMass: false,
                isNotMass: true
            }
        },
        watch: {
            '$route' (to, from) {
                // let song_id = this.$route.params.songid
                // this.setActiveSong(song_id)
            }
        },
        created() {
            let song_id = this.$route.params.songid
            this.setActiveSong(song_id);
            eventBus.$on('isMass', (val) => {
                this.isMass = val
                this.isNotMass = !val
            })
        },
        beforeDestroy() {
            this.$store.dispatch('emptyLinesSelected');
        },
        components: {
            userSongList,
            buttonCollect
        },
        methods: {
            openDownloadFolder() {
                shell.showItemInFolder(pathutil.getDownloadSongsFolder());
            },
            setActiveSong(song_id) {
                this.active_song_id = song_id
            },
            changeTab(name) {

                this.tabname = name
            }
        }

    }
</script>
<style scoped>
    .my-wrapper {
        height: 100%;
        overflow: hidden;
        padding: 0 17px;
        
    }
    
    .top-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 31px;
        height: 38px;
        padding-bottom: 12px;
    }
 
    .open-dir-link {
        height: 14px;
        
        text-decoration: none;
    }
    .open-dir-link * {
        vertical-align: middle;
    }
    .open-dir-link a {
        font-size: 12px;
        line-height: 12px;
        color: #c5c5c5;
    }
    .open-dir-link span {
        margin-left: 10px;
        display: inline-block;
        width: 6px;
        height: 12px;
        background: url('~static/images/right_btn.png') no-repeat;
        background-size: 100% 100%;
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
        margin-left: -48px;
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