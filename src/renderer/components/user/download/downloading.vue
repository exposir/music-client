<template>
    <div class="down-song-box my-wrapper">
        <div class="fixedTab top-box">
            <div>
                <button-item v-if="downloading_list.length>0" :btnTxt="'全部开始'" :handleAction="startAllDownload"></button-item>
                <button-item v-if="downloading_list.length>0" :btnTxt="'全部暂停'" :handleAction="pauseAllDownload"></button-item>
                <button-item v-if="downloading_list.length>0" :btnTxt="'清空列表'" :handleAction="deleteAllDownload"></button-item>
            </div>
            <div class="open-dir-link">
                <a @click="openDownloadFolder()">打开下载目录</a><span class="right-btn"></span>
            </div>
        </div>
        <div v-if="downloading_list.length>0" class="table-song-list">
            <div class="table-title">
                <span class="num"></span>
                <span class="title">歌曲</span>
                <span class="singer">歌手</span>
                <span class="progress">进度</span>
                <span class="status"></span>
                <span class="size">大小</span>
            </div>
            <ul class="song-list scrollBarBody">
                <li onselectstart="return false;" 
                    v-for="(item,index) in downloading_list" 
                    :key="item.identifier"
                    :class="{active:selectedSongsIndexs.indexOf(index)>-1}" 
                    @click="lineSelected(index)" 
                    @mouseenter="mouseEnterLine(index)" 
                    @contextmenu="onContextMenu(index, $event)" 
                    @mouseleave="mouseLeaveLine(index)">
                    <span class="num">{{index+1}}</span>
                    <span class="title" :title="item.song_info.title">{{item.song_info.title}}</span>
                    <span class="singer">
                        <router-link v-for="(val,i) in item.song_info.authorLinksArr" :to="'/music/public/singer/'+val.artist_id+'/0'" :title="val.artist_name" :key="val.identifier">{{val.artist_name}}
                            <i v-if="i<item.song_info.authorLinksArr.length-1">,</i>
                        </router-link>
                    </span>
                    <span class="progress">
                        <el-progress :percentage="item.percent" :show-text="false" v-if="item.status!=5 && item.status!=8 && item.status!=9"></el-progress>
                        <span class="warning tips" v-if="item.status==8 || item.status==9" @click='showTips(index)'>购买后即可畅享</span>
                        <span class="warning" v-if="item.status==5">歌曲下载失败</span>
                    </span>
                    <span class="status">
                        <span class="bd-btn status-btn" v-if="((mouseHoverIndex == index) || (selectedSongsIndexs.indexOf(index)>-1)) && item.status == 6" @click="startDownloading(index)">开始</span>
                        <span class="bd-btn status-btn" v-if="((mouseHoverIndex == index) || (selectedSongsIndexs.indexOf(index)>-1)) && (item.status==5 || item.status==8 || item.status == 9)" @click="startDownloading(index)">重试</span>
                        <span class="bd-btn status-btn" v-if="((mouseHoverIndex == index) || (selectedSongsIndexs.indexOf(index)>-1)) && (item.status==1 || item.status==2)" @click="pauseDownloading(index)">暂停</span>
                        <span class="bd-btn status-btn" v-if="((mouseHoverIndex == index) || (selectedSongsIndexs.indexOf(index)>-1))" @click="deleteDownloading(index)">删除</span>
                        <span v-if="(mouseHoverIndex != index && (selectedSongsIndexs.indexOf(index)==-1)) && item.status!=2 && item.status!=6">{{item.percent}}%</span>
                        <span v-if="(mouseHoverIndex != index && (selectedSongsIndexs.indexOf(index)==-1)) && item.status==2">等待中</span>
                        <span v-if="(mouseHoverIndex != index && (selectedSongsIndexs.indexOf(index)==-1)) && item.status==6">已暂停</span>
                    </span>
                    <span class="size" v-html="getFileSize(index)"></span>
                </li>
            </ul>
        </div>
        <div v-else class="is-empty">
            <img src="static/images/user/favour_blank.png" alt="">
            <div class="empty-tip">暂无正在下载</div> 
            <div class="empty-link"><router-link to="/muwindow"><span>去发现音乐看看</span></router-link></div>
        </div>
    </div>
</template>
<script>
import sectionTitle from 'components/public/section-title.vue'
import constant from '../../../constant.js'
import {
    mapGetters,
    mapActions
} from 'vuex'
import scrollBar from '../../scrollBar/scrollBar.js'
import pathutil from '../../../pathUtils/pathUtils.js'
import downloadingService from '../../../service/downloadSongService.js'
import buttonItem from 'components/button/button-item.vue'
const shell = require('electron').shell;
const fs = require('fs');

