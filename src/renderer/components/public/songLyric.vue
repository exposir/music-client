<template>
<transition  v-on:enter="enter" v-on:leave="leave">
<div class="song-wrapper" :class="{'maxWindow':isWindowMax}" v-show="isShowLyric" v-if="currentPlayingSong">
    <div class="song-lyric-box">
    <div class="song_bg">
        <img v-if="currentPlayingSong.pic_huge" :src="currentPlayingSong.pic_huge">
        <img v-else-if="currentPlayingSong.pic_big" :src="currentPlayingSong.pic_big">
        <img v-else-if="currentPlayingSong.pic_premium" :src="currentPlayingSong.pic_premium">
        <img v-else-if="currentPlayingSong.pic_small" :src="currentPlayingSong.pic_small">
        <img v-else src="static/images/default_pic.svg">
    </div>
    <div class="song-mask"></div>
    <div class="icon-box">
        <!-- <div v-if="!isWindowMax"> -->
            <span @click="closePage" title="返回" class="goback-btn normal-window">返回</span>
        <!-- </div>
        <div v-if="isWindowMax">
            <span @click="closePage" title="返回" class="close-btn">返回</span> -->
            <!-- <span class="maximize-btn" @click="maximize()" v-if="!isWindowMax"></span>
            <span class="maximize-btn unmaximize-btn" @click="unmaximize()" v-if="isWindowMax"></span> -->
        <!-- </div> -->
    </div>
    <div class="lyric-wrapper">
        <div class="left-box">
            <div class="song-pic">
                <img v-if="currentPlayingSong.pic_premium" :src="currentPlayingSong.pic_premium">
                <img v-else-if="currentPlayingSong.pic_huge" :src="currentPlayingSong.pic_huge">
                <img v-else-if="currentPlayingSong.pic_big" :src="currentPlayingSong.pic_big">
                <img v-else-if="currentPlayingSong.pic_small" :src="currentPlayingSong.pic_small">
                <img v-else src="static/images/default_pic.svg">
            </div>
            <h3 class="song-title">{{currentPlayingSong.title}}</h3>
            <p class="singer-margin"><span>歌手：</span><span class="link song-author" @click="goSingerPage">{{currentPlayingSong.author}}</span></p>
            <p><span>专辑：</span><span class="link song-album" @click="goAlbumPage">{{currentPlayingSong.album_title}}</span></p>
        </div>
        <div class="right-box">
            <div class="song-lrc-box" v-if="lyricData.length>0 && lyricData[0].time">
                <ul class="lrc-box" id="lyricBox">
                    <li v-for="(item,index) in lyricData" :class="{now:(item.time && currentPlayingTimePos>=item.time) && (lyricData[index+1] && currentPlayingTimePos<=lyricData[index+1].time)}">{{item.lyric}}</li>
                </ul>
            </div>
            <div class="song-lrc-box song-text-lrc-box" v-if="lyricData.length>0 && !lyricData[0].time">
                <ul class="lrc-box txt-lrc-box">
                    <li v-for="lyric in lyricData">{{lyric}}</li>
                </ul>
            </div>
            <div class="song-lrc-box no-lyric-tips-box" v-if="lyricData.length<1">
                <div class="no-lyric-tips">暂无歌词</div>
            </div>
        </div>
    </div>
    </div>
