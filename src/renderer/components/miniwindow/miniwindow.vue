<template>
    <div id="miniWindow">
        <div class="miniContent">
            <!-- 歌曲封面 -->
            <div class="miniPic" v-if="song && song.title">
                <img class="song-lyric-link"
                     :src="song.pic_small"
                     v-if="song && song.pic_small" @error="setErrorImg($event)">
                <img class="song-lyric-link"
                     v-else
                     src="~static/images/default_pic.svg">
            </div>
            <div class="miniPic"
                 v-else>
                <img src="~static/images/default_pic.svg">
            </div>
            <!-- 歌曲信息 -->
            <div class="titleWrapper">
                <div class="songContent">
                    <div class="title" v-if="song && song.title">
                        {{song.title}}
                    </div>
                    <div class="artist">
                        {{song.author}}
                    </div>
                </div>
                <div class="songFunction">
                    <ul class="play-btn">
                        <li class="prev">
                            <a class="wg-button"
                            title="上一首"
                            @click="prevSong()"><span class="wg-button-inner"></span></a>
                        </li>
                        <li class="play wg-button"
                            :class="{'play':currentPlayingState == 1,'stop':currentPlayingState != 1}"
                            id="playBtn"
                            :title="currentPlayingState == 1 ? '暂停':'播放'" 
                            @click="playOrPause">
                            <span class="wg-button-inner"><a></a></span>
                        </li>
                        <li class="next">
                            <a class="wg-button"
                            title="下一首"
                            @click="nextSong(true)"><span class="wg-button-inner"></span></a>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 功能按钮 -->
            <div class="functionWrapper">
                <div class="volume"
                     id="volumeWrap"
                     @mouseenter="isShowVolume=true"
                     @mouseleave="isShowVolume=false">
                    <a class="wg-button"
                       :class="{mute:isMuted!='1',muted:isMuted=='1'}"
                       hidefocus="true"
                       title="音量"
                       @click="muted()"><span class="wg-button-inner"></span></a>
                    <div class="vol-slider-wrapper"
                           v-show="isShowVolume"  @mousewheel="wheelSetVolume($event)">
                        <input type="range"
                               id="volSlider"
                               min="0"
                               max="100"
                               step="1"
                               :value="volume"
                               @input="volumeChange($event)"
                               @mouseenter="showVolumeTip($event)"
                               @mousemove="showVolumeTip($event)"
                               class="vol-slider"
                               :style='{background:"linear-gradient(to right, #e13228 0%, #e13228 " + volume + "%,#999 " + volume + "%, #999)"}'>
                    </div>
                </div>
                <div v-show="!isShowVolume">
                    <div class="lyricWrap">
                        <lyric-icon></lyric-icon>
                    </div>
                    <favour-icon v-if="isSongNet(song)" :type="'minibar'"  :data="song"></favour-icon>
                    <favour-icon v-else :type="'minibar'" :data="song" :disabled="'disabled'"></favour-icon>
                    <dislike-icon v-show="playingRadioInfo && playingRadioInfo.type != 'others'" v-if="isSongNet(song)" :type="'minibar'"  :data="{song:song,currentPlayIndex:currentPlayIndex}"></dislike-icon>
                    <div class="openlist" title="播放队列" v-show="playingRadioInfo && playingRadioInfo.type == 'others'">
                            <span class="openlist-btn"
                            @click="showList"></span>
                    </div>
                </div>
            </div>
            <div class="miniClose" title="关闭" @click="closeMini"></div>
            <div class="miniEnlarge" title="标准模式" @click="enlargeMini"></div>
        </div>
        <div class="miniSchedule">
            <input v-if="song && song.title"
                   type="range"
                   id="miniprogressSlider"
                   min="0"
                   @input="progressValChange($event)"
                   step="1"
                   value="0">
            <input v-else
                   type="range"
                   id="miniprogressSlider"
                   min="0"
                   disabled="disabled"
                   value="0">
        </div>
        <miniplayList></miniplayList>    
    </div>
</template>
<script scoped>
import {
    mapGetters,
    mapActions
} from 'vuex'

