<template>
    <div class="oncontext-menu-wrapper" :style="{'left':positionX+'px','top':positionY+'px'}" :class="{'opacity':!isShowContext}">
        <ul class="first-menu-list">
            <!-- 解决右键菜单闪烁问题 -->
            <li style="height: 0;border-bottom:1px solid transparent;"></li>
            <li @mouseenter="showAddListMenu()" @mouseleave="isShowSecondsMenu=false">
                添加到
                <i class="trangle-right-icon"></i>
                <ul class="seconds-menu-list-box" v-show="isShowSecondsMenu">
                    <li v-if="isHaveNetSong()" @click="addSongsToFavorite()">收藏</li>
                    <!-- <li v-if="type!= 'favourSong' && isHaveNetSong() && !isSongAllFavored()" @click="addSongsToFavorite()">喜欢</li> -->
                    <!-- <li v-if="type!= 'favourSong' && select_index_array.length===1 && isSelectCanCancelFavorite()" @click="cancelSongFavorite()">取消喜欢</li> -->
                    <li v-if="type!='playing' && type!='minibar' && !isSelectSongOffline() && type!='minimode'" @click="addToPlayingList()">播放列表</li>
                    <li v-if="isHaveNetSong()" @click="addSongsToNewSelfSonglist()">新建歌单</li>
                    <ul v-if="isHaveNetSong()" class="seconds-menu-list-ul">
                        <li v-if="loginStatus && userDiyList && userDiyList.listinfo" :key="val.list_id" :class="{'disbaled':list_id == val.list_id}" v-for="(val,index) in userDiyList.listinfo" @click="addSongsToSelfSongList(val.list_id)" :title="val.list_title">{{val.list_title}}</li>
                    </ul>
                </ul>
            </li>
            <li v-if="isCanDownload() && type!='minimode'" @mouseenter="showDownloadSubMenu()" @mouseleave="isShowDownloadSubMenu=false">
                下载
                <i class="trangle-right-icon"></i>
                <ul class="seconds-menu-list seconds-down-menu" v-show="isShowDownloadSubMenu">
                    <li v-if="isHaveDonglownloadType(0)" @click="downloadSelectSongs(0)">无损品质
                        <i class="download-vip-icon"></i>
                    </li>
                    <li v-if="isHaveDonglownloadType(1)" @click="downloadSelectSongs(1)">高品质</li>
                    <li v-if="isHaveDonglownloadType(2)" @click="downloadSelectSongs(2)">标准品质</li>
                </ul>
            </li>
            <li v-if="select_index_array.length===1 && !isSelectSongOffline() && isHaveNetSong()" @click="shareMessage()">分享</li>
            <li v-if="isLocalSong() && select_index_array.length===1" @click="openFileFolder()">打开文件目录</li>
            <li v-if="type!='minibar' && isCanDelete()" @click="deleteSongs(false)">删除</li>
            <li v-if="type!='minibar' && isLocalSong() && type!='minimode'" @click="deleteSongs(true)">删除(包括本地文件)</li>
        </ul>
    </div>
</template>

<script>
import Popup from 'utils/popup'
import MessageBox from './main.js'
import downloadingService from '../../service/downloadSongService.js'
import commonFuns from '../../components/commonFuns/common.js'
import getSongInfoService from '../../service/songService.js'

const shell= require('electron').shell;
let currentWindow = require('electron').remote.getCurrentWindow()

const fs = require('fs');
import {
    mapGetters,
    mapActions
} from 'vuex'

const ipcRenderer = require('electron').ipcRenderer

const {
        clipboard
        
    } = require('electron')