</div>
</transition>
</template>
<script>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import {
        app,
        BrowserWindow,
        autoUpdater,
        crashReporter
    } from 'electron'
    let ipc = require('electron').ipcRenderer;
    import Velocity from 'velocity-animate'
    let self = null;
    export default {
        name: 'song-lyric',
        data() {
            return {
                scroll_top: 0,
                current_song: [],
                isWindowMax: false,
                closeLyr:false
            }
        },
        props: {
            currentPlayingSong: Object,
            isShowLyric: Boolean,
        },
        computed: mapGetters({
            currentPlayingTimePos: 'currentPlayTimePos',
            lyricData: 'currentPlayingSongLyric',
            isPureTextLyric: 'isCurrentPureTextLyric'
        }),
        created() {
            self = this
            //接受主进程消息
            ipc.on('asynchronous-reply', (event, arg) => {
                if (arg === 'maximize_main_window') {
                    this.isWindowMax = true;
                    // this.$parent.$data.isShowLyric = true
                } else if (arg === 'unmaximize_main_window') {
                    this.isWindowMax = false;
                    // this.$parent.$data.isShowLyric = false
                }
            })
            ipc.on('lyrClose',(event, arg) => {
                if(arg == 'close') {
                    self.closeLyr = true
                }
            })
            
        },
        watch: {
            currentPlayingTimePos: (newValue, oldValue) => {
               // console.log(self.currentPlayingTimePos)
                   ipc.send('lyr-time', self.currentPlayingTimePos)
                    ipc.send('lyr-txt', self.lyricData)

                
              // bus.$emit('lyr',newValue)
                if(document.getElementById('lyricBox')){
                    document.getElementById('lyricBox').style.top ='0'
                }
                
                if (document.getElementsByClassName('now').length > 0) {
                    let offsetTop = document.getElementsByClassName('now')[0].offsetTop
                    if (offsetTop > 238) {
                        offsetTop = -offsetTop + 238;
                        document.getElementById('lyricBox').style.top = offsetTop + 'px'
                    }
                    // console.log(offsetTop)
                    if (offsetTop < 0) {
                        document.getElementById('lyricBox').classList.add('shadow')
                    }

                }

            }
        },
        methods: {
            closePage() {
                this.$parent.$data.isShowLyric = false
                document.querySelector('.panel').classList.remove('songLyric-page')
                document.querySelector('.left-panel').classList.add('left-panel-bg')
                // this.unmaximize();
            },
            maximize() {
                ipc.send('asynchronous-message', 'maximize_main_window'); //向主进程发送消息
                this.isWindowMax = true;
            },
            unmaximize() {
                ipc.send('asynchronous-message', 'unmaximize_main_window'); //向主进程发送消息
                this.isWindowMax = false;
            },
            //跳转歌手页
            goSingerPage() {
                this.unmaximize();
                this.$router.push({
                    path: '/music/public/singer/' + this.currentPlayingSong.artist_id + '/0'
                })
                this.closePage()

            },
            //跳转专辑
            goAlbumPage() {
                this.unmaximize();
                this.$router.push({
                    path: '/music/public/album/' + this.currentPlayingSong.album_id
                })
                this.closePage()
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
            }
        }

    }