import songLyric from 'components/public/songLyric'
import favourIcon from 'components/icons/favourIcon.vue'
import dislikeIcon from 'components/icons/dislikeIcon.vue'
import lyricIcon from 'components/icons/lyricIcon.vue'
import miniplayList from './miniplayList'

import os from 'os'
import { setInterval, clearInterval } from 'timers';

let ipc = require('electron').ipcRenderer
let currentWindow = require('electron').remote.getCurrentWindow()

export default {
    name: 'mini-components',
    data() {
        return {
            showDuration: '00:00',
            isShowVolume: false,
            isShowPlayList: false,
            isShowLyric: false,
            curtime: '00:00',
            totalDuration: 0,
            updateProgressTimer: 0
        }
    },
    components: {
        songLyric,
        favourIcon,
        lyricIcon,
        dislikeIcon,
        miniplayList
    },
    computed: {
        ...mapGetters({
            song: 'currentPlayingSong',
            mode: 'playMode',
            volume: 'volume',
            isMuted: 'isMuted',
            autoplay: 'autoplay',
            playingList: 'currentPlaysList',
            currentPlayingState:'currentPlayingState',
            currentPlayTimePos: 'currentPlayTimePos',
            playingRadioInfo: 'playing_radio_info',
            currentPlayIndex: 'currentPlayIndex',
            playingRadioInfo: 'displayInfo',     
            loginUserInfo: 'loginUserInfo',
            loginStatus: 'loginStatus',
            lastPlayMode: 'lastPlayMode',
            closeMode: 'closeMode'
        }),
        songsNumber() {
            return this.playingList.length
        }
    },
    created() {
        //先获取设置的值，然后再取做初始化
        this.$store.dispatch('getPlayMode')
        this.$store.dispatch('getVolume')
        this.$store.dispatch('getAutoPlay')
        this.$store.dispatch('getIsMuted')
        this.$store.dispatch('getDisplayInfo')

        if (process.platform == 'darwin') {
            this.macplayerInit();
        }
    },
    mounted() {
        eventBus.$on('playingstart', ()=>{
            let param = {};
            param.duration = 0;
            this.$store.dispatch('getDuration', param);
            this.totalDuration = param.duration;
            this.$store.dispatch('setPlayingState', 1);
            this.$store.dispatch('setCurrentPlayingTimePos', 0)
        })
        let me = this;
        this.updateProgressTimer = setInterval(()=>{
            if (me.currentPlayingState == 1) {
                let param = {};
                param.position = 0;
                me.$store.dispatch('getPosition', param);
                
                // $('#miniprogressSlider').val(param.position);
                let progress_percent = (param.position / me.totalDuration) * 100
                $('#miniprogressSlider').css('background', 'linear-gradient(to right, rgba(51,51,51) 0%, rgba(51,51,51) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');
                me.$store.dispatch('setCurrentPlayingTimePos', param.position * 1000);
            } else {
                ipc.send('play-state-change', 'play_stop');
            }
        }, 500)
    },
    beforeDestroy() {
    },
    methods: {
        enlargeMini() {
            eventBus.$emit('isMiniMode',false)
            currentWindow.setMinimumSize(970, 670)
            currentWindow.setResizable(true)
            currentWindow.setAlwaysOnTop(false)
            currentWindow.setSize(970, 670)
            currentWindow.center()

            // ipc.send('asynchronous-message', 'main-window')
        },
        closeMini() {
            if (this.closeMode == '0') {
                ipc.send('asynchronous-message', 'close_to_tray');
            } else {
                ipc.send('asynchronous-message', 'close_main_window');
            } 
        },
        playOrPause(event) {
            console.log('play state is: ' + this.currentPlayingState);
            if ((this.currentPlayingState != 1) && this.song.title) { //暂停状态 点击播放
                if (this.currentPlayingState == 0) {
                    this.$store.dispatch('playingSong', true)
                } else {
                    this.$store.dispatch('play');
                }
            } else if(this.currentPlayingState == 1){ 
                //播放状态 点击暂停
                this.$store.dispatch('pause');
            }
        },
        prevSong() {
            // 播放电台时，如果正在播放列表中第一首时，则不可切到上一首
            if(this.playingRadioInfo && this.playingRadioInfo.type != 'others' && this.currentPlayIndex == 0){
                this.commonFuns.createTips("已经是第一首了")
                return false
            }

            $('#miniprogressSlider').val(0)
            $('#miniprogressSlider').css('background', '#f2f2f2')
            this.$store.dispatch('playPrevOrNextSong', {
                "isPrev": true,
                "isMouseClicked": true
            })
        },
        nextSong(isClicked) {
            $('#miniprogressSlider').val(0)
            $('#miniprogressSlider').css('background', '#f2f2f2')
            this.$store.dispatch('playPrevOrNextSong', {
                "isPrev": false,
                "isMouseClicked": isClicked
            })
        },
        //设置声音
        setVolume(num) {
            this.$store.dispatch('setPlayVolume', num);
        },
        //静音
        muted() {
            let isMuted = '0';
            let isMute = false;
            if (this.isMuted == '1') {
                isMuted = '0';
                isMute = false;
            } else { //设置静音
                isMuted = '1';
                isMute = true;
            }
            this.$store.dispatch('setMute', isMute);
            this.$store.dispatch('setIsMuted', isMuted);
        },
        //滚轮调节声音
        wheelSetVolume(event) {
            if(this.isMuted == 1) {
                this.$store.dispatch('setMute', false);
                this.$store.dispatch('setIsMuted', 0);
            }
            if (this.isShowVolume) {
                if (event.wheelDelta) {
                    let wheelDelta = parseFloat(event.wheelDelta)
                    let num = parseFloat(Math.abs(wheelDelta) / 120)
                    let volume = parseFloat(this.volume)
                    if (wheelDelta > 0) { //向上滚
                        volume = volume < 100 ? volume + 1 * num : 100
                    } else if (wheelDelta < 0) { //向下滚
                        volume = volume > 0 ? volume - 1 * num : 0
                    }
                    this.setVolume(volume)
                    $('#volSlider').css('background', 'linear-gradient(to right, #e13228 0%, #e13228 ' + volume + '%,#999 ' + volume + '%, #999)');
                }
            }
        },
        volumeChange(event) {
            let volume = event.target.value;
            if(this.isMuted == 1) {
                this.$store.dispatch('setMute', false);
                this.$store.dispatch('setIsMuted', 0);
            }
            this.setVolume(volume);
            $('#volSlider').css('background', 'linear-gradient(to right, #e13228 0%, #e13228 ' + volume + '%,#999 ' + volume + '%, #999)');
        },
        showVolumeTip(event) {
            let volume = Math.ceil(Math.abs(event.offsetX) * (130 / 100))
            volume = volume < 100 ? volume : 100
            $('#volSlider').attr('title', volume)
        },
        isSongNet(song) {
            let songid = this.commonFuns.getSongId(song);
            if (songid.length > 1 && songid.indexOf('_local') == -1) {
                return true;
            }
            return false;
        },
        progressValChange(event) {
            let miniprogressSliderVal = event.target.value;
            this.$store.dispatch('setPosition', miniprogressSliderVal*1000)
            let progress_percent = (miniprogressSliderVal / this.totalDuration) * 100
            $('#miniprogressSlider').css('background', 'linear-gradient(to right, rgba(225,50,40) 0%, rgba(225,50,40) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');
        },
        macplayerInit() {
            if (process.platform != 'darwin') {
                return;
            }
            let params = {};
            params.player = null;
            this.$store.dispatch('getMacPlayer', params);
            let macPlayer = params.player;

            let me = this;
            macPlayer.setMode(this.mode)
            macPlayer.setVolume(this.volume)
            if (me.isMuted == '1') { //初始化 静音模式
                macPlayer.setMute(true)
            }
            macPlayer.on('timeupdate', function() {
                let curpos = macPlayer.curPos();
                me.$store.dispatch('setCurrentPlayingTimePos', curpos * 1000)
                let showCurpos = macPlayer.curPos(true);
                $('#miniprogressSlider').val(curpos);
                me.curtime = showCurpos
                //不能播放的歌曲时被js重置为0。所以这里也只能用js控制
                document.getElementById('curTime').innerHTML = showCurpos;

                let duration = macPlayer.duration();
                me.totalDuration = duration;
                let showDuration = macPlayer.duration(true);
                $('#miniprogressSlider').attr('max', duration);

                let progress_percent = (curpos / duration) * 100
                console.log(progress_percent)
                $('#miniprogressSlider').css('background', 'linear-gradient(to right, rgba(225,50,40) 0%, rgba(225,50,40) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');

                me.$store.dispatch('updateCurrentPlayngSongDuration', showDuration);
            });
        },
        showList() {
            if(currentWindow.getSize()[1] == 50) {
                currentWindow.setResizable(true)
                currentWindow.setSize(320,225)
                currentWindow.setResizable(false)
            }else {
                currentWindow.setResizable(true)
                currentWindow.setSize(320,50)
                currentWindow.setResizable(false)
            }
        }
    }
}
</script>
<style scoped>
#miniWindow {
    background: rgba(255,255,255,0.95);
}
.miniContent {
    height: 48px;
    line-height: 48px;
    width: 320px;
    position: relative;
    -webkit-app-region: drag;
}
.miniClose {
    height: 8px;
    width: 8px;
    position: absolute;
    top: 11px;
    right: 6px;
    background: url('~static/images/mini_close.svg');
    cursor: pointer;
    -webkit-app-region: no-drag;
}
.miniEnlarge {
    height: 8px;
    width: 10px;
    position: absolute;
    top: 30px;
    right: 5px;
    background: url('~static/images/mini_enlarge.svg');
    cursor: pointer;
    -webkit-app-region: no-drag;
}
.miniPic {
    position: relative;
    margin-top: 3px;
    height: 42px;
    width: 42px;
    margin-left: 3px;
    display: inline-block;
    border-radius: 2px;
}
.miniPic img {
    position: absolute;
    height: 42px;
    width: 42px;
    border-radius: 2px;
}
/* 歌名样式 */
.titleWrapper {
    position: relative;
    margin-top: 3px;
    width: 146px;
    margin-left: 4px;
    height: 42px;
    display: inline-block;
    -webkit-app-region: no-drag;
}
.titleWrapper .title {
    position: absolute;
    height: 12px;
    line-height: 12px;
    font-size: 12px;
    margin-top: 7px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333333;
    font-weight: bold;
}
.titleWrapper .artist {
    position: absolute;
    height: 12px;
    line-height: 12px;
    font-size: 12px;
    margin-top: 24px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #555555;
}
.songFunction {
    display: none;
    position: absolute;
}
.titleWrapper:hover .songContent {
    display: none;
}
.titleWrapper:hover .songFunction {
    display: inline-block;
}
.songFunction .play-btn {
    display: flex;
    flex: 0 0 100px;
    justify-content: space-between;
    width: 100px;
    height: 32px;
    line-height: 32px;
    margin-left: 15px;
    margin-top: 5px;
}
.songFunction .prev,.next {
    margin-top: 4px;
}
.songFunction .wg-button {
    display: inline-block;
    position: relative;
    padding: 0;
    cursor: pointer;
    text-align: center;
    overflow: hidden;
    border: none;
    outline: none;
}
.songFunction .prev a,
.next a {
    text-indent: -999px;
    width: 14px;
    height: 16px;
    cursor: pointer;
}
.songFunction .prev a {
    background: url('~static/images/miniBar/mini_1.svg') no-repeat;
    background-size: cover;
}
    
