<template>  
  <div id="lyrBox" @mousedown="getWindowPos" @mouseup="cancelWindowMove" @mousemove="windowMove" @mouseout="cancelWindowMove">
      <i class="el-message-box__close" @click="closeLyr"></i>
      <div class="lyr-box" v-if="lyr_txt.length>0 && lyr_txt[0].time">
          <ul>
              <li v-for="(item,index) in lyr_txt" :class="{now:(item.time && lyr_time>=item.time) && (lyr_txt[index+1] && lyr_time<=lyr_txt[index+1].time)}">{{item.lyric || '...'}}</li>
          </ul>
      </div>
      <div class="no-lyric-tips-box" v-if="lyr_txt.length>1 && !lyr_txt[0].time">
            <div class="no-lyric-tips">千千音乐 听见世界</div>
       </div>
        <div class="no-lyric-tips-box" v-if="lyr_txt.length<1">
            <div class="no-lyric-tips">千千音乐 听见世界</div>
        </div>
  </div>
</template>


<script>
    let ipc = require('electron').ipcRenderer
    const win = require('electron').remote.getCurrentWindow();

    export default {
        name: 'mv-components',
        data() {
            return {
                lyr_time:'',
                lyr_txt:'千千音乐 听见世界',
                dragging: false,
                mouseX: 0,
                mouseY: 0
            }
        },
        mounted() {
            let _self = this;
                ipc.on('lyrTime', function(event, arg) {
                //_self.songinfo =  arg
                    //console.log(arg)
                    _self.lyr_time = arg
                });
                ipc.on('lyrTxt', function(event, arg) {
                //_self.songinfo =  arg
                    //console.log(arg)
                    _self.lyr_txt = arg
                });
        },
        methods: {
            closeLyr() {
                ipc.send('closeLyr',"")
            },
            getWindowPos(e) {
                this.dragging = true
                const { pageX, pageY } = e
                this.mouseX = pageX
                this.mouseY = pageY
            },
            cancelWindowMove() {
                this.dragging = false
            },
            windowMove(e) {
                 if(this.dragging) {
                    const { pageX, pageY } = e
                    const pos = win.getPosition();
                    pos[0] = pos[0] + pageX - this.mouseX;
                    pos[1] = pos[1] + pageY - this.mouseY;
                    win.setPosition(pos[0], pos[1], true);
                 }
            }
        },
        watch: {
            
        }

    }
</script>
<style scope>
@import url(../renderer/common/css/reset.css);
@import url(../renderer/common/css/common.css);
html,body {
    background: transparent;
    font-size: 0;
}
body {
    /* -webkit-app-region: drag; */
}
body {
    
}
body:hover {
    background: rgba(0, 0, 0, .3);
}
body:hover .el-message-box__close {
    display: block;
}
.el-message-box__close {
    display: none;
    position: absolute;
    width: 16px;
    height: 16px;
    background: url('~static/images/icon_close.svg') no-repeat;
    right: 12px;
    top: 12px;
    z-index: 3000;
    opacity: 0.6;
}
.el-message-box__close:hover {
    opacity: 0.8;
}

#lyrBox {
    width: 100%;
    height: 100%;
    -webkit-user-select: none;
    /* -webkit-app-region: drag; */
    position: relative;
}
.lyr-box,.lyr-box ul {
    height: 100%;
}
.lyr-box li {
    height: 100%;
    line-height: 100px;
    text-align: center;
    font-size: 0;
    color: #e13228;
    display: none;
    font-weight: bold;
    opacity: 0;
}
.lyr-box li.now {
    display: block;
    opacity: 1;
    font-size: 24px;
}
.no-lyric-tips-box {
    height: 100%;
    line-height: 100px;
    text-align: center;
    font-size: 24px;
    color: #e13228;
    font-weight: bold;
}
</style>