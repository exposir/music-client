<template>
    <div class="fav-song-box my-wrapper">
        <div class="top-box fixedTab new-top-box">
            <button-collect v-if="userFavoriteSongList.total>0" :allSongs="userFavoriteSongList.result" :listid="'favorite_songlist'" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':false,'more':false,'delete':true,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}"></button-collect>
        </div>
        <user-song-list v-if="loginStatus && userFavoriteSongList.total>0" :playingInex="currentPlayingIndex" :data="userFavoriteSongList.result" :allDataSize="userFavoriteSongList.total" :type="'favourSong'" :list_id="'favorite_songlist'"></user-song-list>
        <div v-else-if="loginStatus" class="is-empty">
            <img src="static/images/user/favour_blank.png" alt="">
            <div>暂无收藏的单曲</div> 
        </div>
        <empty v-else-if="!loginStatus" :content="'登录查看收藏的歌曲，享受多端同步'" :btnText="'现在登录'" :callbackFun="login"></empty>
    </div>
</template>
<script>
    import sectionTitle from 'components/public/section-title.vue'
    import userSongList from 'components/user/user-song-list.vue'
    import buttonCollect from 'components/button/button-collect.vue'
    import empty from 'components/empty/empty'
    import userSerive from 'service/userService.js'
    import constant from '../../constant.js'

    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'favour-song',
        computed: {
            ...mapGetters({
                // all_favour_song_list: 'all_favour_song_list',
                userFavoriteSongList: 'userFavoriteSongList',
                loginStatus: 'loginStatus'
            }),
        },
        data() {
            return {
                offset: 0,
                pageSize:100,
                currentPlayingIndex: -1,
                isMass: false,
                isNotMass: true
            }
        },
        watch: {
            userFavoriteSongList: function() {
                this.caculateCurrentPlayingIndex();
            }
        },
        created() {  
            let paramsJson = {
                'pn': this.offset,
                'rn': this.pageSize
                };
            this.$store.dispatch('getUserFavourSongList', paramsJson);

            eventBus.$on('playingsongchanged', this.playingsongchangedEvent);
            eventBus.$on('isMass', this.massOpEvent);
        },
        beforeDestroy() {
            this.$store.dispatch('emptyLinesSelected');
            eventBus.$off('isMass', this.massOpEvent);
            eventBus.$off('playingsongchanged', this.playingsongchangedEvent);
        },

        components: {
            sectionTitle,
            userSongList,
            buttonCollect,
            empty
        },
        methods: {
            playingsongchangedEvent() {
                this.caculateCurrentPlayingIndex();
            },
            massOpEvent(val) {
                this.isMass = val
                this.isNotMass = !val
            },
            login() {
                if (window.navigator.onLine == true) {　
                    this.$store.dispatch('TpassLogin')
                } else {　
                    this.commonFuns.createTips("网络似乎没连好，请检查连接", 'warning');
                }
            },
            caculateCurrentPlayingIndex() {
                this.currentPlayingIndex = -1;
                let param = {
                    'listid': "",
                    'songid': "",
                    'title': ""
                };
                this.$store.dispatch('getCurrentPlayingSongListId', param);
                if (param.listid != constant.favorite_songlist_id) {
                    return;
                }

                let songlist = this.userFavoriteSongList.result;
                if (songlist) {
                    for (let i = 0; i < songlist.length; i++) {
                        let song = songlist[i];
                        let songid = this.commonFuns.getSongId(song);

                        if (param.songid == songid) {
                            this.currentPlayingIndex = i;
                            break;
                        }
                    }
                }
            },
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
        margin-top: 18px;
        height: 50px;
    }

    .is-empty {
        width: 100%;
        height: 100%;
    }
    .is-empty img {
        position: absolute;
        top: 40%;
        left: 50%;
        margin-top: -70px;
        margin-left: -80px;
    }
    .is-empty div {
        position: absolute;
        top: 60%;
        left: 50%;
        margin-left: -42px;
        font-size: 14px;
        color: #333333;
    }
</style>