export default {
    name: 'downloading',
    components: {
        sectionTitle,
        buttonItem
    },
    computed: mapGetters({
        downloading_list: 'downloadingItems',
        selectedSongsIndexs: 'ListSelectedLines',
    }),
    data() {
        return {
            mouseHoverIndex: -1,
        }
    },
    watch: {
        '$route'(to, from) {
            scrollBar.scrollToActivePosition()
        }
    },
    created() {
        // this.$store.dispatch('getDownloadingItems');
        let me = this
        window.onresize = function () {
            me.changeScroll();
        }
    },
    mounted() {
        this.changeScroll()

        scrollBar.scrollToActivePosition()
    },
    beforeDestroy() {
        this.$store.dispatch('emptyLinesSelected');
    },
    methods: {
        openDownloadFolder() {
            shell.showItemInFolder(pathutil.getDownloadSongsFolder());
        },
        pauseDownloading(index) {
            this.$store.dispatch('stopDownload', index);
            // let item = this.downloading_list[index];
            // console.log(item.status)
        },
        startDownloading(index) {
            this.$store.dispatch('startDownload', {
                'index': index,
                'popupTips': true
            });
        },
        deleteDownloading(index) {
            let indexArray = [];
            indexArray.push(index);
            this.$store.dispatch('deleteDownloadingItems', indexArray);
        },
        startAllDownload() {
            this.$store.dispatch('startAllDownload')
        },
        pauseAllDownload() {
            this.$store.dispatch('stopAllDownload')
        },
        deleteAllDownload() {
            let me = this;
            this.commonFuns.confirmDialog('提示', '是否清空所有下载任务?', '确定', function (val) {
                if (val != 1) {
                    return;
                } else {
                    let indexArray = [];
                    for (let i = 0; i < me.downloading_list.length; i++) {
                    indexArray.push(i);
                    }
                    me.$store.dispatch('deleteDownloadingItems', indexArray);
                }
            });

        },
        mouseEnterLine(index) {
            // console.log('mouse enter, line is: ' + index);
            this.mouseHoverIndex = index;
        },
        mouseLeaveLine(index) {
            // console.log('mouse leave, line is: ' + index);
            if (this.mouseHoverIndex == index) {
                this.mouseHoverIndex = -1;
            }
        },
        showTips(index) {
            if (index < 0 || index >= this.downloading_list.length) {
                return;
            }

            let item = this.downloading_list[index];
            let songInfo = item.song_info;
            if (item.status === 8) {
                this.$store.dispatch('showOpenVipMessageBox')
            } else if (item.status === 9) {
                if (item.hasOwnProperty('sale_info')) {
                    this.$store.dispatch('showSaleSongMessageBox', item.sale_info);
                }
            }
        },
        getFileSize(index) {
            let filesize = '';
            if (index < 0 || index >= this.downloading_list.length) {
                return filesize;
            }

            let item = this.downloading_list[index];
            let songInfo = item.song_info;
            if (songInfo.hasOwnProperty('file_size')) {
                let size = songInfo.file_size;
                if (parseInt(size) > 0) {
                    filesize = (size / 1024 / 1024).toFixed(1);
                    filesize += 'M';
                }
            }

            return filesize;
        },
        lineSelected(index) {
            let ctrlKey = false;
            let shiftKey = false;
            if (event.metaKey || event.ctrlKey) {
                ctrlKey = true;
            } else if (event.shiftKey) { // shift键
                shiftKey = true;
            }
            let isCurrentPlaylist = false;
            this.$store.dispatch('updateLinesSelected', {
                index,
                ctrlKey,
                shiftKey,
                isCurrentPlaylist
            });
        },
        onContextMenu(index, event) {
            let indexArray = [];
            this.$store.dispatch('getSelectIndexs', { 'isCurrentPlaylist': false, 'indexArray': indexArray });
            if (indexArray.indexOf(index) == -1) {
                let ctrlKey = false;
                let shiftKey = false;
                let isCurrentPlaylist = false;
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

            this.MessageBox.downloadingContext(positionData)
        },
        changeScroll() {
            let myWrapperDom = document.querySelector('.my-wrapper')
            let _mainHeight = parseFloat(this.domAction.getStyle(myWrapperDom, 'height'))

            let sectionTitleDom = document.querySelector('.fixedTab')
            let _titleHeight = parseFloat(this.domAction.getStyle(sectionTitleDom, 'height'))

            let _tableTitleDom = document.querySelector('.table-title')
            let _tableTitleHeight = parseFloat(this.domAction.getStyle(_tableTitleDom, 'height'))

            let _height = parseFloat(_mainHeight - _titleHeight - _tableTitleHeight)
            _height -= 70;
            let scrollBarBodyDom = document.querySelector('.scrollBarBody')
            this.domAction.setStyle(scrollBarBodyDom, 'height', _height + 'px')
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
        color: #c5c5c5;
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
        text-decoration: none;
    }
    .open-dir-link span {
        margin-left: 10px;
        display: inline-block;
        width: 6px;
        height: 12px;
        background: url('~static/images/right_btn.png') no-repeat;
        background-size: 100% 100%;
    }


    .tab-box {
        display: flex;
        /* border-bottom: solid 1px #f2f2f2; */
        height: 100%;
        justify-content: center;
        align-items: center;
    }

    .tab-box li {
        font-size: 14px;
        height: 34px;
        line-height: 36px;
        color: #515151;
        /* width: 68px; */
        background: #fff;
        text-align: center;
        margin-left: 34px;
        margin-right: 34px;
        position: relative;
    }
    
    .tab-box li a {
        display: inline-block;
        /* width: 68px; */
        /*transition:color .1s;*/
    }
    
    .tab-box li:hover a,
    .tab-box li a.isShow {
        color: #e13228;
        height: 34px;
        /* background: url('~static/images/nav_line.svg') no-repeat left bottom;
        background-size: 100% 4px; */
    }
    .tab-box li a.isShow span,
    .tab-box li:hover span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }

    .isShow span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }

    .tab-box li a.router-link-active {
        color: #e13228;
        height: 34px;
    }
    .tab-box li a.router-link-active span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }


