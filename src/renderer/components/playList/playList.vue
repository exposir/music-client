<template>
    <transition v-on:enter="enter" v-on:leave="leave">
        <div class="playlist-wrapper" v-show="isShowPlayList">
            <div class="box-title">正在播放
                <span class="close-btn" @click="close"></span>
            </div>
            <ul class="playlist-box" v-if="songsList.length>0">
                <li v-for="(song,index) in songsList" 
                    :data-index="index" 
                    :class="{active:choseSongsIndexs.indexOf(index)>-1 ,current:index == current_song_index,'disabled':(song.del_status==1 || song.copy_type==0 )}" 
                    @click="choseSong(index)" 
                    @mouseenter="mouseHover(index)" 
                    @contextmenu="onContextMenu(index, $event)"
                    @dblclick='playSong(song, index)'
                    :id="getSongId(song)">
                    <span class="number" v-if="index != current_song_index">{{index+1}}</span>
                    <span class="playing-icon" v-if="index == current_song_index"></span>
                    <span class="song-title">{{song.title}} -
                        <strong>
                            <router-link v-for="(item,i) in song.authorLinksArr" class="artist-link" :to="'/music/public/singer/'+item.artist_id+'/0'">{{item.artist_name}}
                                <i v-if="i<song.authorLinksArr.length-1">,</i>
                            </router-link>
                        </strong>
                    </span>
                    <span class="fct-box">
                        <play-icon v-if="song.copy_type!=2" :type="'playing'" :listid="'current_paly_list'" :data="{'songArray':[song],'playIndex':index}"></play-icon>
                        <play-icon v-else :type="'playing'" :listid="'current_paly_list'" :disabled="'disabled'" :data="{'songArray':[song],'playIndex':index}"></play-icon>
                        <!--<favour-icon v-if="!isSongLocal(song)" :type="'songlist'" :data="song" :favorstate="favorstate"></favour-icon>
                        <favour-icon v-else :type="'songlist'" :disabled="'disabled'" :data="song" :favorstate="favorstate"></favour-icon>-->
                        <i :class="{'disabled':isSongLocal(song),'favoured-icon':favorstate, 'favour-icon':!favorstate}" @click="doFavour(song)"></i>
                        <download-icon v-if="isSongCanDownload(song)" :type="'songlist'" :data="song"></download-icon>
                        <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="song"></download-icon>
                        <more-icon :type="'songlist'" :data="{songArray:songsList, type:'playing', list_id:'current_paly_list', selectindex:index}"></more-icon>
                    </span>
                </li>
            </ul>
            <empty v-else :content="emptyPage.content" :btnText="emptyPage.btnText" :linkUrl="emptyPage.linkUrl" :callbackFun="emptyPage.callbackFun"></empty>
        </div>
    </transition>
</template>
<style scoped>

.playlist-wrapper {
    width: 370px;
    background: #fff;
    color: #535353;
    position: fixed;
    bottom: 70px;
    right: 0;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, .2);
    z-index: 3000;
}

.playlist-wrapper .box-title {
    background: #fff;
    color: #3b3b3b;
    height: 50px;
    line-height: 50px;
    padding: 0 14px;
    position: relative;
    text-align: left;
    border-bottom: solid 1px #f2f2f2;
}

.playlist-wrapper .playlist-box {
    height: 492px;
    overflow-y: auto;
}

.playlist-wrapper .empty-wraper {
    height: 492px;
    overflow-y: auto;
}

.playlist-wrapper .playlist-box li {
    display: flex;
    height: 40px;
    line-height: 40px;
    border-bottom: solid 1px #f2f2f2;
    padding: 0 5px 0 14px;
}

.playlist-wrapper .playlist-box li:hover {
    background: #f2f2f2;
}

.playlist-wrapper .playlist-box span {
    cursor: default;
    text-align: left;
}

.playlist-wrapper .playlist-box .number {
    flex: .5 .5 16px;
}

.playlist-wrapper .playlist-box .song-title {
    flex: 3.5 3.5 210px;
    padding: 0 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.playlist-wrapper .playlist-box .song-title strong {
    font-style: normal;
    font-size: 12px;
}

.playlist-wrapper .playlist-box .fct-box {
    flex: 0 0 104px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: 0;
}

.playlist-wrapper .playlist-box li:hover .fct-box {
    opacity: 1;
}

.playlist-wrapper .playlist-box li:hover .fct-box i {
    margin-left: 2px;
}

.playlist-wrapper .playlist-box .duration {
    flex: 1 1 60px;
    text-align: right;
}

.playlist-wrapper .close-btn {
    width: 14px;
    height: 14px;
    background: url('~static/images/leftBar/icon12.svg') no-repeat;
    position: absolute;
    top: 20px;
    right: 17px;
    cursor: pointer;
}

.playlist-wrapper .playlist-box li.current {
    color: #e13228;
}

.playlist-wrapper .playlist-box li.current .playing-icon {
    width: 12px;
    height: 12px;
    background: url('~static/images/icon_playing.svg') no-repeat;
    margin-left: -2px;
    margin-top: 15px;
    margin-right: 5px;
}

.playlist-wrapper .playlist-box li.active {
    background: #f2f2f2;
}

.playlist-wrapper .empty-wraper {
    width: 100%;
    margin: 10px auto 10px auto;
    position: static;
}

.playlist-wrapper .artist-link:hover {
    color: #e13228;
}

 ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: #fff;
}

 ::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #fff;
}

 ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #cccccc;
}

.disabled,
.disabled a,
.disabled span,
.playlist-wrapper .playlist-box li.disabled a:hover {
    color: #cccccc;
}

.playlist-wrapper .playlist-box li.disabled:hover .fct-box {
    visibility: hidden;
}