</script>
<style scoped>
    .song-wrapper {
        width: 100%;
        height: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
        color: #fff;
        padding: 80px 87px 0 107px;
        z-index: 2000;
        background: rgba(0, 0, 0, .9);
    }
    
    .song-lyric-box {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        height: 445px;
        align-items: center;
    }
    
    .song-wrapper .song_bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    
    .song-wrapper .song-mask {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .6);
        opacity: .8;
        position: absolute;
        top: 0;
        left: 0;
    }
    
    .song-wrapper .song_bg img {
        width: 100%;
        height: 100%;
        filter: blur(30px)
    }
    
    .song-wrapper .left-box {
        z-index: 10;
        padding-top: 37px;
        text-align: left;
    }
    
    .song-wrapper .right-box {
        font-size: 18px;
        flex: 1 1 426px;
        margin-left: 166px;
        position: relative;
    }
    
    .song-wrapper .song-lrc-box {
        width: 100%;
        height: 445px;
        background: transparent;
        font-size: 16px;
        line-height: 35px;
        overflow: hidden;
        text-align: left;
        position: relative;
    }
    
    .song-wrapper .lrc-box {
        width: 100%;
        position: absolute;
        /*top:-100px;*/
    }
    
    .song-wrapper .song-lrc-box li.now {
        color: #F9C5C5;
    }
    
    .song-wrapper .song-lrc-box li {
        width: 100%;
    }
    
    .song-wrapper .song-pic {
        margin-bottom: 30px;
    }
    
    .song-wrapper .song-pic img {
        width: 280px;
        height: 280px;
    }
    
    .song-wrapper .song-title {
        font-size: 20px;
        margin-bottom: 14px;
        width: 280px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .song-wrapper .lyric-wrapper {
        display: flex;
        justify-content: space-between;
        flex-flow: row nowrap;
        flex: 0 0 742px;
        height: 445px;
        position: relative;
        margin: 0 auto;
        align-items: center;
    }
    
    .song-wrapper .left-box {
        flex: 0 0 280px;
    }
    
    .song-wrapper .left-box p {
        margin-bottom: 12px;
    }
    
    .song-wrapper .left-box p.singer-margin {
        display: flex;
        justify-content: flex-start;
        flex-flow: row nowrap;
        margin-bottom: 4px;
    }
    
    .song-wrapper .left-box p span {
        color: #e8e8e8;
        font-size: 14px;
        font-weight: lighter;
    }
    
    .minibar-wrapper {
        background: transparent
    }
    
    .song-wrapper .icon-box {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        -webkit-app-region: no-drag;
    }
    
    .song-wrapper .icon-box .close-btn,
    .song-wrapper .icon-box .maximize-btn {
        display: inline-block;
        width: 36px;
        height: 36px;
        background: url(../../common/images/icon1.png) no-repeat 0 0;
        cursor: pointer;
    }
    
    .song-wrapper .icon-box .maximize-btn.unmaximize-btn {
        display: inline-block;
        width: 36px;
        height: 36px;
        background: url(../../common/images/minisize_icon.png) no-repeat 0 0;
        background-size: auto 36px;
    }
    
    .song-wrapper .icon-box .maximize-btn.unmaximize-btn:hover {
        background-position: -72px 0;
    }
    
    .song-wrapper .icon-box .close-btn {
        background: url(../../common/images/icon2.png) no-repeat 0 0;
        background-size: 144px 36px;
    }
    
    .song-wrapper .icon-box .close-btn:hover {
        background-position: -36px 0;
    }
    
    .song-wrapper .icon-box .maximize-btn {
        background: url(../../common/images/icon1.png) no-repeat 0 0;
        background-size: 144px 36px;
    }
    
    .song-wrapper .icon-box .maximize-btn:hover {
        background-position: -36px 0;
    }
    
    .song-wrapper .lyric-mask {
        position: absolute;
        /*background: #43a8d7;*/
        opacity: .5;
        width: 100%;
        height: 100px;
    }
    
    .song-wrapper .lyric-mask.top-mask {
        top: 0;
        left: 0;
    }
    
    .song-wrapper .lyric-mask.bottom-mask {
        bottom: 0;
        left: 0;
    }
    
    .no-lyric-tips {
        margin-top: 200px;
        text-align: center;
    }
    
    .link {
        cursor: pointer;
    }
    
    .song-wrapper .song-album,
    .song-wrapper .song-author {
        cursor: pointer;
        display: inline-block;
        max-width: 220px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        vertical-align: middle;
    }
    
    .song-wrapper .song-text-lrc-box {
        overflow-y: scroll;
        overflow-x: hidden;
    }
    
    .song-wrapper .song-text-lrc-box .txt-lrc-box {
        top: 0;
    }
    
    .maxWindow {}
    
    .maxWindow .left-box {}
    
    .maxWindow .lyric-wrapper {
        margin-top: 100px;
    }
    
    .song-lrc-box li {
        font-size: 16px;
        line-height: 30px;
        color: #e3e3e3;
        letter-spacing: 1px;
        font-weight: lighter;
    }

    .goback-btn{
         /* margin-top:20px; */
         display: flex;
         flex-flow: row nowrap;
         align-items: center;
         font-size: 12px;
         color:#ffffff;
         cursor: pointer;
    }

   .goback-btn::before{
        display: inline-block;
        content: "";
        width:36px;
        height: 36px;
        background: url(../../common/images/icon2.png) no-repeat 0 0;
        background-size: 144px 36px;
       
    }

    ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
        background-color:transparent;
    }
    
     ::-webkit-scrollbar-track {
        border-radius: 10px;
        background-color:transparent;
    }
    
     ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background: #999999;
    }
</style>