.songFunction .next a {
    background: url('~static/images/miniBar/mini_2.svg') no-repeat;
    background-size: cover;
}

.songFunction .play a,
.songFunction .stop a {
    display: inline-block;
    width: 32px;
    height: 32px;
}
    
.songFunction .play a {
    background: url('~static/images/miniBar/icon_play_1.svg') no-repeat;
}
    
.songFunction .stop a {
    background: url('~static/images/miniBar/icon_stop_1.svg') no-repeat;
}
/* 功能按钮样式 */
.functionWrapper {
    width: 103px;
    height: 42px;
    display: inline-block;
    margin-top: 3px;
    position: absolute;
}
.functionWrapper .volume {
    width: 19px;
    height: 13px;
    position: absolute;
    display: flex;
    align-items: center;
    top: 50%;
    margin-top: -7px;
    -webkit-app-region: no-drag;
}
    
.functionWrapper .volume .mute,
.functionWrapper .volume .muted {
    background-repeat: no-repeat;
    text-indent: -999px;
    width: 13px;
    height: 13px;
}
    
.functionWrapper .volume .mute {
    background: url('~static/images/miniBar/icon_3.svg') no-repeat;
}
    
.functionWrapper .volume .mute:hover {
    background: url('~static/images/miniBar/icon_3_2.svg') no-repeat;
    /* transition: all .5s; */
}
    
