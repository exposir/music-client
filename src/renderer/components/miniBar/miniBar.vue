<template>
    <div class="minibar-wrapper"
         onselectstart="return false;"
         v-cloak
         id="minibar">
        <div class="bg-mc"></div>
        <div class="panel">
            <div class="left-panel left-panel-bg">
                <ul class="play-btn">
                    <li class="prev">
                        <a class="wg-button"
                           title="上一首"
                           @click="prevSong()"><span class="wg-button-inner"></span></a>
                    </li>
                    <li class="play wg-button"
                        :class="{'play':currentPlayingState == 1,'stop':currentPlayingState != 1}"
                        id="playBtn"
                        title="播放"
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
            <!--<div class="song-img"
                 v-if="song && song.title"
                 @click="isShowLyric=!isShowLyric">-->
            <div class="song-img"
                 v-if="song && song.title"
                 @click="isshowLyric">
                <img class="song-lyric-link"
                     :src="song.pic_small"
                     v-if="song && song.pic_small" @error="setErrorImg($event)">
                <img class="song-lyric-link"
                     v-else
                     src="static/images/default_pic.svg">
                <div v-if="isShowLyric" class="songmask twocenter hidebtn"></div>
                <div v-else class="songmask twocenter showbtn"></div>
                
            </div>
            <div class="song-img"
                 v-else>
                <img src="static/images/default_pic.svg">
            </div>
            <div class="main-panel">
                <div class="title-wrapper">
                    <div class="title"
                         v-if="song && song.title">
                        <a class="songname"
                           v-if="song && song.title"
                           @click="isshowLyric">{{song.title}}</a>
                        <span class="split">-</span>
                        <div class="artist-box" :class="{radio:playingRadioInfo && playingRadioInfo.type != 'others'}">
                        <a class="artist"
                           v-if="song && song.author" v-for="(author,index) in song.authorLinksArr"
                           @click="goSingerPage(author.artist_id)">{{author.artist_name}}<i v-if="index<song.authorLinksArr.length-1">,</i></a>
                           </div>
                        <div class="radio_name" v-show="playingRadioInfo && playingRadioInfo.type != 'others'">{{playingRadioInfo?playingRadioInfo.scene_title:''}}</div>
                    </div>
                    <div v-else class="title">千千音乐 听见世界</div>
                    
                </div>
              
                <div class="progress-wrapper" >
                    <input v-if="song && song.title"
                           type="range"
                           id="progressSlider"
                           min="0"
                           @input="progressValChange($event)"
                           @mouseup="progressMouseUp($event)"
                           step="1"
                           value="0">
                    <input v-else
                           type="range"
                           id="progressSlider"
                           min="0"
                           disabled="disabled"
                           value="0">
                </div>
                <div class="time">
                    <span class="curTime" id="curTime">{{curtime}}</span>
                    <span class="totalTime" id="totalTime">{{showDuration}}</span>
                </div>
            </div>
            <div class="right-panel">
                <div class="playmod" v-show="playingRadioInfo && playingRadioInfo.type == 'others'">
                   <!-- <span class="list-mode"
                          v-show="mode == 'list'"
                          @click="changeMode('random',$event)"
                          title="顺序播放"></span>-->
                    <span class="loop-mode"
                          v-show="mode == 'loop'"
                          @click="changeMode('random',$event)"
                          title="循环播放"></span>
                    <span class="random-mode"
                          v-show="mode=='random'"
                          @click="changeMode('single',$event)"
                          title="随机播放"></span>
                    <span class="single-mode"
                          v-show="mode == 'single'"
                          @click="changeMode('loop',$event)"
                          title="单曲循环"></span>
                </div>
                 <div class="volume"
                     id="volumeWrap"
                     @mouseenter="isShowVolume=true"
                     @mouseleave="isShowVolume=false">
                    <a class="mute wg-button"
                       :class="{muted:isMuted=='1'}"
                       hidefocus="true"
                       title="音量开关"
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
                               :style='{background:"linear-gradient(to right, #333333 0%, #333333 " + volume + "%,#999 " + volume + "%, #999)"}'>
                    </div>
                </div>
                <lyric-icon></lyric-icon>
                <favour-icon v-if="isSongNet(song)" :type="'minibar'"  :data="song"></favour-icon>
                <favour-icon v-else :type="'minibar'" :data="song" :disabled="'disabled'"></favour-icon>
                <dislike-icon v-show="playingRadioInfo && playingRadioInfo.type != 'others'" v-if="isSongNet(song)" :type="'minibar'"  :data="{song:song,currentPlayIndex:currentPlayIndex}"></dislike-icon>
                <!-- <download-icon v-if="isSongCanDownload(song)" :type="'minibar'"  :data="song"></download-icon>
                <download-icon v-else :type="'minibar'" :data="song" :disabled="'disabled'"></download-icon> -->
                <more-icon :type="'minibar'" :data="{songArray:[song], type:'minibar', list_id:'', selectindex:0}"></more-icon>
                <div class="openlist" title="播放队列" v-show="playingRadioInfo && playingRadioInfo.type == 'others'">
                    <span class="openlist-btn"
                          @click="isShowPlayList=!isShowPlayList"></span>
                    <span class="song-number"
                          v-if="songsNumber>0">{{songsNumber}}</span>
                </div>
            </div>
        </div>
        <play-list v-bind:isShowPlayList="isShowPlayList"></play-list>
        <song-lyric v-bind:isShowLyric="isShowLyric"
                    v-bind:currentPlayingSong="song"></song-lyric>
        <div class="blurWrap">

        </div>
    </div>
