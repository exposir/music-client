<template>
  <i class="lyric-icon"  @click="lyric" title="歌词"></i>
</template>
<script>
const ipcRenderer = require('electron').ipcRenderer

export default {
  data () {
      return {
          lyrshow:false
      }
  },
  mounted() {
      let self = this
     ipcRenderer.on('lyrShow',(event,arg) => {
        self.lyrshow = arg 
     })

     ipcRenderer.on('asynchronous-reply', (event, arg) => {
        if (arg === 'traymenu_desklyric') {
            self.lyric();
        }
     })
  },
  methods: {
      lyric() {
          //console.log(this.lyrshow)
          if(!this.lyrshow) {
              this.lyrshow = true
              ipcRenderer.send('asynchronous-message','new_lyr_window')  
          } else {
              this.lyrshow = false
              ipcRenderer.send('asynchronous-message','close_lyr')  
          }
                 
          
      }
  }
}
</script>
<style scoped>
    .lyric-icon {
        display: inline-block;
        width: 18px;
        height: 20px;
        background: url('~static/images/miniBar/lyc.svg') no-repeat;
        cursor: pointer;
    }
    .lyric-icon:hover {
        background: url('~static/images/miniBar/lyc_1.svg') no-repeat;
    }
</style>

