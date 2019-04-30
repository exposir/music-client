<template>
    <i class="dislike-icon" :class="{songList:type==='songlist'}" @click="delSongFromRadio(data)" title="删除"></i>
</template>
<script>
import { mapGetters } from "vuex";
import userService from "service/userService.js";

let ipc = require('electron').ipcRenderer

export default {
  name: "dislike-icon",
  props: {
    data: Object,
    type: String,
    disabled: String,
    favorstate: String
  },
  computed: {
    ...mapGetters({
      loginStatus: "loginStatus"
    })
  },
  data() {
    return {
      
    };
  },
  created() {
  },
  mounted() {
    
  },
  watch: {
  },
  methods: {
    delSongFromRadio(data) {
      if (!this.loginStatus) {
        ipc.send('asynchronous-message', 'main-window')
        eventBus.$emit('isMiniMode',false)
        this.$store.dispatch('TpassLogin');
        return;
      }
      let indexArrs = [];
      indexArrs.push(data.currentPlayIndex)
      this.$store.dispatch('deleteCurrentPlaylistSongsByIndex', {
        indexArrs,
        isDelFile: true
      });
    },
  }
};
</script>
<style scoped>
.dislike-icon {
  display: inline-block;
  width: 18px;
  height: 20px;
  background: url("~static/images/miniBar/icon_dislike.svg") no-repeat;
  cursor: pointer;
}

.dislike-icon:hover {
  background: url("~static/images/miniBar/icon_dislike_2.svg") no-repeat;
}
</style>