.playlist-wrapper .playlist-box li.disabled:hover {
    background: #fff;
}

.favour-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~static/images/listIcon/icon2.svg') no-repeat;
    cursor: pointer;
}

.favour-icon:hover {
    background: url('~static/images/listIcon/icon2_1.svg') no-repeat;
}

.favoured-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~static/images/listIcon/icon5.svg') no-repeat;
    cursor: pointer;
}

.disabled.favour-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~static/images/listIcon/icon2_2.svg') no-repeat;
    cursor: default;
}

</style>
<script>
import {
    mapGetters,
    mapActions
} from 'vuex'
import playIcon from 'components/icons/playIcon.vue'
import favourIcon from 'components/icons/favourIcon'
import moreIcon from 'components/icons/moreIcon.vue'
import downloadIcon from 'components/icons/downloadIcon.vue'
import empty from 'components/empty/empty'
import Velocity from 'velocity-animate'
export default {
    computed: mapGetters({
        songsList: 'currentPlaysList',
        current_song_index: 'currentPlayIndex',
        choseSongsIndexs: 'currentPlaylistSelectLines',
        loginStatus: 'loginStatus'
    }),
    props: {
        isShowPlayList: Boolean
    },
    data() {
        let me = this
        return {
            emptyPage: {
                content: '还没有正在播放的歌曲',
                btnText: '去发现音乐看看',
                linkUrl: "/muwindow",
                callbackFun: function () {
                    me.$parent.$data.isShowPlayList = false
                }
            },
            favorstate: ''

        }
    },
    created() {
        document.body.addEventListener('click', this.clickEventListener);
    },
    destroyed() {
        document.body.removeEventListener('click', this.clickEventListener);
        let arrLines = [];
        let isCurrentPlaylist = true;
        this.$store.dispatch('setListSelectedLines', {
            arrLines,
            isCurrentPlaylist
        });
    },
    components: {
        empty,
        playIcon,
        favourIcon,
        moreIcon,
        downloadIcon
    },
    methods: {
        clickEventListener(e) {
            if (!this.$el.contains(e.target) && !e.target.classList.contains('openlist-btn') && !e.target.classList.contains('context')) {
                this.$parent.$data.isShowPlayList = false
            }
        },
        close() {
            this.$parent.$data.isShowPlayList = false
        },
        choseSong(index) {
            let ctrlKey = false;
            let shiftKey = false;
            if (event.metaKey || event.ctrlKey) {
                ctrlKey = true;
            } else if (event.shiftKey) { // shift键
                shiftKey = true;
            }
            let isCurrentPlaylist = true;
            this.$store.dispatch('updateLinesSelected', {
                index,
                ctrlKey,
                shiftKey,
                isCurrentPlaylist
            });
        },
        playSong(song, songIndex) {
            let playIndex = songIndex;
            let isAutoSwitch = false;
            this.$store.dispatch('playSpecifySong', {
                playIndex,
                isAutoSwitch
            })
        },
        isSongLocal(songInfo) {
            let songid = this.commonFuns.getSongId(songInfo);
            if (songid.length <= 0 || songid.indexOf('_local') !== -1) {
                return true;
            }

            return false;
        },
        isSongCanDownload(songInfo) {
            return this.commonFuns.isSongCanDownload(songInfo);
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
        },
        mouseHover(index) {
            if (this.loginStatus) {
                if (index < 0 || index >= this.songsList.length) {
                    return;
                }

                let songInfo = this.songsList[index];
                let param = {
                    'song': songInfo,
                    'is_match': false
                }
                this.$store.dispatch('isSongFavored', param);
                this.favorstate = param.is_match;
                // console.log('current favor state is: ' + this.favorstate + ' song is: ' + songInfo.title)
            } else {
                this.favorstate = false;
            }
        },
        getSongId(song) {
            return this.commonFuns.getSongId(song);
        },
        addFavour(data) {
            let songsData = []
            songsData.push(data)
            let isFavoured = this.favorstate
            let paramsJson = {
                songsData,
                isFavoured
            }
            this.$store.dispatch('addSongFavorites', paramsJson)
            this.favorstate = true
        },
        deleteFavour(data) {
            let songsData = []
            songsData.push(data)
            let isFavoured = this.favorstate
            let paramsJson = {
                songsData,
                isFavoured
            }
            this.$store.dispatch('delSongFavorites', paramsJson)

            this.favorstate = false

        },
        doFavour(song) {
            if (this.favorstate) {
                this.deleteFavour(song)
            } else {

                this.addFavour(song)
            }
        },
        onContextMenu(index, event) {
            let indexArray = [];
            this.$store.dispatch('getSelectIndexs', { 'isCurrentPlaylist': true, 'indexArray': indexArray });
            if (indexArray.indexOf(index) == -1) {
                let ctrlKey = false;
                let shiftKey = false;
                let isCurrentPlaylist = true;
                let isRightButton = true;
                this.$store.dispatch('updateLinesSelected', { index, ctrlKey, shiftKey, isCurrentPlaylist, isRightButton });

                indexArray.splice(0, indexArray.length);
                indexArray.push(index);
            }

            let clientX = event.clientX
            let clientY = event.clientY
            let positionData = {
                'clientX': clientX,
                'clientY': clientY
            }

            this.MessageBox.context(this.songsList, indexArray, 'playing', 'current_paly_list', positionData)
        }
    },
    filters: {
        duration_format(file_duration) {
            let miniutes = Math.floor(file_duration / 60)
            let seconds = file_duration - 60 * miniutes
            miniutes = miniutes < 10 ? '0' + miniutes : miniutes
            seconds = seconds < 10 ? '0' + seconds : seconds
            return miniutes + ':' + seconds
        }
    }
}
</script>