<template>
    <div class="playlist_wrapper">
        <ul class="playlist-box">
            <li v-for="(song,index) in songsList" 
                :data-index="index" 
                :class="{active:choseSongsIndexs.indexOf(index)>-1 ,current:index == current_song_index,'disabled':(song.del_status==1 || song.copy_type==0 )}" 
                @click="choseSong(index)" 
                @contextmenu="showRightClickMenu(song, index)"
                @dblclick='playSong(song, index)'
                :id="getSongId(song)">
                <span class="number" v-if="index != current_song_index">{{index+1}}</span>
                <span class="pauseBtn" v-else @click="pauseSong">
                    <img v-if="!isPlaySong" src="~static/images/miniBar/mini_play.svg" alt="">
                    <img v-else src="~static/images/miniBar/mini_pause.svg" alt="">
                </span>
                <span class="playBtn" v-if="index != current_song_index" @click="playSong(song, index)">
                    <img src="~static/images/miniBar/mini_play.svg" alt="">
                </span>
                <span class="song-title">{{song.title}}</span>
                <span class="fct-box">
                    <i title="更多" class="more-icon miniList" @click="showRightClickMenu(song, index)"></i>
                    <!-- <more-icon :type="'minilist'" :data="{songArray:songsList, type:'minimode', list_id:'current_paly_list', selectindex:index}"></more-icon> -->
                </span>
            </li>
        </ul>
    </div>
</template>
<script scoped>
import {
    mapGetters,
    mapActions
} from 'vuex'

import moreIcon from 'components/icons/moreIcon.vue'
import playIcon from 'components/icons/playIcon.vue'
// import commonFuns from '../commonFuns/common.js'

const {remote} = require('electron')
const {Menu,MenuItem,shell} = remote
const fs = require('fs');
// const menu = new Menu()
let ipc = require('electron').ipcRenderer