const {
    BrowserWindow
}   = require('electron').remote
export default {
    name: 'contextmenu',
    computed: {
        ...mapGetters({
            selectedSongsIndexs: 'ListSelectedLines',
            userDiyList: 'userDiyList',
            loginStatus: 'loginStatus',
            userInfo: 'loginUserInfo',
            currentPlaysList: 'currentPlaysList'
        }),
        clientY() {
            return this.positionData.clientY
        },
        clientX() {
            return this.positionData.clientX
        },
        boxHeight() {
            let boxDom = document.querySelector('.oncontext-menu-wrapper')
            let boxHeight = parseFloat(this.domAction.getStyle(boxDom, 'height'))
            if (!boxDom) {
                let me = this
                let count = 0
                let interval = setInterval(function () {
                    count++
                    boxDom = document.querySelector('.oncontext-menu-wrapper')
                    if (boxDom) {
                        me.isShowContext = true
                        boxHeight = parseFloat(me.domAction.getStyle(boxDom, 'height'))
                        me.boxData.height = boxHeight
                        // console.log('boxHeight:' + boxHeight)
                        clearInterval(interval)
                    } else {
                        if (count > 10) {
                            clearInterval(interval)
                        }
                    }
                }, 300)
            } else {
                return boxHeight
            }
        },
        boxWidth() {
            let boxDom = document.querySelector('.oncontext-menu-wrapper')
            let boxWidth = parseFloat(this.domAction.getStyle(boxDom, 'width'))
            if (!boxDom) {
                let me = this
                let count = 0
                let interval = setInterval(function () {
                    count++
                    boxDom = document.querySelector('.oncontext-menu-wrapper')
                    if (boxDom) {
                        me.isShowContext = true
                        boxWidth = parseFloat(me.domAction.getStyle(boxDom, 'width'))
                        me.boxData.width = boxWidth
                        clearInterval(interval)
                    } else {
                        if (count > 10) {
                            clearInterval(interval)
                        }
                    }
                }, 300)
            } else {
                return boxWidth
            }
        },
        miniBarHeight() {
            let minibarBox = document.getElementById('minibar')
            let miniBarHeight = parseFloat(this.domAction.getStyle(minibarBox, 'height'))
            return miniBarHeight
        },
        clientHeight() {
            //主区域
            let mainContentBox = document.getElementById('app')
            let clientHeight = parseFloat(this.domAction.getStyle(mainContentBox, 'height'))
            return clientHeight
        },
        clientWidth() {
            //主区域
            let mainContentBox = document.getElementById('app')
            let clientHeight = parseFloat(this.domAction.getStyle(mainContentBox, 'width'))
            return clientHeight
        },
        positionX() {
            let clientX = this.clientX,
                boxWidth = this.boxWidth ? this.boxWidth : this.boxData.width,
                clientWidth = this.clientWidth
            let scrollBarWidth = 8
            // console.log(clientX + '-' + boxWidth + '-' + clientWidth + '-' + scrollBarWidth)
            if (clientX + boxWidth + 20 > clientWidth - scrollBarWidth) {
                this.isComputedLeftStyle = true
                let positionX = clientX - boxWidth
                return positionX > 0 ? positionX : '0'
            } else {
                //歌单页上的弹出框需要往右一些，如果有其他影响再更新
                return clientX + 10
            }
        },
        positionY() {
            let clientY = this.clientY,
                boxHeight = this.boxHeight ? this.boxHeight : this.boxData.height,
                clientHeight = this.clientHeight,
                miniBarHeight = this.miniBarHeight,
                positionY = 0
            if(this.type == 'minimode') {
                return clientY
            }
            if (clientY + boxHeight > clientHeight - miniBarHeight) {
                positionY = clientY - boxHeight
                //console.log('positionY:' + positionY)
                return positionY > 0 ? positionY : '0'
            } else {
                return clientY
            }
        }
    },
    mixins: [Popup],
    props: {
        modal: {
            default: false
        }
    },
    data() {
        return {
            songArray: [],
            select_index_array: [],
            type: {
                default: "online"
            },
            list_id: "",
            positionData: {
                'clientX': 0,
                'clientY': 0
            },
            isShowSecondsMenu: false,
            isShowDownloadSubMenu: false,
            isComputedLeftStyle: false,
            isShowContext: false,
            boxData: {
                width: 0,
                height: 0
            },
            pageSize: 20
        }
    },
    created() {
        if (document.querySelector('.oncontext-menu-wrapper')) {
            this.isShowContext = true
        }
        this.$store.dispatch('getUserDiyList', {
            "source": 0,
            "type": 10,
            "offset": 0
        })
    },
    mounted() {
        document.body.addEventListener('click', this.clickEventListener);
        document.body.addEventListener('contextmenu', this.contextmenuEventListener);
        document.getElementById('mainContent').addEventListener("scroll", this.mainContentEventListener);
    },
    beforeDestroy() {
        document.body.removeEventListener('click', this.clickEventListener);
        document.body.removeEventListener('contextmenu', this.contextmenuEventListener);
        document.getElementById('mainContent').removeEventListener("scroll", this.mainContentEventListener);
    },
    watch: {
        isShowContext(newVal, oldVal) {
            if (newVal) {
                let contextMenuDom = document.querySelector('.oncontext-menu-wrapper')
                this.domAction.removeClass(contextMenuDom, 'opacity')
            }
        }
    },
    methods: {
        clickEventListener(event) {
            if (!event.target.classList.contains('more-icon') && document.getElementsByClassName('oncontext-menu-wrapper').length > 0) {
                document.body.removeChild(document.getElementsByClassName('oncontext-menu-wrapper')[0])
            }
        },
        contextmenuEventListener(event) {
            let len = document.getElementsByClassName('oncontext-menu-wrapper').length;
            if (len > 0) {
                for (let i = 0; i < len - 1; i++) {
                    document.body.removeChild(document.getElementsByClassName('oncontext-menu-wrapper')[i])
                }
            }
        },
        mainContentEventListener(event) {
            if (document.getElementsByClassName('oncontext-menu-wrapper').length > 0) {
                document.body.removeChild(document.getElementsByClassName('oncontext-menu-wrapper')[0])
            }
        },

        showAddListMenu() {
            this.isShowSecondsMenu = true

            let boxDom = document.querySelector('.oncontext-menu-wrapper')
            let secondsMenuLeft = parseFloat(this.domAction.getStyle(boxDom, 'width'))

            let secondsMenuDom = document.querySelector('.seconds-menu-list-box')
            let clientX = this.clientX,
                boxWidth = this.boxWidth ? this.boxWidth : this.boxData.width,
                clientWidth = this.clientWidth
            if ((this.isComputedLeftStyle) || (clientX + boxWidth + 148 > clientWidth)) {
                secondsMenuLeft = -150
            }

            this.domAction.setStyle(secondsMenuDom, 'left', secondsMenuLeft + 'px')



        },
        showDownloadSubMenu() {

            this.isShowDownloadSubMenu = true
            let boxDom = document.querySelector('.oncontext-menu-wrapper')
            let secondsMenuLeft = parseFloat(this.domAction.getStyle(boxDom, 'width'))
            let secondsMenuDom = document.querySelector('.seconds-down-menu')
            let clientX = this.clientX,
                boxWidth = this.boxWidth ? this.boxWidth : this.boxData.width,
                clientWidth = this.clientWidth
            if ((this.isComputedLeftStyle) || (clientX + boxWidth + 88 > clientWidth)) {
                secondsMenuLeft = -150
            }
            this.domAction.setStyle(secondsMenuDom, 'left', secondsMenuLeft + 'px')
        },
        isCanDownload() {
            if (this.type == 'local' || this.type == 'downloaded' || this.songArray.length <= 0) {
                return false;
            }

            let canDownload = false;
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }

                let song = this.songArray[index];
                if (this.commonFuns.isSongCanDownload(song)) {
                    canDownload = true;
                    break;
                }
            }
            return canDownload;
        },
        isCanDelete() {
            if (this.select_index_array.length <= 0) {
                return false;
            }

            if (this.type != 'album' && this.type != 'online' && this.type != 'bangdan') {
                return true;
            }

            return false;
        },
        getSelectSongs() {
            let select_Songs = [];
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }

                let song = this.songArray[index];
                select_Songs.push(song);
            }
            return select_Songs;
        },
        isHaveNetSong() {
            if (this.songArray.length <= 0) {
                return false;
            }

            let net_song = false;
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }

                let song = this.songArray[index];
                if (this.isSongNet(song)) {
                    net_song = true;
                    break;
                }
            }
            return net_song;
        },
        isSongNet(songInfo) {
            let songid = this.commonFuns.getSongId(songInfo);
            if (songid.length > 0 && songid.indexOf('_local') === -1) {
                return true;
            }

            return false;
        },
        isSongAllFavored() {
            if (this.songArray.length <= 0) {
                return false;
            }

            let allFavored = true;
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                let song = this.songArray[index];

                if (this.isSongNet(song) && !this.isSongFavored(song)) {
                    allFavored = false;
                }
            }

            return allFavored;
        },
        isSelectCanCancelFavorite() {
            if (this.songArray.length <= 0) {
                return false;
            }
            if (this.select_index_array.length !== 1) {
                return false;
            }

            let index = this.select_index_array[0];
            // console.log(index);
            let songInfo = this.songArray[index];
            // console.log(songInfo)
            if (this.isSongFavored(songInfo)) {
                return true;
            }

            return false;
        },
        isSongFavored(songInfo) {
            if (this.type == 'local' || !songInfo) {
                return false;
            }

            let param = {
                'song': songInfo,
                'is_match': false
            }
            this.$store.dispatch('isSongFavored', param);
            // console.log('song is: ' + songInfo.title + ' favored is: ' + param.is_match)
            return param.is_match;
        },
        isHaveDonglownloadType(download_type) {
            if (this.select_index_array.length > 1) {
                if (download_type == 0) {
                    if (this.commonFuns.isSongArrayHasLossless(this.getSelectSongs())) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }
            let index = this.select_index_array[0];
            let param = {
                'sq': [],
                'hq': [],
                'normal': []
            };
            this.commonFuns.getSongBitrates(this.songArray[index], param);

            if (download_type === 0) {
                return param.sq.length > 0;
            } else if (download_type === 1) {
                return param.hq.length > 0;
            } else {
                return param.normal.length > 0;
            }
        },
        downloadSelectSongs(download_type) {
            if (!this.loginStatus) {
                if (download_type == 0) {
                    this.$store.dispatch('TpassLogin');
                    return;
                }
            }

            let download_array = [];
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }

                let song = this.songArray[index];
                if (this.commonFuns.isSongCanDownload(song)) {
                    download_array.push(song);
                }
            }

            if (download_type == 0) {
                if (this.userInfo && this.userInfo.flag != 200) {
                    let song = download_array[0];
                    this.$store.dispatch('showOpenVipMessageBox');
                    return;
                }
            }

            // console.log(download_array)
            console.log('total downloading count is: ' + download_array.length)
            for (let i = 0; i < download_array.length; i++) {
                let songInfo = download_array[i];
                let param = {
                    'sq': [],
                    'hq': [],
                    'normal': []
                };
                let empty = [];
                this.commonFuns.getSongBitrates(songInfo, param);
                let sq = param.sq.concat(empty);
                let hq = param.hq.concat(empty);
                let normal = param.normal.concat(empty);

                let timestamp = Date.parse(new Date());
                let dt = normal[0];
                if (download_type === 0) {
                    if (sq.length > 0) {
                        dt = sq[0]
                    } else if (hq.length > 0) {
                        dt = hq[0];
                    }
                } else if (download_type === 1) {
                    if (hq.length > 0) {
                        dt = hq[0]
                    }
                }
                let songid = this.commonFuns.getSongId(songInfo);
                console.log('current download dt is: ' + dt)

                let me = this;
                if (download_array.length === 1) {
                    downloadingService.getDownloadUrl({
                        'dt': dt,
                        'timestamp': timestamp,
                        'songid': songid
                    }, function (jsonData) {
                        let error_code = jsonData.error_code;
                        console.log(jsonData)
                        if (error_code == 22000) {
                            me.$store.dispatch('addDownloadingItem', {
                                'dt': dt,
                                'song_info': jsonData.songinfo
                            });
                            me.commonFuns.createTips('已添加到下载队列', 'success');
                        } else {
                            if (error_code == 22469) {
                                //单点售卖歌曲、专辑
                                if (jsonData.hasOwnProperty('result')) {
                                    me.$store.dispatch('showSaleSongMessageBox', jsonData.result);
                                }
                            } else if (error_code == 22467) {
                                //全球付费
                                me.$store.dispatch('showOpenVipMessageBox')
                            } else {
                                console.log('song.download return failed, code is: ' + error_code);
                            }
                        }
                    }, function () {

                    });
                } else {
                    me.$store.dispatch('addDownloadingItem', {
                        'dt': dt,
                        'song_info': songInfo
                    })
                }
            }

            if (download_array.length > 1) {
                this.commonFuns.createTips('已添加到下载队列', 'success');
            }
        },
        openFileFolder() {
            if (this.select_index_array.length === 1) {
                let index = this.select_index_array[0];
                let song = this.songArray[index];

                if (song.hasOwnProperty('file_path')) {
                    let file_path = song.file_path;
                    if (!fs.existsSync(file_path)) {
                        this.commonFuns.createTips('本地文件不存在', 'error', 3000);
                    } else {
                        shell.showItemInFolder(file_path)
                    }
                }
            }
        },
        isLocalSong() {
            if (this.songArray.length <= 0) {
                return false;
            }

            if (this.type == 'local' || this.type == 'downloaded') {
                return true;
            }

            let index = this.select_index_array[0];
            let songInfo = this.songArray[index];
            // console.log(JSON.stringify(songInfo));
            if (this.commonFuns.isLocalSong(songInfo)) {
                return true;
            }

            return false;
        },
        deleteSongs(isDelFile) {
            if (this.type == 'local') {
                let indexArrs = [];
                indexArrs = this.select_index_array.concat(indexArrs);
                if (isDelFile) {
                    let me = this;
                    this.commonFuns.confirmDialog('提示', '确定要删除这些文件吗?', '确定', function (val) {
                        if (val != 1) {
                            return;
                        } else {
                            me.$store.dispatch('deleteLocalSongs', {
                                indexArrs,
                                isDelFile
                            });
                        }
                    });
                } else {
                    this.$store.dispatch('deleteLocalSongs', {
                        indexArrs,
                        isDelFile
                    });
                }
            } else if (this.type == 'history') {
                this.$store.dispatch('deleteHistorySongs', this.select_index_array);
            } else if (this.type == 'downloaded') {
                let indexArrs = [];
                indexArrs = this.select_index_array.concat(indexArrs);
                let me = this;
                if (isDelFile) {
                    this.commonFuns.confirmDialog('提示', '确定要删除这些文件吗?', '确定', function (val) {
                        if (val != 1) {
                            return;
                        } else {
                            // console.log(indexArrs)
                            me.$store.dispatch('delSongsFromDownloadedList', {
                                'indexArray': indexArrs,
                                'isDelFile': isDelFile
                            });
                        }
                    });
                } else {
                    me.$store.dispatch('delSongsFromDownloadedList', {
                        'indexArray': indexArrs,
                        'isDelFile': isDelFile
                    });
                }
            } else if (this.type == 'playing' || this.type == 'minibar') {
                let indexArrs = [];
                indexArrs = this.select_index_array.concat(indexArrs);
                if (isDelFile) {
                    let me = this;
                    this.commonFuns.confirmDialog('提示', '确定要删除这些文件吗?', '确定', function (val) {
                        if (val != 1) {
                            return;
                        } else {
                            me.$store.dispatch('deleteCurrentPlaylistSongsByIndex', {
                                indexArrs,
                                isDelFile
                            });
                        }
                    });
                } else {
                    this.$store.dispatch('deleteCurrentPlaylistSongsByIndex', {
                        indexArrs,
                        isDelFile
                    });
                }
            } else if (this.type == 'self') {
                //删除自建歌单歌曲
                let songids = '';
                for (let i = 0; i < this.select_index_array.length; i++) {
                    let index = this.select_index_array[i];
                    if (index < 0 || index >= this.songArray.length) {
                        continue;
                    }
                    let song = this.songArray[index];
                    let songid = this.commonFuns.getSongId(song);

                    songids += songid;
                    if (i < (this.select_index_array.length - 1)) {
                        songids += ',';
                    }
                }
                // console.log('del song list id is: ' + this.list_id);
                this.$store.dispatch('delSongsFromList', {
                    'list_id': this.list_id,
                    'song_ids': songids
                });
            } else if (this.type == 'favourSong') {
                let songs = [];
                for (let i = 0; i < this.select_index_array.length; i++) {
                    let index = this.select_index_array[i];
                    if (index < 0 || index >= this.songArray.length) {
                        continue;
                    }

                    let song = this.songArray[index];
                    songs.push(song);
                }
                let isFav = true;

                // let offset = (this.currentPage - 1) * this.pageSize
                // let options = {
                //     currentPage: this.currentPage,
                //     offset: offset,
                //     pageSize: this.pageSize,
                //     type: this.type
                // }
                this.$store.dispatch('delSongFavorites', {
                    'songsData': songs,
                    'isFavoured': isFav
                });

            }
            //清空选择集
            this.$store.dispatch('emptyLinesSelected');
        },
        addSongsToFavorite() {
            console.log(this.select_index_array.length)
            if (!this.loginStatus) {
                this.$store.dispatch('TpassLogin');
                return;
            }
            if ((this.select_index_array.length===1)&&(this.isSelectCanCancelFavorite())) {
                commonFuns.createTips('这首歌曲已经收藏过了呦~', 'warning')
                return;
            }
            let songs = [];
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }
                let song = this.songArray[index];
                // console.log('add favor: ' + song.title)
                if (this.isSongNet(song)) {
                    songs.push(song);
                }
            }

            let isFavorite = false;
            this.$store.dispatch('addSongFavorites', {
                'songsData': songs,
                'isFavoured': isFavorite
            });
        },
        copySongLink() {
            if (this.select_index_array.length !== 1) {
                return;
            }

            let index = this.select_index_array[0];
            let songInfo = this.songArray[index];
            let songid = this.commonFuns.getSongId(songInfo);
            if (songid.length <= 0 || songid.indexOf('_local') !== -1) {
                return;
            }

            let url = 'http://music.taihe.com/song/' + songid
            clipboard.writeText(url)
            this.commonFuns.createTips('单曲链接已复制', 'success')
        },
        //分享
        shareMessage() {
            //let win = new BrowserWindow({width: 800, height: 200, frame: false,resizable:false})
            //win.show()
            if(currentWindow.getSize()[1] == 225) {
                eventBus.$emit('isMiniMode',false)
                ipcRenderer.send('asynchronous-message', 'main-window')
            }
            
            if (this.select_index_array.length !== 1) {
                return;
            }
            let self = this
            let index = this.select_index_array[0];
            let songInfo = this.songArray[index];
            let songid = this.commonFuns.getSongId(songInfo);
            let url = 'http://music.taihe.com/song/' + songid
            if(!self.songArray[index].pic_big) {
                getSongInfoService.getSongInfo({'songid':songid},function(res){
                    self.songArray[index].pic_big = res.content.pic_big
                    let datas = {
                        isShow:true,
                        url:url,
                        pic:self.songArray[index].pic_big,
                        title:'我正在收听' + (self.songArray[index].artist || self.songArray[index].author) + '的歌曲' + '《' + self.songArray[index].title + '》'
                    }
                    eventBus.$emit('shareModal',datas)
                    return
                })
            }
            
            if (songid.length <= 0 || songid.indexOf('_local') !== -1) {               
                return;
            }
            
            let datas = {
                isShow:true,
                url:url,
                pic:self.songArray[index].pic_big,
                title:'我正在收听' + (self.songArray[index].artist || self.songArray[index].author) + '的歌曲' + '《' + self.songArray[index].title + '》'
            }
            eventBus.$emit('shareModal',datas)
        },
        //歌词
        lyr() {
            ipcRenderer.send('asynchronous-message','new_lyr_window')
        },
        addToPlayingList() {
            if (this.select_index_array.length <= 0 ||
                this.songArray.length <= 0) {
                return;
            }

            let songs = [];
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }
                let song = this.songArray[index];
                let new_song = this.commonFuns.deepCopyObj(song);
                let listid = '';
                if (new_song.hasOwnProperty('listid')) {
                    listid = new_song.listid;
                }

                if (listid.length <= 0) {
                    listid = this.list_id;
                }
                songs.push(new_song);
            }

            let isPlay = false;
            if (this.currentPlaysList.length <= 0) {
                isPlay = true;
            }
            this.$store.dispatch('addSongsToCurrentPlayinglist', {
                'songArray': songs,
                'playIndex': 0,
                'isPlay': isPlay,
                'isReset': false
            });

            this.commonFuns.createTips('已添加到正在播放列表', 'success');
        },
        isSelectSongOffline() {
            if (this.songArray.length <= 0 || this.select_index_array.length <= 0) {
                return;
            }

            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                let song = this.songArray[index];

                // console.log(JSON.stringify(song))
                if (!this.commonFuns.isSongOffline(song)) {
                    return false;
                }
            }

            return true;
        },
        getSelectSongIds() {
            let song_ids = "";
            if (this.select_index_array.length <= 0 ||
                this.songArray.length <= 0) {
                return song_ids;
            }

            let songids = [];
            for (let i = 0; i < this.select_index_array.length; i++) {
                let index = this.select_index_array[i];
                if (index < 0 || index >= this.songArray.length) {
                    continue;
                }
                let song = this.songArray[index];
                let songid = this.commonFuns.getSongId(song);
                if (songid.length > 0) {
                    songids.push(songid);
                }
            }

            song_ids = songids.join(',');
            return song_ids;
        },
        addSongsToSelfSongList(list_id) {
            if (this.list_id === list_id) {
                return false
            }

            let song_ids = this.getSelectSongIds();
            this.$store.dispatch('addSongsToList', {
                'list_id': list_id,
                'song_ids': song_ids
            });
        },
        addSongsToNewSelfSonglist() {
            if (!this.loginStatus) {
                this.$store.dispatch('TpassLogin');
                return;
            }

            let me = this;
            let song_ids = this.getSelectSongIds();
            if (song_ids.length <= 0) {
                return;
            }

            let empty_title = '新建自建歌单';
            this.MessageBox.tips('新建歌单', empty_title, {
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
                        this.commonFuns.createTips('歌单名称不能超过20个字符', 'warning')
                        return;
                    }
                    if (title.trim().length == 0) {
                        this.commonFuns.createTips('名称不能为空', 'warning')
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
        }
    }
}
</script>
<style scoped>
.oncontext-menu-wrapper {
    display: block;
    width: auto;
    height: auto;
    position: absolute;
    z-index: 300000;
    top: 0;
    left: 0;
    background: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, .2);
}