.functionWrapper .volume .muted {
    background: url('~static/images/miniBar/icon_4.svg') no-repeat;
}
    
.functionWrapper .volume .muted:hover {
    background: url('~static/images/miniBar/icon_4_2.svg') no-repeat;
    /* transition: all .5s; */
}
    
.functionWrapper .vol-slider-wrapper {
    width: 70px;
    height: 42px;
    position: absolute;
    left: 19px;
    z-index: 4000;
    -webkit-app-region: no-drag;
}
    
.functionWrapper #volSlider {
    position: relative;
    width: 70px;
    height: 1px;
    margin-top: -8px;
    border: none;
    cursor: pointer;
    background: #585555;
}
    
.functionWrapper #volSlider[type=range]::-webkit-slider-runnable-track {
    /* margin-top: -3px; */
    height: 1px;
}
    
.functionWrapper #volSlider[type=range]::-webkit-slider-thumb {
    margin-top: -1px;
    height: 5px;
    width: 5px;
    border-radius: 50%;
    background: #e13228;
}
.lyricWrap {
    position: absolute;
    left: 25px;
    top: 15px;
    line-height: 11px;
    -webkit-app-region: no-drag;
}
.lyricWrap .lyric-icon {
    width: 13px;
    height: 11px;
}
.functionWrapper .favour-icon,.favoured-icon {
    width: 16px !important;
    height: 14px !important;
    position: absolute;
    left: 49px;
    top: 14px;
    -webkit-app-region: no-drag
}
.functionWrapper .dislike-icon {
    width: 14px !important;
    height: 14px !important;
    position: absolute;
    left: 76px;
    top: 13px;
    -webkit-app-region: no-drag;
}
.functionWrapper .openlist {
    position: absolute;
    height: 12px;
    line-height: 12px;
    left: 77px;
    top: 15px;
    -webkit-app-region: no-drag;
}
    
