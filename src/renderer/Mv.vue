<template>  
  <div id="mvcontent" class="apmvcontentp" ondragstart="return false">
     <div class="mvheader"></div>
     <div class="mvbox">
        <!-- <div class="othermask" v-if="isShowMask"  @click="playORpause">
            <div class="mvMask"><span class="img-play" :class="{'pause':isPause}"></span></div>
            <div class="mvPoster" v-if="!firstPlay"><img v-if="songinfo.thumbnail2" :src="songinfo.thumbnail2"></div>
        </div> -->
        <!-- <webview v-if="songinfo.providerType == 12" id="mv" :src="songinfo.mvurl" style="display:inline-flex; width:822px; height:464px"></webview>
        <video v-if="songinfo.providerType == 1" id="mv" :src="songinfo.mvurl" style="width:822px; height:464px" controls="controls"></video> -->
        <div class="videobox" @click="showMask"><video id="mv" :src="songinfo.mvurl" style="width:822px; height:464px" controls="controls" :poster="songinfo.thumbnail2 ? songinfo.thumbnail2 : ''"></video></div>
    </div>
    <div class="mvinfo">
        <div class="info title">{{songinfo.title}}</div>
        <div class="info author">{{songinfo.artist}}</div>
    </div>
  </div>
</template>

<script>
const ipc = require('electron').ipcRenderer;

export default {
    name: 'mv-components',
    data() {
        return {
            songinfo: {},
            isPause: true,
            isShowMask: true,
            firstPlay: false
        }
    },
    created() {
        console.log('created');
    },

    methods: {
        playORpause() {
            let videoPlayer = document.getElementById('mv');
            if(this.isPause){
                this.isPause = false;
                videoPlayer.play();
            }else {
                this.isPause = true;
                videoPlayer.pause();
            }
            if(!this.firstPlay) {
                this.firstPlay = true;
            }
            this.isShowMask = false;

        },
        showMask() {
            this.isShowMask = true;
        },
        eventTester(e){
            let media  = document.getElementById('mv');
            // media.addEventListener(e,function(){
            //     console.log((new Date()).getTime(),e)
            // },false)
        }

    },
    mounted() {
        let _self = this;
        
        ipc.on('transMvinfo', function(event, arg) {
            _self.songinfo =  JSON.parse(arg)
            console.log(_self.songinfo)
        });
        this.eventTester("loadstart"); //客户端开始请求数据
        this.eventTester("progress"); //客户端正在请求数据
        this.eventTester("suspend"); //延迟下载
        this.eventTester("abort"); //客户端主动终止下载（不是因为错误引起）
        this.eventTester("loadstart"); //客户端开始请求数据
        this.eventTester("progress"); //客户端正在请求数据
        this.eventTester("suspend"); //延迟下载
        this.eventTester("abort"); //客户端主动终止下载（不是因为错误引起），
        this.eventTester("error"); //请求数据时遇到错误
        this.eventTester("stalled"); //网速失速
        this.eventTester("play"); //play()和autoplay开始播放时触发
        this.eventTester("pause"); //pause()触发
        this.eventTester("loadedmetadata"); //成功获取资源长度
        this.eventTester("loadeddata"); //
        this.eventTester("waiting"); //等待数据，并非错误
        this.eventTester("playing"); //开始回放
        this.eventTester("canplay"); //可以播放，但中途可能因为加载而暂停
        this.eventTester("canplaythrough"); //可以播放，歌曲全部加载完毕
        this.eventTester("seeking"); //寻找中
        this.eventTester("seeked"); //寻找完毕
        // this.eventTester("timeupdate"); //播放时间改变
        this.eventTester("ended"); //播放结束
        this.eventTester("ratechange"); //播放速率改变
        this.eventTester("durationchange"); //资源长度改变
        this.eventTester("volumechange"); //音量改变

    }

}
</script>
<style scope>
@import url(./common/css/reset.css);
@import url(./common/css/common.css);
html,body {
    background: #fff;
    box-shadow: 0 0 5px 5px rgba(0,0,0,0.2);

}

#mvcontent {
    max-width: 822px;
    width: 100%;
    height: 100%;
    position: relative;
    background: #fff;
    user-select: none; 
    margin: 0 auto;
    
}
.mvheader {
    background: #fff;
    height: 33px;
    -webkit-app-region: drag;
}

.mvbox {
    position: relative;
    width: 100%;
    height: 464px;
    background: #c8e2ff;
}
.othermask {
    position: relative;
    height: 80%;;
}
.videobox {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;  
}

video::-internal-media-controls-download-button {
    display:none;
}
video::-webkit-media-controls-enclosure {
    overflow:hidden;
}
video::-webkit-media-controls-panel {
    width: calc(100% + 30px); 
}
.mvMask, .mvPoster {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.mvMask {
    background: rgba(0,0,0,0.5);
}
.mvPoster img {
    width: 100%;
    vertical-align: top;
}
.mvPoster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 0;
    overflow: hidden;
    cursor: pointer;
}
.mvMask .img-play {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -25px;
    margin-left: -25px;
    
    background: url('~static/images/miniBar/icon_play.svg') no-repeat;
    z-index: 2;
}
.mvMask .img-play.pause {
    background: url('~static/images/miniBar/icon_stop.svg') no-repeat;
}
.mvinfo {
    width: 100%;
    padding-top: 12px;
    height: 46px;
}
.mvinfo .info {
    padding-left: 10px;
    color: #999;
    font-size: 12px;
}
.mvinfo .title {
    font-size: 14px;
    color: #333;
}
</style>