</template>
<script scoped>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import playList from 'components/playList/playList'
    import songLyric from 'components/public/songLyric'
    import favourIcon from 'components/icons/favourIcon.vue'
    import dislikeIcon from 'components/icons/dislikeIcon.vue'
    import downloadIcon from 'components/icons/downloadIcon.vue'
    import moreIcon from 'components/icons/moreIcon.vue'
    import constant from '../../constant.js'
    import reportService from '../../service/reportService'
    import lyricIcon from 'components/icons/lyricIcon.vue'
    import updateService from "service/updateService.js"

    import os from 'os'
    import { setInterval, clearInterval } from 'timers';

    let ipc = require('electron').ipcRenderer;
    let play_pos_changed_value = -1;
    let pos_changed_flag = 0; //0:初始状态  1:前进   2:后退

    export default {
        name: "miniBar",
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
                playingRadioInfo: 'displayInfo',     //先取出local的电台信息，作为判断是否播放电台的依据
                loginUserInfo: 'loginUserInfo',
                loginStatus: 'loginStatus',
                lastPlayMode: 'lastPlayMode',
                shortCuts: 'shortCuts',
                downloadFolder: 'downloadFolder',
                cacheFolder: 'cacheFolder',
                cacheSize: 'cacheSize',
                enableGlobalShortCut: 'enableGlobalShortCut'
            }),
            songsNumber() {
                return this.playingList.length
            }
        },
        created() {
            //先获取设置的值，然后再取做初始化
            this.$store.dispatch('getCacheFolder')
            this.$store.dispatch('getCacheSize')
            this.$store.dispatch('getDownloadFolder')
            this.$store.dispatch('getDownloadLyricWithSong')
            this.$store.dispatch('getCloseMode')
            this.$store.dispatch('getPlayMode')
            this.$store.dispatch('getShortcutState')
            this.$store.dispatch('getDefaultPlayer')
            this.$store.dispatch('getVolume')
            this.$store.dispatch('getAutoPlay')
            this.$store.dispatch('getIsMuted')
            this.$store.dispatch('getDisplayInfo')
            

            if (process.platform == 'darwin') {
                this.macplayerInit();
            }
            //进入客户端时，如果是"私人电台"且"自动播放"，需重新拉取数据
            if ( this.playingRadioInfo && this.playingRadioInfo.type == "privateRadio" ){
                this.$store.dispatch('emptyCurrentPlayinglist')
                if ( this.autoplay == '1' ){
                    this.addSongsToPlayinglist("privateRadio", true, true) 
                } else {
                    this.$store.dispatch('setPlayingRadioInfo', { type: 'others' })
                    this.$store.dispatch('setDisplayInfo', { type: 'others' })
                    
                    this.$store.dispatch('resetCurrentPlayingState')
                }
            } else {
                this.$store.dispatch('getCurrentPlayingList', this.autoplay=='1'?true:false);
            }

            eventBus.$on('shortcut_ready', ()=>{
                let shortcut_data = {};
                shortcut_data.desc = 'shortcut_init';
                shortcut_data.data = this.shortCuts;
                console.log('read shortcut data ready, init shortcut')
                ipc.send('asynchronous-message', shortcut_data); 
            })
        },
        mounted() {
            const platform = os.platform() + '_' + os.arch();
            reportService.clickReport({ 'type': 8, 'system': platform });

            let param = {};
            param.cacheFolder = this.cacheFolder;
            param.cacheSize = Number(this.cacheSize);
            // console.log(param.cacheSize)
            this.$store.dispatch('initAudioCore', param);

            this.$store.dispatch('getDownloadingItems');
            this.$store.dispatch('getLocalSongList');
            this.$store.dispatch('getDownloadedSonglist');
            this.$store.dispatch('getHistoryList');
            this.$store.dispatch('getShortCuts');

            ////////////////////////////////////////////////////////
            //这些信号其实应该写在dwonloading.vue里面,但是downloading.vue创建的时机不合适，不是一直存在
            eventBus.$on('downloadprogresschanged', (param)=>{
                let percent = param.percent;
                this.$store.dispatch('updateDownloadTaskProgress', {'songid':param.songid, 'percent':percent});
            });

            eventBus.$on('downloaderror', (param)=>{
                let error = param.error;
                this.$store.dispatch('downloadTaskOccursError', {'songid':param.songid, 'error':error});
            });

            eventBus.$on('downloadfinished', (param)=>{
                // console.log('download finished emit');
                // console.log(param);
                console.log('download folder: ' + this.downloadFolder)
                this.$store.dispatch('downloadTaskFinished', { 'songid':param.songid, 'cached': param.cached, 'fileName':param.fileName, 'filepath': param.path });
            });
            /////////////////////////////////////////////

            eventBus.$on('playingstart', ()=>{
                console.log('playing start......................')
                play_pos_changed_value = -1;
                pos_changed_flag = 0;
                ipc.send('play-state-change', 'play_start');
                $('#playBtn').removeClass('stop')
                let param = {};
                param.duration = 0;
                this.$store.dispatch('getDuration', param);
                console.log('current song duration is: ' + param.duration);
                this.totalDuration = param.duration;

                $('#progressSlider').val(0);
                this.curtime = "00:00"
                $('#progressSlider').attr('max', this.totalDuration);
                this.showDuration = this.formatPosition(this.totalDuration);
                $('.totalTime').html(this.showDuration);
                document.getElementById('curTime').innerHTML = this.curtime;
                // $('#progressSlider').css('background', 'linear-gradient(to right, rgba(51,51,51,0.4) 0%, rgba(51,51,51,0.4) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');

                this.$store.dispatch('updateCurrentPlayngSongDuration', this.showDuration);

                this.$store.dispatch('setPlayingState', 1);
                this.$store.dispatch('setCurrentPlayingTimePos', 0)
            });

            eventBus.$on('playingended', ()=>{
                console.log('playing-ended.............................')
                this.minibarInit();
                this.nextSong(false);
                this.$store.dispatch('setCurrentPlayingTimePos', 0);
                this.$store.dispatch('setPlayingState', 0);
            });

            eventBus.$on('playingerror', ()=>{
                console.error('playing occurs error.........................')
                this.$store.dispatch('playErrorHandler', {"isAutoSwitch": true,"errorMsg": "网络错误"});
            })

            let me = this;
            this.updateProgressTimer = setInterval(()=>{
                if (me.currentPlayingState == 1) {
                    // console.log('update playing duration...................')
                        let param = {};
                        param.position = 0;
                        me.$store.dispatch('getPosition', param);
                        let update_pos = true;
                        if (play_pos_changed_value > 0 && pos_changed_flag != 0) {
                            if (pos_changed_flag == 1 && play_pos_changed_value > param.position) {
                                console.log('current playing pos is short than changed pos: ' + play_pos_changed_value)
                                update_pos = false;
                            } else if (pos_changed_flag == 2 && play_pos_changed_value < param.position) {
                                console.log('current playing pos is more than changed pos: ' + play_pos_changed_value)
                                update_pos = false;
                            }
                            
                        } 
                        if (update_pos) {
                            play_pos_changed_value = -1;
                            pos_changed_flag = 0;
                            me.curtime = me.formatPosition(param.position);
                            // console.log('current play position is: ' + param.position);

                            $('#progressSlider').val(param.position);
                            document.getElementById('curTime').innerHTML = me.curtime;
                            
                            let progress_percent = (param.position / me.totalDuration) * 100
                            $('#progressSlider').css('background', 'linear-gradient(to right, rgba(51,51,51) 0%, rgba(51,51,51) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');

                            me.$store.dispatch('setCurrentPlayingTimePos', param.position * 1000);
                        }

                } else {
                    ipc.send('play-state-change', 'play_stop');
                }
            }, 500)

            this.asyncMessage();

            //启动自动更新检查
            updateService.checkUpdate();
        },
        beforeDestroy() {
            console.log('minibar before destroyed...................');
            eventBus.$off('playing-start');
            eventBus.$off('playing-ended');
            eventBus.$off('playing-error');

            eventBus.$off('downloadprogresschanged');
            eventBus.$off('downloaderror');
            eventBus.$off('downloadfinished');
            eventBus.$off('shortcut_ready')
            
            clearInterval(this.updateProgressTimer);

            this.$store.dispatch('stop', true);
            this.$store.dispatch('uninitAudioCore');
        },
        components: {
            playList,
            songLyric,
            favourIcon,
            downloadIcon,
            moreIcon,
            lyricIcon,
            dislikeIcon
        },
        methods: {
            asyncMessage() {
                ipc.on('asynchronous-reply', (event, arg) => {
                    if (arg === 'shortcut_desklyric') {
                        if (this.enableGlobalShortCut == '0') {
                            return;
                        }
                        if(!this.isShowLyric) {
                            this.isShowLyric = true
                            ipcRenderer.send('asynchronous-message','new_lyr_window')  
                        } else {
                            this.isShowLyric = false
                            ipcRenderer.send('asynchronous-message','close_lyr')  
                        }
                    } else if (arg === 'shortcut_playpause') {
                        if (this.enableGlobalShortCut == '1') {
                           this.playOrPause(event);
                        }
                    } else if (arg === 'shortcut_playprev') {
                        if (this.enableGlobalShortCut == '1') {
                           this.prevSong();
                        }
                    } else if (arg === 'shortcut_playnext') {
                        if (this.enableGlobalShortCut == '1') {
                           this.nextSong(true);
                        }
                    } else if (arg === 'shortcut_volume') {
                        if (this.enableGlobalShortCut == '1') {
                           this.muted();
                        }
                    } else if (arg === 'shortcut_volume_up') {
                        if (this.enableGlobalShortCut == '0') {
                            return;
                        }
                        let volume = this.volume + 5 > 100 ? 100 : this.volume + 5;
                        this.setVolume(volume)
                        $('#volSlider').css('background', 'linear-gradient(to right, #333333 0%, #333333 ' + volume + '%,#999 ' + volume + '%, #999)');
                    } else if (arg === 'shortcut_volume_down') {
                        if (this.enableGlobalShortCut == '0') {
                            return;
                        }
                        let volume = this.volume - 5 > 100 ? 100 : this.volume - 5;
                        this.setVolume(volume)
                        $('#volSlider').css('background', 'linear-gradient(to right, #333333 0%, #333333 ' + volume + '%,#999 ' + volume + '%, #999)');
                    } else if (arg === 'shortcut_fast_forward') {
                        if (this.enableGlobalShortCut == '1') {
                            this.$store.dispatch('playFastForward')
                        }
                    } else if (arg === 'shortcut_rewind') {
                        if (this.enableGlobalShortCut == '1') {
                            this.$store.dispatch('playRewind')
                        }  
                    } else if (arg === 'traymenu_play' ||
                               arg === 'traymenu_stop') {
                        this.playOrPause(event);
                    } else if (arg === 'traymenu_prev') {
                        this.prevSong();
                    } else if (arg === 'traymenu_next') {
                        this.nextSong();
                    } else if (arg === 'traymenu_setup') {
                        this.$router.push('/setup')
                    }
                })
            },
            setErrorImg(event) {
                event.target.src = 'static/images/default_pic.svg'
            },
            formatPosition(pos) {
                let minutes = parseInt(pos/60);
                let seconds = pos-60*minutes;;

                let minutes_str = minutes;
                if (minutes < 10) {
                    minutes_str = '0' + minutes;
                }
                let seconds_str = seconds;
                if (seconds < 10) {
                    seconds_str = '0' + seconds;
                }
                let position = minutes_str + ":" + seconds_str;
                return position;
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
                        $('#volSlider').css('background', 'linear-gradient(to right, #333333 0%, #333333 ' + volume + '%,#999 ' + volume + '%, #999)');
                    }
                }
            },
            isSongNet(song) {
                let songid = this.commonFuns.getSongId(song);
                if (songid.length > 1 && songid.indexOf('_local') == -1) {
                    return true;
                }
                return false;
            },
            isSongCanDownload(song) {
                return this.commonFuns.isSongCanDownload(song);
            },
            //是否显示单曲页
            isshowLyric() {
                if ( this.playingRadioInfo.type == 'privateRadio' ) {
                    if ( this.$route.path.indexOf('privateRadio') > -1 ) {
                        return false
                    } else {
                        this.$router.push({
                            path: '/privateRadio'
                        })
                        return false
                    }
                }
                ipc.send('asynchronous-message', 'ismaximize_main_window'); //询问主进程若最大化，需要关闭最大化
                this.isShowLyric = !this.isShowLyric
                if (this.isShowLyric) {
                    document.querySelector('.panel').classList.add('songLyric-page')
                    document.querySelector('.left-panel').classList.remove('left-panel-bg')
                } else {
                    document.querySelector('.panel').classList.remove('songLyric-page')
                    document.querySelector('.left-panel').classList.add('left-panel-bg')
                }

            },
            //设置声音
            setVolume(num) {
                this.$store.dispatch('setPlayVolume', num);
            },
            //点击/拖动播放条,拖动过程中不更新播放进度，否则播放核心可能会出问题
            progressValChange(event) {
                let progressSliderVal = event.target.value;
                console.log('progressSliderVal is: ' + progressSliderVal)
                let param = {};
                param.position = 0;
                this.$store.dispatch('getPosition', param);
                play_pos_changed_value = progressSliderVal;
                if (progressSliderVal > param.position) {
                    pos_changed_flag = 1;
                } else {
                    pos_changed_flag = 2;
                }

                // this.$store.dispatch('setPosition', progressSliderVal*1000)
                let progress_percent = (progressSliderVal / this.totalDuration) * 100
                $('#progressSlider').css('background', 'linear-gradient(to right, rgba(51,51,51) 0%, rgba(51,51,51) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');
            },
            //鼠标松开的时候更新播放进度
            progressMouseUp(event) {
                let progressSliderVal = event.target.value;
                console.log('progress slide mouse up is: ' + progressSliderVal)
                let param = {};
                param.position = 0;
                this.$store.dispatch('getPosition', param);
                play_pos_changed_value = progressSliderVal;
                if (progressSliderVal > param.position) {
                    pos_changed_flag = 1;
                } else {
                    pos_changed_flag = 2;
                }

                this.$store.dispatch('setPosition', progressSliderVal*1000)
            },
            changeMode(mode, event) {
                this.mode = mode;
                // this.playerObj.setMode(mode);
                this.$store.dispatch('setPlayMode', mode);
            },
            playOrPause(event) {
                console.log('play state is: ' + this.currentPlayingState);
                play_pos_changed_value = -1;
                pos_changed_flag = 0;
                if ((this.currentPlayingState != 1) && this.song.title) { //暂停状态 点击播放
                    // console.log('play clicked.............')
                    if (this.currentPlayingState == 0) {
                        this.$store.dispatch('playingSong', true)
                    } else {
                        this.$store.dispatch('play');
                    }
                } else if(this.currentPlayingState == 1){ 
                    //播放状态 点击暂停
                    // console.log('pause clicked...........')
                    console.log('click pause song is: ' + this.song.title)
                    this.$store.dispatch('pause');
                }
            },
            //静音
            muted() {
                let isMuted = '0';
                let isMute = false;
                if (this.isMuted == '1') {
                    isMuted = '0';
                    isMute = false;
                    // this.playerObj.setMute(false);
                } else { //设置静音
                    isMuted = '1';
                    isMute = true;
                    // this.playerObj.setMute(true);
                }
                console.log('isMuted is: ' + isMuted);
                this.$store.dispatch('setMute', isMute);
                this.$store.dispatch('setIsMuted', isMuted);
            },
            volumeChange(event) {
                if(this.isMuted == 1) {
                    this.$store.dispatch('setMute', false);
                    this.$store.dispatch('setIsMuted', 0);
                }
                let volume = event.target.value;
                this.setVolume(volume);
                // this.$store.dispatch('setPlayVolume', volume);
                $('#volSlider').css('background', 'linear-gradient(to right, #333333 0%, #333333 ' + volume + '%,#999 ' + volume + '%, #999)');
            },
            showVolumeTip(event) {
                let volume = Math.ceil(Math.abs(event.offsetX) * (130 / 100))
                volume = volume < 100 ? volume : 100
                $('#volSlider').attr('title', volume)
            },
            prevSong() {
                // this.playerObj.stop()
                // 播放电台时，如果正在播放列表中第一首时，则不可切到上一首
                if(this.playingRadioInfo && this.playingRadioInfo.type != 'others' && this.currentPlayIndex == 0){
                    this.commonFuns.createTips("已经是第一首了")
                    return false
                }

                $('#progressSlider').val(0)
                $('#progressSlider').css('background', '#f2f2f2')
                this.$store.dispatch('playPrevOrNextSong', {
                    "isPrev": true,
                    "isMouseClicked": true
                })
            },
            nextSong(isClicked) {
                // this.playerObj.stop();
                $('#progressSlider').val(0)
                $('#progressSlider').css('background', '#f2f2f2')
                this.$store.dispatch('playPrevOrNextSong', {
                    "isPrev": false,
                    "isMouseClicked": isClicked
                })
            },
            minibarInit() {
                $('#progressSlider').val(0);
                $('#progressSlider').css('background', '#f2f2f2');
                this.curtime = "00:00";
                this.$store.dispatch('setPlayingState', 0);
            },
            macplayerInit() {
                if (process.platform != 'darwin') {
                    return;
                }
                let params = {};
                params.player = null;
                this.$store.dispatch('getMacPlayer', params);
                let macPlayer = params.player;
                console.log(macPlayer);

                let me = this;
                macPlayer.setMode(this.mode)
                macPlayer.setVolume(this.volume)
                if (me.isMuted == '1') { //初始化 静音模式
                    macPlayer.setMute(true)
                }
                macPlayer.on('loadstart', function() {
                    console.log('loadstart')
                }).on('waiting', function() {
                    console.log('waiting')
                }).on('loadeddata', function() {
                    macPlayer.setVolume(this.volume);
                }).on('player:play', function() {
                    // eventBus.$emit('playingstart');
                    console.log('playing start......................')
                    ipc.send('play-state-change', 'play_start');
                    $('#playBtn').removeClass('stop')
                    me.$store.dispatch('setPlayingState', 1);
                }).on('playing pause', function() {
                    if (me.currentPlayingState == '1') {
                        ipc.send('play-state-change', 'play_start');
                    } else if (me.currentPlayingState == '2') {
                        ipc.send('play-state-change', 'play_stop');
                    }
                }).on('timeupdate', function() {
                    let curpos = macPlayer.curPos();
                    me.$store.dispatch('setCurrentPlayingTimePos', curpos * 1000)
                    let showCurpos = macPlayer.curPos(true);
                    // console.log('showCurpos is: ' + showCurpos)
                    $('#progressSlider').val(curpos);
                    me.curtime = showCurpos
                    //不能播放的歌曲时被js重置为0。所以这里也只能用js控制
                    document.getElementById('curTime').innerHTML = showCurpos;

                    let duration = macPlayer.duration();
                    me.totalDuration = duration;
                    let showDuration = macPlayer.duration(true);
                    $('#progressSlider').attr('max', duration);
                    // console.log('total duration is: ' + duration)
                    $('.totalTime').html(showDuration);
                    // console.log('showDuration is: ' + showDuration);

                    let progress_percent = (curpos / duration) * 100
                    $('#progressSlider').css('background', 'linear-gradient(to right, rgba(51,51,51) 0%, rgba(51,51,51) ' + progress_percent + '%,rgba(153,153,153,0.4) ' + progress_percent + '%, rgba(153,153,153,0.4))');

                    me.$store.dispatch('updateCurrentPlayngSongDuration', showDuration);
                }).on('player:fetchend', function(r) {
                    console.log('player:fetchend');
                }).on('ended', function() {
                    eventBus.$emit('playingended');
                }).on('error', function(e) {
                    eventBus.$emit('playingerror')
                });
            },

            //跳转歌手页
            goSingerPage(artist_id) {
                this.$router.push({
                    path: '/music/public/singer/' + artist_id + '/0'
                })
                if (this.isShowLyric) {
                    this.isShowLyric = false
                    ipc.send('asynchronous-message', 'ismaximize_main_window'); //询问主进程若最大化，需要关闭最大化
                }
            },
            //播放"电台"和"私人电台"时，拉取新数据加入播放列表(即this.playingRadioInfo.type != 'others')
            addSongsToPlayinglist( type, isPlay = false, isReset = false ){
                if ( type == 'privateRadio') {
                    this.$store.dispatch('getPrivateRadio',{
                        "limit": 10,
                        "city": this.loginUserInfo.province,
                        "from": "weixin"
                    }).then((res)=>{
                        this.$store.dispatch('addSongsToCurrentPlayinglist', { 
                            "songArray": res,
                            "playIndex": 0,
                            "isPlay": isPlay,
                            "isReset": isReset,
                            "infoForPlayRadio": {
                                type: "privateRadio",
                                scene_title: "私人电台"
                            }
                        })
                    })
                } else if ( type == 'radio' ){
                    this.$store.dispatch('playWholeRadio', {
                        scene_id: this.playingRadioInfo.scene_id, 
                        scene_title: this.playingRadioInfo.scene_title,
                        category_id: this.playingRadioInfo.category_id,
                        addToList: true
                    })
                }

            }
        },
        watch: {
            playingRadioInfo(now, before){
                if ( now.type == "others" && before.type != "others" ) {
                    if ( this.lastPlayMode ) {
                        this.$store.dispatch('setPlayMode', this.lastPlayMode);
                    }
                }
                if ( now.type != "others" && before.type == "others" ) {
                    this.$store.dispatch('setLastPlayModel', this.mode);
                    this.$store.dispatch('setPlayMode', 'loop');
                }
            },
            song(now, before){
                //通知主进程当前播放歌曲的名称
                let tray_data = {};
                tray_data.desc = 'traymenu_songname';
                if (now && now.title && now.title.length>0) {
                    tray_data.data = now.title;
                } else {
                    tray_data.data = '千千音乐'
                }
                console.log('tray menu song name is: ' + tray_data.data)
                
                ipc.send('asynchronous-message', tray_data); 

                if ( this.playingRadioInfo.type == "privateRadio" ) {
                    this.$store.dispatch('setCurrentPlayingPrivateRadio',now)
                }
            },
            //播放"电台"和"私人电台"时，点击上/下曲时currentPlayIndex发生变化
            currentPlayIndex(now, before){
                if ( now >= this.playingList.length-2 ) {
                    if(this.playingRadioInfo && this.playingRadioInfo.type != 'others' && this.playingList.length != 0 ){
                        this.addSongsToPlayinglist(this.playingRadioInfo.type)
                    }
                }
            },
            //播放"电台"和"私人电台"时，删除歌曲时playingList发生变化
            playingList(now, before){
                //通知主进程当前播放列表大小
                let tray_data = {};
                tray_data.desc = 'traymenu_listsize';
                tray_data.data = now.length;
                ipc.send('asynchronous-message', tray_data); 

                if ( this.currentPlayIndex >= now.length -2 ) {
                    if(this.playingRadioInfo && this.playingRadioInfo.type != 'others' && this.playingList.length != 0 ){
                        this.addSongsToPlayinglist(this.playingRadioInfo.type)
                    }
                }
            },
            currentPlayingState() {
                //通知主进程当前播放状态
                let tray_data = {};
                tray_data.desc = 'traymenu_playstate';
                tray_data.data = this.currentPlayingState;
                ipc.send('asynchronous-message', tray_data); 
            },
            loginStatus(now, before){
                if ( this.playingRadioInfo && this.playingRadioInfo.type == 'privateRadio' && !now ) {
                    this.$store.dispatch('setPlayingRadioInfo', { type: 'others' })
                    this.$store.dispatch('setDisplayInfo', { type: 'others' })
                    this.$store.dispatch('emptyCurrentPlayinglist')
                    this.$store.dispatch('resetCurrentPlayingState')
                }   
            }
        }
    }

    // $(function () {
    //     // let volume = $('#volSlider').val();

    //     // $('#volSlider').css('background', 'linear-gradient(to right, #22c5bd 0%, #22c5bd ' + volume + '%,#999 ' + volume + '%, #999)');
    // })
