<template>
    <button-item :btnTxt="btnTxt" :icon="'playall-icon'" :handleAction="playSelectSongs"></button-item>
</template>
<script>
import buttonItem from "./button-item.vue";
import constant from "../../constant.js";
import { mapGetters } from "vuex";
export default {
  name: "play-btn",
  computed: mapGetters({
    massOpSelectLines: "massOpSelectLines"
  }),
  props: {
    data: Array,
    listid: String,
    btnTxt: {
      default: "播放"
    }
  },
  components: {
    buttonItem
  },
  methods: {
    playSelectSongs() {
      if (this.massOpSelectLines.length <= 0) {
        return;
      }

      let songArray = this.commonFuns.getSelectSongArray(
        this.massOpSelectLines,
        this.data
      );
      let songs = [];
      for (let i = 0; i < songArray.length; i++) {
        let song = songArray[i];
        let new_song = this.commonFuns.deepCopyObj(song);
        let listid = "";
        if (new_song.hasOwnProperty("listid")) {
          listid = new_song.listid;
        }

        if (listid.length <= 0) {
          listid = this.list_id;
        }
        songs.push(new_song);
      }

      let isPlay = true;
      this.$store.dispatch("addSongsToCurrentPlayinglist", {
        songArray: songs,
        playIndex: 0,
        isPlay: isPlay,
        isReset: false
      });

      this.commonFuns.createTips("已添加到正在播放列表", "success");
    }
  }
};
</script>