<template>  
  <div id="lyrBox">
     
      <div class="lyr-box" v-if="lyr_txt.length > 0 && lyr_txt[0].time">        
          <ul id="lyricBox">
              <li v-for="(item,index) in lyr_txt" :class="{now:(item.time && lyr_time>=item.time) && (lyr_txt[index+1] && lyr_time<=lyr_txt[index+1].time)}">{{item.lyric || '...'}}</li>
          </ul>
      </div>
      <div class="no-lyric-tips-box" v-if="lyr_txt.length > 1 && !lyr_txt[0].time">
            <div class="no-lyric-tips">千千音乐 听见世界</div>
       </div>
        <div class="no-lyric-tips-box" v-if="lyr_txt.length < 1">
            <div class="no-lyric-tips">千千音乐 听见世界</div>
        </div>
  </div>
</template>


<script>
    let ipc = require('electron').ipcRenderer
    
    export default {
        name: 'mv-components',
        data() {
            return {
                lyr_time:'',
                lyr_txt:''
            }
        },
        mounted() {
            console.log(666)
            let _self = this;
                ipc.on('lyrTime', function(event, arg) {
                    console.log(222)
                    _self.lyr_time = arg
                });
                ipc.on('lyrTxt', function(event, arg) {
                    _self.lyr_txt = arg
                    console.log(arg)
                });
                console.log(_self.lyr_time,_self.lyr_txt)
        }

    }
</script>
<style scope>
@import url(./common/css/reset.css);
@import url(./common/css/common.css);
html,body {
    background: transparent;
    font-size: 0;
}
body {
    -webkit-app-region: drag;
    
}
body {
    background: rgba(0, 0, 0, .3);
    height: 100px;
}
#lyrBox {
    width: 100%;
    
    -webkit-user-select: none;
    -webkit-app-region: drag;
}
#lyricBox {
    
}
.lyr-box{
    
    position: relative;
}
.lyr-box li {
    height: 100px;
    line-height: 100px;
    text-align: center;
    font-size: 0;
    color: #33cde1;
    font-weight: 2000;
    font-size: 24px;
    display: none;
}
.lyr-box li.now {
    display: block;
    opacity: 1;
    font-size: 24px;
    
    font-weight: 2000;
    text-shadow: -2px 2px 2px #000;
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