.functionWrapper .openlist span.openlist-btn {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: url('~static/images/miniBar/icon_13.svg') no-repeat;
    padding-left: 3px;
    cursor: pointer;
}
    
.functionWrapper .openlist span.openlist-btn:hover {
    background: url('~static/images/miniBar/icon_13_2.svg') no-repeat;
    transition: all .5s;
}

/*播放条start*/
.miniSchedule {
    height: 2px;
    width: 320px;
    position: relative;
    -webkit-app-region: no-drag;
}    
input[type=range] {
    position: absolute; 
    width: 320px;
    height: 2px;
    -webkit-appearance: none;
    border-radius: 2px;
    cursor: pointer;
    background: rgba(153,153,153,0.4);
}
    
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    position: relative;
    top: -1px;
    left: -1px;
    height: 2px;
    width: 2px;
    border: 0;
    background: #e13228;
    cursor: pointer;
}
    
input[type=range]::-webkit-slider-runnable-track {
    height: 1px;
}
    
.minibar-wrapper #miniprogressSlider[type=range]::-webkit-slider-runnable-track {
    margin-bottom: 3px;
}
    
.minibar-wrapper #miniprogressSlider[type=range]::-webkit-slider-thumb {
    margin-top: -2px;
}
/*播放条end*/
.bg_mc {
    position: absolute;
    width: 100%;
        height: 100%;
        background: #fff;
        z-index: -1;
        opacity: 0.65;
}
</style>