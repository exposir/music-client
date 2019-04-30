<template>
    <i v-if="loginStatus && isFavoured && disabled!=='disabled'" class="favoured-icon" :class="{songList:type==='songlist'}" @click="deleteFavour(data)" title="取消收藏">
    </i>
    <i v-else-if="disabled!=='disabled &&' && !isSongLocal()" class="favour-icon" :class="{songList:type==='songlist'}" @click="addFavour(data)" title="收藏"></i>
    <i v-else-if="disabled==='disabled' || isSongLocal()" class="favour-icon" :class="{songList:type==='songlist',disabled:disabled==='disabled'}" title="收藏"></i>
</template>
<script>
import { mapGetters } from "vuex";
import userService from "service/userService.js";

let ipc = require('electron').ipcRenderer

export default {
  name: "favour-icon",
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
      isFavoured: false
    };
  },
  created() {
    if (this.favorstate == "favourSong") {
      this.isFavoured = true;
    }
    eventBus.$on("favoritesongchanged", () => {
      this.matchSongIsFavour();
    });
  },
  mounted() {
    if (this.favorstate != "favourSong") {
      let me = this;
      let interval = setInterval(function() {
        me.matchSongIsFavour();
        clearInterval(interval);
      }, 100);
    }
  },
  watch: {
    data() {
      if (this.type == "minibar" && this.favorstate != "favourSong") {
        this.matchSongIsFavour();
      }
    }
  },
  methods: {
    matchSongIsFavour() {
      if (this.data) {
        if (this.loginStatus) {
          let param = {
            song: this.data,
            is_match: false
        };
        this.$store.dispatch("isSongFavored", param);
        this.isFavoured = param.is_match;
        } else {
        this.isFavoured = false;
        }
      }

      // console.log(this.isFavoured)
    },
    addFavour(data) {
      if (!this.loginStatus) {
        if (require('electron').remote.getCurrentWindow().getSize()[1] < 400) {
          eventBus.$emit('isMiniMode',false)
          ipc.send('asynchronous-message', 'main-window')
        }
        this.$store.dispatch('TpassLogin');
        return;
      }
      let songsData = [];
      songsData.push(data);
      let paramsJson = {
        songsData: songsData,
        isFavoured: true
      };
      this.$store.dispatch("addSongFavorites", paramsJson);
      this.isFavoured = paramsJson.isFavoured;
    },
    deleteFavour(data) {
      if (!this.loginStatus) {
        this.$store.dispatch('TpassLogin');
        return;
      }
      let songsData = [];
      songsData.push(data);
      let paramsJson = {
        songsData: songsData,
        isFavoured: false
      };
      this.$store.dispatch("delSongFavorites", paramsJson);

      this.isFavoured = paramsJson.isFavoured;
      // if (this.favorstate != "favourSong") {
      //   this.isFavoured = paramsJson.isFavoured;
      // }
    },
    isSongLocal() {
      let songid = this.commonFuns.getSongId(this.data);
      if (songid.length <= 0 || songid.indexOf("_local") !== -1) {
        return true;
      }

      return false;
    }
  }
};
</script>
<style scoped>
.favour-icon {
  display: inline-block;
  width: 18px;
  height: 20px;
  background: url("~static/images/miniBar/icon_10.svg") no-repeat;
  cursor: pointer;
}

.favour-icon:hover {
  background: url("~static/images/miniBar/icon_10_2.svg") no-repeat;
}

.favoured-icon {
  display: inline-block;
  width: 18px;
  height: 20px;
  background: url("~static/images/miniBar/icon_9.svg") no-repeat;
  cursor: pointer;
}

.songList.favour-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon2.svg") no-repeat;
  cursor: pointer;
}

.songList.favour-icon:hover {
  background: url("~static/images/listIcon/icon2_1.svg") no-repeat;
}

.songList.favoured-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon5.svg") no-repeat;
  cursor: pointer;
}

.songList.disabled.favour-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon2_2.svg") no-repeat;
  cursor: default;
}

.disabled.favour-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/miniBar/icon_10_4.svg") no-repeat;
  cursor: default;
}
</style>