.oncontext-menu-wrapper ul.first-menu-list {
    display: flex;
    flex-flow: column wrap;
    min-width: 90px;
}

.oncontext-menu-wrapper li {
    height: 40px;
    line-height: 40px;
    padding: 0 13px 0 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-bottom: solid 1px #f2f2f2;
    cursor: pointer;
    position: relative;
}

.oncontext-menu-wrapper li:not(.disbaled):hover {
    background-color: #f2f2f2;
}

.v-modal {
    background: transparent;
}

.seconds-menu-list-box,
.seconds-menu-list {
    position: absolute;
    top: 0;
    left: 110px;
    z-index: 2000;
    background: #fff;
    overflow: hidden;
    overflow-y: auto;
    border: solid 1px #eaeaea;
    max-height: 202px;
    width: 150px;
    /*max-width: 150px;*/
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
}

.seconds-menu-list-box>li {
   /* color: #e13228;*/
}

.seconds-menu-list-ul {
    width: 100%;
    max-height: 82px;
    overflow: hidden;
    overflow-y: auto;
}

.seconds-menu-list-box {
    overflow: hidden;
}

.seconds-menu-list-ul li,
.seconds-menu-list li {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.trangle-right-icon {
    width: 0;
    height: 0;
    border: solid 6px transparent;
    border-left: solid 6px #999999;
    position: absolute;
    right: 0;
    top: 14px;
}

.download-vip-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url('~static/images/icon_vip2.svg') no-repeat;
    vertical-align: -5px;
    margin-left: 5px;
}

.disbaled {
    color: #cccccc;
    cursor: default;
}

li.disbaled:hover {
    cursor: default;
}

.opacity {
    opacity: 0;
}


</style>