export default {
    data() {
        return {
            isPlaySong: false,
            currentSong: {},
            currentIndex: ''
        }
    },
    computed: mapGetters({
        songsList: 'currentPlaysList',
        current_song_index: 'currentPlayIndex',
        choseSongsIndexs: 'currentPlaylistSelectLines',
        loginStatus: 'loginStatus',
        userDiyList: 'userDiyList',
        currentPlayingState:'currentPlayingState'
    }),
    created() {
    },
    mounted() {
        let me = this
        if(me.currentPlayingState == 1) {
            me.isPlaySong = true
        }else {
            me.isPlaySong = false
        }
        
        
        
    },
    components: {
        playIcon,
        moreIcon
    },
    methods: {
        choseSong(index) {
            let ctrlKey = false;
            let shiftKey = false;
            // if (event.metaKey || event.ctrlKey) {
            //     ctrlKey = true;
            // } else if (event.shiftKey) { // shift键
            //     shiftKey = true;
            // }
            let isCurrentPlaylist = true;
            this.$store.dispatch('updateLinesSelected', {
                index,
                ctrlKey,
                shiftKey,
                isCurrentPlaylist
            });
        },
        playSong(song, songIndex) {
            this.isPlaySong = true
            let playIndex = songIndex;
            let isAutoSwitch = false;
            this.$store.dispatch('playSpecifySong', {
                playIndex,
                isAutoSwitch
            })
        },
        pauseSong() {
            if(this.isPlaySong){
                this.$store.dispatch('pause')
            }else {
                this.$store.dispatch('play')
            }
            this.isPlaySong = !this.isPlaySong
        },
        getSongId(song) {
            return this.commonFuns.getSongId(song);
        },
        showRightClickMenu(song, index) {
            let me = this
            me.currentSong = song
            me.currentIndex = index
            let userDiyList = me.userDiyList.listinfo
            let addSubMenu = [
                {
                    label: '收藏',
                    click() {
                        me.addSongToFavorite()
                    }
                },{
                    label: '新建歌单',
                    click() {
                        me.addSongsToNewSelfSonglist()
                    }
                },
                {
                    type: 'separator'
                }
            ]
            // 创建自建歌单列表
            userDiyList.forEach((item,index)=>{
                let temp = {}
                temp.label = item.list_title
                temp.click = function(){
                    me.addSongsToSelfSongList(item.list_id)
                }
                addSubMenu.push(temp)
            })
            let menu = new Menu()
            menu.append(
                new MenuItem(
                    {   label: '添加到', 
                        submenu: addSubMenu
                    }
                )
            );
            menu.append(new MenuItem({ type: 'separator' }));
            menu.append(new MenuItem({ label: '分享', click() {
                me.shareMessage()
            }}));
            if(this.isLocalSong()){
                menu.append(new MenuItem({ type: 'separator' }));
                menu.append(new MenuItem({ label: '打开文件目录', click() {
                    me.openFile()
                }}));
            }
            menu.append(new MenuItem({ type: 'separator' }));
            menu.append(new MenuItem({ label: '删除', click() {
                me.delSong(false)
            }}));
            if(this.isLocalSong()){
                menu.append(new MenuItem({ type: 'separator' }));
                menu.append(new MenuItem({ label: '删除(包括本地文件)', click() {
                    me.delSong(true)
                }}));
            }
            menu.popup(remote.getCurrentWindow())
        },
        isLocalSong() {
            if (this.commonFuns.isLocalSong(this.currentSong)) {
                return true;
            }
            return false
        },
        //分享
        shareMessage() {
            eventBus.$emit('isMiniMode',false)
            ipc.send('asynchronous-message', 'main-window')

            let self = this
            let index = this.currentIndex;
            let songInfo = this.currentSong;
            let songid = this.commonFuns.getSongId(songInfo);
            if (songid.length <= 0 || songid.indexOf('_local') !== -1) {               
                return;
            }
            let url = 'http://music.taihe.com/song/' + songid
            let datas = {
                isShow:true,
                url:url,
                pic:songInfo.pic_big,
                title:'我正在收听' + ( songInfo.artist || songInfo.author ) + '的歌曲' + '《' + songInfo.title + '》'
            }
            eventBus.$emit('shareModal',datas)
        },
        // 删除
        delSong(isDelFile) {
            let self = this
            let indexArrs = []
            indexArrs.push(self.currentIndex)
            if(isDelFile) {
                eventBus.$emit('isMiniMode',false)
                ipc.send('asynchronous-message', 'main-window')
                self.commonFuns.confirmDialog('提示', '确定删除该文件吗?', '确定', function (val) {
                    if (val != 1) {
                        return;
                    } else {
                        self.$store.dispatch('deleteCurrentPlaylistSongsByIndex', {
                            indexArrs,
                            isDelFile
                        });
                    }
                });
            }else {
                this.$store.dispatch('deleteCurrentPlaylistSongsByIndex', {
                    indexArrs,
                    isDelFile
                });
            }
        },
        // 打开文件目录
        openFile() {
            if (this.currentSong.hasOwnProperty('file_path')) {
                let file_path = this.currentSong.file_path;
                if (!fs.existsSync(file_path)) {
                    this.commonFuns.createTips('本地文件不存在', 'error', 3000);
                } else {
                    shell.showItemInFolder(file_path)
                }
            }
        },
        // 添加到收藏
        isSelectCanCancelFavorite() {
            let songInfo = this.currentSong
            if (this.isSongFavored(songInfo)) {
                return true;
            }

            return false;
        },
        isSongFavored(songInfo) {
            let param = {
                'song': songInfo,
                'is_match': false
            }
            this.$store.dispatch('isSongFavored', param);
           
            return param.is_match;
        },
        addSongToFavorite() {
            if (!this.loginStatus) {
                this.$store.dispatch('TpassLogin');
                eventBus.$emit('isMiniMode',false)
                ipc.send('asynchronous-message', 'main-window')
                return;
            }
            let songs = []
            songs.push(this.currentSong)
            let isFavorite = false;
            this.$store.dispatch('addSongFavorites', {
                'songsData': songs,
                'isFavoured': isFavorite
            });
        },
        // 新建歌单
        addSongsToNewSelfSonglist() {
            eventBus.$emit('isMiniMode',false)
            ipc.send('asynchronous-message', 'main-window')
            if (!this.loginStatus) {
                this.$store.dispatch('TpassLogin');
                return;
            }

            let me = this;
            let songInfo = me.currentSong
            let song_ids = me.commonFuns.getSongId(songInfo)

            let empty_title = '新建自建歌单';
            me.MessageBox.tips('新建歌单', empty_title, {
                'cancelButtonText': '取消',
                'confirmButtonText': '确定',
                'showCancelButton': true,
                'showInput': true,
                'confirmButtonClass': 'noraml-btn',
                'cancelButtonClass': 'cancel-big-btn',
                'beforeClose': null,
                'handleAction': () => {
                    let title = document.getElementById('modifyGedanNameInput').value;
                    if (title.length > 20) {
                        me.commonFuns.createTips('歌单名称不能超过20个字符', 'warning')
                        return;
                    }
                    if (title.trim().length == 0) {
                        me.commonFuns.createTips('名称不能为空', 'warning')
                        return;
                    }
                    let paramsJson = {
                        'title': title,
                        'song_ids': song_ids,
                        'isDone': false,
                        'ret_code': 0
                    };
                    me.$store.dispatch('addSongListAndSongs', paramsJson);
                    let messageBoxDom = document.querySelectorAll('.el-message-box__wrapper')
                    messageBoxDom.forEach((itemdom, index) => {
                        document.body.removeChild(itemdom)
                    })
                    if (document.querySelector('.v-modal')) {
                        document.body.removeChild(document.querySelector('.v-modal'))
                    }
                }
            })
        },
        // 添加到指定歌单
        addSongsToSelfSongList(listid) {
            let me = this;
            let list_id = listid
            let songInfo = me.currentSong
            let song_ids = me.commonFuns.getSongId(songInfo)
            this.$store.dispatch('addSongsToList', {
                'list_id': list_id,
                'song_ids': song_ids
            });
        }
    },
    watch:{
        currentPlayingState() {
            if(this.currentPlayingState == 1) {
                this.isPlaySong = true
            }else {
                this.isPlaySong = false
            }
        }
    }
}
</script>
<style scoped>
.playlist_wrapper {
    height: 175px;
    /* padding-top: 5px; */
    width: 320px;
    background:#ffffff;
    overflow-x: hidden;
    overflow-y: auto;
}
.playlist-box {
    /* height: 175; */
    padding: 5px 0;
    /* overflow-y: auto; */
}
.playlist-box li {
    display: flex;
    height: 32px;
    line-height: 32px;
    border-bottom: 1px solid #ffffff;
}
.playlist-box li:hover {
    background: #fdf3f2;
}
.playlist-box li:hover .number {
    display: none;
}
.playlist-box li:hover .playBtn {
    display: inline-block;
}
.playlist-box li:hover .fct-box {
    opacity: 1;
}
.playlist-box span {
    cursor: default;
    text-align: left;
}
.playlist-box .number {
    flex: .3;
    width: 16px;
    padding-left: 16px;
}
.playlist-box .playBtn {
    cursor: pointer;
    display: none;
    flex: .3;
    /* width: 16px; */
    padding-left: 16px;
}
.playlist-box .playBtn img {
    width: 10px;
    height: 10px;
}
.playlist-box .pauseBtn {
    cursor: pointer;
    flex: .3;
    /* width: 17px; */
    padding-left: 15px;
}
.playlist-box .pauseBtn img {
    width: 10px;
    height: 10px;
}
.playlist-box .song-title {
    flex: 3.5 3.5 12px;
    padding: 0 2px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.playlist-box .fct-box {
    width: 23px;
    padding: 0 2px;
    align-items: center;
    opacity: 0;
}
.playlist-box .time {
    /* flex: 3.5 3.5 40px; */
    text-align: left;
    width: 47px;
    padding: 0 2px;
}
.playlist-box li.active {
    background: #fdf3f2;
}
.oncontext-menu-wrapper {
    top: 50px !important;
    left: 20px !important;
}
.current .song-title {
    color: #e13228 !important;
}
.miniList.more-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: url('~static/images/miniBar/mini_more.svg') no-repeat;
    cursor: pointer;
}

.miniList.more-icon:hover {
    background: url('~static/images/miniBar/mini_more.svg') no-repeat;
}
</style>