</script>
<style scoped>
    .minibar-wrapper {
        font-size: 14px;
        height: 70px;
        text-align: right;
        position: absolute;
        bottom: 0px;
        left: 0;
        width: 100%;
        z-index: 3000;
        /* border-top: solid 1px #e3e3e3; */
    }
    /*layout start*/
    
    .minibar-wrapper .panel {
        height: 70px;
        width: 100%;
        display: flex;
        position: relative;
        z-index: 4000;
        background-color: transparent;
    }
    
    .minibar-wrapper .left-panel {
        flex: 0 0 161px;
        height: 100%;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-around;
        align-items: center;
    }
    
    /* .minibar-wrapper .left-panel-bg {
        background-color: #ebf0f1;
    } */
    
    .minibar-wrapper .song-img {
        flex: 0 0 50px;
    }
    
    .minibar-wrapper .main-panel {
        margin-right: 22px;
        flex: 1 1 508px;
    }
    
    .minibar-wrapper .right-panel {
        flex: 0 0 210px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-right: 18px;
    }
    /*layout end*/
    /**play or pause btn start**/
    
    .minibar-wrapper .play-btn {
        display: flex;
        flex: 0 0 122px;
        justify-content: space-between;
        align-items: center;
    }
    
    .minibar-wrapper .wg-button {
        display: inline-block;
        position: relative;
        padding: 0;
        cursor: pointer;
        text-align: center;
        overflow: hidden;
        border: none;
        outline: none;
    }
    
    .minibar-wrapper .prev a,
    .next a {
        text-indent: -999px;
        width: 28px;
        height: 28px;
    }
    
    .minibar-wrapper .prev a {
        background: url('~static/images/miniBar/icon1.svg') no-repeat;
        background-size: cover;
    }
    
    .minibar-wrapper .prev a:hover {
        background: url('~static/images/miniBar/icon1_1.svg') no-repeat;
        background-size: cover;
    }
    
    .minibar-wrapper .next a {
        background: url('~static/images/miniBar/icon2.svg') no-repeat;
        background-size: cover;
    }
    
    .minibar-wrapper .next a:hover {
        background: url('~static/images/miniBar/icon2_1.svg') no-repeat;
        background-size: cover;
    }
    
    .minibar-wrapper .play a,
    .minibar-wrapper .stop a {
        display: inline-block;
        width: 36px;
        height: 36px;
    }
    
    .minibar-wrapper .play a {
        background: url('~static/images/miniBar/icon_play.svg') no-repeat;
    }
    
    .minibar-wrapper .stop a {
        background: url('~static/images/miniBar/icon_stop.svg') no-repeat;
    }
    
    .minibar-wrapper .play a:hover {
        background: url('~static/images/miniBar/icon_play_1.svg') no-repeat;
    }
    
    .minibar-wrapper .stop a:hover {
        background: url('~static/images/miniBar/icon_stop_1.svg') no-repeat;
    }
    /**play or pause btn end**/
    /**歌曲信息部分start**/
    
    .minibar-wrapper .main-panel .title-wrapper {
        width: 100%;
        padding-top: 6px;
        height: 24px;
        display: flex;
    }
    
    .minibar-wrapper .main-panel .title {
        flex: 1 1 380px;
        height: 24px;
        line-height: 24px;
        text-align: left;
        display: flex;
    }
    
    .minibar-wrapper .main-panel .title a.songname {
        max-width: 200px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        color: #333333;
    }
    
    .minibar-wrapper .main-panel .title .split {
        padding: 0;
        vertical-align: top;
    }
    
    .minibar-wrapper .main-panel .title .artist-box {
        max-width: 280px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        color: #999999;
        margin-right: auto;
    }

    .minibar-wrapper .main-panel .title .artist-box.radio {
        max-width: 220px;
    }
    
    .minibar-wrapper .main-panel .title .artist {
        font-size: 12px;
    }
    
    .minibar-wrapper .main-panel .title .artist:hover {
        color: #333333;
    }
    .minibar-wrapper .main-panel .radio_name {
        display: flex;
        justify-content: center;
        height: 18px;
        margin: auto 0;
        padding: 4px 7px;
        background-color: rgba(51,51,51,0.2);
        color: #ffffff;
        font-size: 11px;
        line-height: 10px;
        border-radius: 2px;
        font-weight: 100;
    }
    
    .minibar-wrapper .main-panel .flag-icon {
        flex: 1 1 90px;
    }
    
    .minibar-wrapper .main-panel .time {
        flex: 1 1 72px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    /*.minibar-wrapper .mv {
        width: 36px;
        height: 17px;
        background: url(./images/musicplay_icon.png) no-repeat -171px 0;
        margin-right: 15px;
    }
    
    .minibar-wrapper .dujia {
        width: 34px;
        height: 15px;
        border: 1px solid #dbebf6;
        border-radius: 4px;
        line-height: 15px;
        margin-right: 15px;
    }*/
    
    .minibar-wrapper .progress-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 17px;
    }
    
    /**歌曲信息部分end**/
    /*播放条start*/
    
    input[type=range] {
        flex: 1 1 470px;
        height: 2px;
        -webkit-appearance: none;
        border-radius: 2px;
        cursor: pointer;
        background: rgba(153,153,153,0.4);
    }
    
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        position: relative;
        height: 8px;
        width: 8px;
        border: 0;
        border-radius: 50%;
        background: #333333;
        cursor: pointer;
        box-shadow: 0 2px 7px -5px rgba(0, 0, 0, 1);
    }
    
    input[type=range]::-webkit-slider-runnable-track {
        height: 1px;
    }
    
    .minibar-wrapper #progressSlider[type=range]::-webkit-slider-runnable-track {
        margin-bottom: 3px;
    }
    
    .minibar-wrapper #progressSlider[type=range]::-webkit-slider-thumb {
        margin-top: -2px;
    }
    /*播放条end*/
    /*** 声音、播放模式、播放列表start*/
    
    .minibar-wrapper .volume {
        width: 18px;
        height: 20px;
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .minibar-wrapper .volume .mute,
    .minibar-wrapper .volume .muted {
        background-repeat: no-repeat;
        text-indent: -999px;
        width: 18px;
        height: 20px;
    }
    
    .minibar-wrapper .volume .mute {
        background: url('~static/images/miniBar/icon_3.svg') no-repeat;
    }
    
    .minibar-wrapper .volume .mute:hover {
        background: url('~static/images/miniBar/icon_3_2.svg') no-repeat;
        transition: all .5s;
    }
    
    .minibar-wrapper .volume .muted {
        background: url('~static/images/miniBar/icon_4.svg') no-repeat;
    }
    
    .minibar-wrapper .volume .muted:hover {
        background: url('~static/images/miniBar/icon_4_2.svg') no-repeat;
        transition: all .5s;
    }
    
    .minibar-wrapper .vol-slider-wrapper {
        width: 130px;
        height: 55px;
        transform: rotate(-90deg);
        position: absolute;
        right: -55px;
        bottom: 50px;
        background: url(./images/volume.png) no-repeat;
        z-index: 4000;
    }
    
    .minibar-wrapper #volSlider {
        position: relative;
        width: 76px;
        height: 2px;
        margin: 26px 20px 23px auto;
        border: none;
        cursor: pointer;
        background: #d3d3d3;
    }
    
    .minibar-wrapper #volSlider[type=range]::-webkit-slider-runnable-track {
        margin-top: -2px;
        height: 2px;
    }
    
    .minibar-wrapper #volSlider[type=range]::-webkit-slider-thumb {
        margin-top: -2px;
        /* margin-left: 0.5px; */
        height: 8px;
        width: 8px;
        background: #333333;
    }
    
    .minibar-wrapper .playmod {
        width: 18px;
        height: 20px;
        overflow: hidden;
    }
    
    .minibar-wrapper .playmod span {
        display: inline-block;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
    
    .playmod .loop-mode {
        background: url('~static/images/miniBar/icon_8.svg') no-repeat;
    }
    
    .playmod .loop-mode:hover {
        background: url('~static/images/miniBar/icon_8_2.svg') no-repeat;
        transition: all .5s;
    }
    /*.playmod .list-mode {
        background: url('~static/images/miniBar/icon_6.svg') no-repeat;
    }
    .playmod .list-mode:hover {
         background: url('~static/images/miniBar/icon_6.svg') no-repeat;
    }*/
    
    .playmod .single-mode {
        background: url('~static/images/miniBar/icon_7.svg') no-repeat;
    }
    
    .playmod .single-mode:hover {
        background: url('~static/images/miniBar/icon_7_2.svg') no-repeat;
        transition: all .5s;
    }
    
    .playmod .random-mode {
        background: url('~static/images/miniBar/icon_5.svg') no-repeat;
    }
    
    .minibar-wrapper .playmod span.random-mode {
        height: 17px;
    }
    
    .playmod .random-mode:hover {
        background: url('~static/images/miniBar/icon_5_2.svg') no-repeat;
        transition: all .5s;
    }
    
    .minibar-wrapper .openlist {
        position: relative;
        display: flex;
        flex-flow: row nowrap;
        top: -2px;
    }
    
    .minibar-wrapper .openlist span.openlist-btn {
        display: inline-block;
        width: 15px;
        height: 15px;
        background: url('~static/images/miniBar/icon_13.svg') no-repeat;
        padding-left: 3px;
        cursor: pointer;
    }
    
    .minibar-wrapper .openlist span.openlist-btn:hover {
        background: url('~static/images/miniBar/icon_13_2.svg') no-repeat;
        transition: all .5s;
    }
    
    .minibar-wrapper .song-number {
        font-size: 12px;
        max-width: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
    }
    /*** 声音、播放模式、播放列表end*/
    
    .minibar-wrapper .song-img {
        margin: 10px 10px 10px 17px;
        border: 0;
        position: relative;
        cursor: pointer;
    }
    
    .minibar-wrapper .song-img img {
        width: 50px;
        height: 50px;
        border-radius: 2px;
        border: 0;
    }
    
    .minibar-wrapper .song-lyric-link {
        cursor: pointer
    }
    
    .minibar-wrapper .song-img .songmask {
        position: absolute;
        top: 0;
        right: 0;
        width: 50px;
        height: 50px;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        transition: opacity 0.3s;
        -webkit-transition: opacity 0.3s;
    }
    
    .minibar-wrapper .song-img .songmask:before {
        content: "";
        display: inline-block;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -8px;
        margin-top: -8px;
        width: 16px;
        height: 16px;
        background: url(../../common/images/islyricshow_icon.png) no-repeat;
        background-size: 16px auto;
    }
    
    .minibar-wrapper .song-img:hover .songmask {
        opacity: 1;
    }
    
    .minibar-wrapper .song-img .songmask.hidebtn:before {
        -webkit-transform: rotate(180deg);
        transform: rotate(180deg);
        transition: transform 0.3s;
        -webkit-transition: transform 0.3s;
        transform-origin: 50% 50%;
        -webkit-transform-origin: 50% 50%;
    }
    
    .minibar-wrapper .songLyric-page.panel {
        background-color: rgba(0, 0, 0, .3);
    }

    .songLyric-page .play a {
        background: url('~static/images/miniBar/icon_play_2.svg') no-repeat;
    }
    
    .songLyric-page .stop a {
        background: url('~static/images/miniBar/icon_stop_2.svg') no-repeat;
    }

    .songLyric-page .prev a {
        background: url('~static/images/miniBar/icon1_2.svg') no-repeat;
    }
    
    .songLyric-page .next a {
        background: url('~static/images/miniBar/icon2_2.svg') no-repeat;
    }

    .songLyric-page .openlist span.openlist-btn {
        background: url('~static/images/miniBar/icon_13_1.svg') no-repeat;
    }
    
    .songLyric-page .more-icon {
        background: url('~static/images/miniBar/icon_12_1.svg') no-repeat;
    }

    .songLyric-page .lyric-icon {
        background: url('~static/images/miniBar/lyc_3.svg') no-repeat;
    }
    
    .songLyric-page .download-icon {
        background: url('~static/images/miniBar/icon_11_1.svg') no-repeat;
    }
    
    .songLyric-page .favour-icon {
        background: url('~static/images/miniBar/icon_10_1.svg') no-repeat;
    }

    .songLyric-page .dislike-icon {
        background: url('~static/images/miniBar/icon_dislike_1.svg') no-repeat;
    }
    
    .songLyric-page .playmod .loop-mode {
        background: url('~static/images/miniBar/icon_8_1.svg') no-repeat;
    }
    
    .songLyric-page .playmod .single-mode {
        background: url('~static/images/miniBar/icon_7_1.svg') no-repeat;
    }
    
    .songLyric-page .playmod .random-mode {
        background: url('~static/images/miniBar/icon_5_1.svg') no-repeat;
    }
    
    .songLyric-page .volume .mute {
        background: url('~static/images/miniBar/icon_3_1.svg') no-repeat;
    }
    
    .songLyric-page .volume .muted {
        background: url('~static/images/miniBar/icon_4_1.svg') no-repeat;
    }
    
    .songLyric-page .openlist span.openlist-btn:hover {
        background: url('~static/images/miniBar/icon_13_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .more-icon:not(.disabled):hover {
        background: url('~static/images/miniBar/icon_12_3.svg') no-repeat;
        transition: all .5s;
    }

    .songLyric-page .lyric-icon:not(.disabled):hover {
        background: url('~static/images/miniBar/lyc_2.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .download-icon:not(.disabled):hover {
        background: url('~static/images/miniBar/icon_11_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .favour-icon:not(.disabled):hover {
        background: url('~static/images/miniBar/icon_10_3.svg') no-repeat;
        transition: all .5s;
    }

    .songLyric-page .dislike-icon:not(.disabled):hover {
        background: url('~static/images/miniBar/icon_dislike_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .playmod .loop-mode:hover {
        background: url('~static/images/miniBar/icon_8_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .playmod .single-mode:hover {
        background: url('~static/images/miniBar/icon_7_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .playmod .random-mode:hover {
        background: url('~static/images/miniBar/icon_5_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .volume .mute:hover {
        background: url('~static/images/miniBar/icon_3_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .songLyric-page .volume .muted:hover {
        background: url('~static/images/miniBar/icon_4_3.svg') no-repeat;
        transition: all .5s;
    }
    
    .minibar-wrapper .songLyric-page .main-panel .title-wrapper {
        visibility: hidden;
    }
    
    .minibar-wrapper .songLyric-page .main-panel .time,
    .minibar-wrapper .songLyric-page .song-number {
        color: #bcbcbc;
    }

    /* .blurWrap {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        background-color: rgba(0,0,0,0.3);
        -webkit-filter: blur(20px);
        -moz-filter: blur(20px);
        -ms-filter: blur(20px);
        -o-filter: blur(20px);
        filter: blur(20px);   
    } */
    .bg-mc {
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        background: #ffffff;
        opacity: 0.65;
    }
</style>