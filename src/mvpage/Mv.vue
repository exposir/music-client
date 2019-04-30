<template>  
  <div id="mvcontent" class="apmvcontentp" ondragstart="return false">
     <div class="mvheader">
         <i title="关闭" class="closemv_btn" @click="closeMv"></i>
     </div>
     <div class="mvbox">
        <!-- <div class="othermask" v-if="isShowMask"  @click="playORpause">
            <div class="mvMask"><span class="img-play" :class="{'pause':isPause}"></span></div>
            <div class="mvPoster" v-if="!firstPlay"><img v-if="songinfo.thumbnail2" :src="songinfo.thumbnail2"></div>
        </div> -->
        <!-- <webview v-if="songinfo.providerType == 12" id="mv" :src="songinfo.mvurl" style="display:inline-flex; width:822px; height:464px"></webview>
        <video v-if="songinfo.providerType == 1" id="mv" :src="songinfo.mvurl" style="width:822px; height:464px" controls="controls"></video> -->
        <div id="videobox" class="videobox"><video id="mv" :src="songinfo.mvurl" @dblclick="isFullScreenMv" @click="playORpause" style="width:822px; height:464px" autoplay controls="controls" :poster="songinfo.thumbnail2 ? songinfo.thumbnail2 : ''"></video></div>
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
            IsFullScreen: false,
            isPause: true,
            isShowMask: true,
            firstPlay: false
        }
    },
    created() {
        console.log('created');
    },
    methods: {
        closeMv(){
            ipc.send('asynchronous-message', 'close_mv_window');
        },
        playORpause() {
            let videoPlayer = document.getElementById('mv');
            if(videoPlayer.paused){
                videoPlayer.play();
            }else {
                videoPlayer.pause();
            }
        },
        // 双击 进入/退出 全屏
        isFullScreenMv(){
            if(!this.IsFullScreen){
                this.IsFullScreen = true;
                this.fullScreenMv();
            }else {
                this.IsFullScreen = false;
                this.exitFullscreen();
            }
        },
        fullScreenMv() {
            let _self = this;
            this.launchFullscreen(document.getElementById('mv')); 
        },
        // playORpause() {
        //     let videoPlayer = document.getElementById('mv');
        //     if(this.isPause){
        //         this.isPause = false;
        //         videoPlayer.play();
        //     }else {
        //         this.isPause = true;
        //         videoPlayer.pause();
        //     }
        //     if(!this.firstPlay) {
        //         this.firstPlay = true;
        //     }
        //     this.isShowMask = false;

        // },
        showMask() {
            this.isShowMask = true;
        },
        eventTester(e){
            let media  = document.getElementById('mv');
            // media.addEventListener(e,function(){
            //     console.log((new Date()).getTime(),e)
            // },false)
        },
        //反射调用
        invokeFieldOrMethod (element, method) {
            var usablePrefixMethod;
            ["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
                if (usablePrefixMethod) return;
                if (prefix === "") {
                // 无前缀，方法首字母小写
                    method = method.slice(0,1).toLowerCase() + method.slice(1); 
                }
                var typePrefixMethod = typeof element[prefix + method];
                if (typePrefixMethod + "" !== "undefined") {
                    if (typePrefixMethod === "function") {
                        usablePrefixMethod = element[prefix + method]();
                    } else {
                        usablePrefixMethod = element[prefix + method];
                    }
                }
            })

            return usablePrefixMethod;
        },
        //进入全屏
        launchFullscreen(element) {
            //此方法不可以在异步任务中执行，否则火狐无法全屏
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.msRequestFullscreen){ 
                element.msRequestFullscreen(); 
            } else if(element.oRequestFullscreen){
                element.oRequestFullscreen();
            }
            else if(element.webkitRequestFullscreen)
            {
                element.webkitRequestFullScreen();
            }else{
                var docHtml = document.documentElement;
                var docBody = document.body;
                var videobox = document.getElementById('videobox');
                var cssText = 'width:100%;height:100%;overflow:hidden;';
                docHtml.style.cssText = cssText;
                docBody.style.cssText = cssText;
                videobox.style.cssText = cssText+';'+'margin:0px;padding:0px;';
                document.IsFullScreen = true;
            }
        },
        //退出全屏
        exitFullscreen(){
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.oRequestFullscreen){
                document.oCancelFullScreen();
            }else if (document.webkitExitFullscreen){
                document.webkitExitFullscreen();
            }else{
                var docHtml = document.documentElement;
                var docBody = document.body;
                var videobox = document.getElementById('videobox');
                docHtml.style.cssText = "";
                docBody.style.cssText = "";
                videobox.style.cssText = "";
                document.IsFullScreen = false;
            }
        },

    },
    mounted() {
        let _self = this;
        
        ipc.on('transMvinfo', function(event, arg) {
            _self.songinfo =  JSON.parse(arg)
            console.log(_self.songinfo)
        });

        // 最大化让视频也全屏---待优化 ----现在无法触动全屏 但是点击一个按钮hiu触发
        // ipc.on('asynchronous-reply-mv', function(event, arg) {
        //     console.log(arg)
        //     if(arg == 'maximize_mv_window'){
        //         _self.launchFullscreen(document.getElementById('mv')); 
        //         window.setTimeout(function exit(){
        //             //检查浏览器是否处于全屏
        //             if(_self.invokeFieldOrMethod(document,'FullScreen') || _self.invokeFieldOrMethod(document,'IsFullScreen') || document.IsFullScreen){
        //                 _self.exitFullscreen();
        //             }
        //         },5*1000);
        //     }else if(arg == 'unmaximize_mv_window'){
        //         _self.exitFullscreen();
        //     }
        // });

        return false;
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
@import url(../renderer/common/css/reset.css);
@import url(../renderer/common/css/common.css);
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
    position: relative;
    background: #fff;
    height: 33px;
    -webkit-app-region: drag;
}
.mvheader .closemv_btn {
    position: absolute;
    width: 13px;
    height: 13px;
    background: url('~static/images/topBar/icon_close.svg') no-repeat;
    right: 20px;
    top: 12px;
    z-index: 3000;
    -webkit-app-region: no-drag;
    opacity: 0.7;
}
.mvheader .closemv_btn:hover {
    opacity: 1;
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


body div.videobox video#mv{
    width: 100%;
    height: 100%;
}
:-webkit-full-screen {
}
:-moz-full-screen {
}
:-ms-fullscreen {
}
:-o-fullscreen {
}
:full-screen { 
}
:fullscreen {
}
:-webkit-full-screen video {
width: 100%;
height: 100%;
}
:-moz-full-screen video{
width: 100%;
height: 100%;
}

</style>