/*.bd-btn {
        display: inline-block;
        padding: 0 8px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        border: solid 1px #e3e3e3;
        border-radius: 15px;
        cursor: pointer;
    }
    
    .bd-btn:hover {
        border-color: #999999;
    }*/

.bd-btn {
    margin-right: 5px;
}

span.status-btn {
    display: none;
}

span.status-state {
    display: inline-block;
}

.table-song-list li:hover span.status-state {
    display: none;
}

.scrollBarBody {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
}

.cursorpointer {
    cursor: pointer;
}

.table-song-list {
    height: 100%;
}

.table-title {
    display: flex;
    background: #fafafa;
}

.table-song-list span.num {
    flex: 0 0 40px;
    display: flex;
    justify-content: center;
}

.table-song-list span.title {
    flex: 1 1 135px;
}

.table-song-list span.fct {
    flex: 1 1 80px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    opacity: 0;
}

.table-song-list span.singer {
    flex: 1 1 100px;
}

.table-song-list span.album {
    flex: 1 1 145px;
}

.table-song-list span.time {
    flex: 1 1 60px;
}

.table-song-list span.size {
    flex: 0 0 40px;
    display: flex;
    justify-content: center;
}

.table-song-list span.progress {
    flex: 1 1 120px;
}

.table-song-list span.status {
    flex: 1 1 120px;
    display: flex;
    align-items: center;
}

.table-title {
    display: flex;
    height: 26px;
    align-items: center;
    justify-content: flex-start;
    border: none;
    /*border-top: 1px solid #e5e5e5;
        border-bottom: 1px solid #e5e5e5;
        border-right: 1px solid #e5e5e5;*/
    padding-right: 30px;
}

.table-title span {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: flex-start;
    /*border-left: 1px solid #e5e5e5;*/
    border: none;
    padding-left: 5px;
}

.table-title span.fct {
    /*border-left: none;*/
}

.song-list span {
    /*width: 100%;*/
    height: 100%;
    line-height: 40px;
    padding-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.table-song-list li {
    display: flex;
    height: 40px;
    align-items: center;
    border-bottom: 1px solid #f2f2f2;
    cursor: default;
    padding-right: 28px;
}

.table-song-list li:hover,
.table-song-list .active {
    background: #f2f2f2;
    transition: background-color .5s ease;
}

.table-song-list .current .playing {
    width: 22px;
    height: 22px;
    background: url(../../../common/images/playing_icon.png) no-repeat;
    background-size: contain;
    text-indent: -100000px;
    position: relative;
    left: 15px;
}

.table-song-list li:hover span.fct {
    opacity: 1;
}

.table-song-list a:hover {
    color: #e13228;
}

.play-btn {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url(../../../common/images/play_small.png) no-repeat;
}

.progress .el-progress {
    margin-top: 17px;
}

.song-list span.bd-btn {
    display: inline-block;
    padding: 0 8px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    border: solid 1px #c5c5c5;
    border-radius: 15px;
    cursor: pointer;
    margin-right: 4px;
}

.warning {
    color: #ff7e6b;
}

.tips {
    cursor: pointer;
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
<style>
.el-progress {
    line-height: auto;
}

.el-progress-bar__inner {
    background-color: #e13228;
}

.el-progress-bar {
    width: 80%;
}

.el-progress.is-exception .el-progress-bar__inner {
    background: #999999;
}
</style>