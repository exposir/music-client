<template>
    <button-item :btnTxt="'删除'" :icon="'delete-icon'" :handleAction="deleteSongs"></button-item>
</template>

<script>
import buttonItem from "./button-item.vue";
import constant from "../../constant.js";
import { mapGetters } from "vuex";

export default {
  name: "delete-btn",
  props: {
    data: Array,
    listid: String,
    gedaninfo: Object,
    btnTxt: {
      default: "删除"
    }
  },
  computed: mapGetters({
    massOpSelectLines: "massOpSelectLines"
  }),
  components: {
    buttonItem
  },
  methods: {
    deleteSongs() {
        let index_select = [];
        index_select = this.massOpSelectLines.concat(index_select);
        console.log(this.gedaninfo)

        if (this.listid == constant.local_songlist_id) {
            this.$store.dispatch("deleteLocalSongs", {'indexArrs':index_select, 'isDelFile':false});
        } else if (this.listid == constant.history_list_id) {
            this.$store.dispatch("deleteHistorySongs", index_select);
        } else if (this.listid == constant.downloaded_songlist_id) {
            this.$store.dispatch('delSongsFromDownloadedList', {'indexArray':index_select, 'isDelFile':false})
        } else if (this.listid == constant.favorite_songlist_id) {
            let songs = [];
            for (let i = 0; i < index_select.length; i++) {
                let index = index_select[i];
                if (index < 0 || index >= this.data.length) {
                    continue;
                }

                let song = this.data[index];songs.push(song);
            }
            let isFav = true;
            this.$store.dispatch("delSongFavorites", {'songsData': songs, 'isFavoured': isFav});
      } else if (this.gedaninfo.gedanType == 'self') {
            //删除自建歌单歌曲
            let songids = "";
            for (let i = 0; i < index_select.length; i++) {
                let index = index_select[i];
                if (index < 0 || index >= this.data.length) {
                    continue;
                }
                let song = this.data[index];
                let songid = this.commonFuns.getSongId(song);

                songids += songid;
                if (i < index_select.length - 1) {
                    songids += ",";
                }
            }
            this.$store.dispatch("delSongsFromList", {'list_id': this.listid, 'song_ids': songids});
      } 

      this.$store.dispatch('emptyMassOperationList');
    }
  }
};
</script>