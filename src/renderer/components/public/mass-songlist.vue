<template>
  <div class="table-song-list">
    <div class="table-title">
        <span class="check-state"></span>
        <span class="title">歌曲</span>
        <span class="singer">歌手</span>
        <span class="album">专辑</span>
    </div>
    <ul class="song-list scrollBarBody">
        <li onselectstart="return false;"
            v-for="(val,index) in songList" 
            :data-index='index' 
            :key="getSongId(val)"
            :class="{'active':current_select==index}" 
            @click="chooseSong(index)">
        <span class="check-state">
            <input type="checkbox" :value="getSongId(val)" :class="{checked:isSongSelected(val)}"/>
        </span>
        <span class="title"> 
            <span class="_title" :title="val.title">{{val.title}}</span> 
            <!--<span class="biaoshi" v-html="getIcons(val.biaoshi)"></span>-->
        </span>
        <span class="singer">
            <!--<router-link v-for="(item,i) in val.authorLinksArr" :to="'/music/public/singer/'+item.artist_id+'/0'" :title="item.artist_name">{{item.artist_name}}
                <i v-if="i<val.authorLinksArr.length-1">,</i>
            </router-link>-->
            <span class="_title" :title="getArtistName(val)">{{getArtistName(val)}}</span>
        </span>
        <span class="album">
            <!--<router-link :to="'/music/public/album/'+val.album_id" :title="val.album_title">{{val.album_title}}</router-link>-->
            <span class="_title" :title="val.album_title">{{val.album_title}}</span>
        </span>
        </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import commonFuns from "../../components/commonFuns/common.js";

export default {
  name: "mass-songlist",
  props: {
    songList: Array
  },
  computed: {
    ...mapGetters({
      selectSongs: "massoperationlist"
    }),
  },
  data() {
    return {
      isScroll: false,
      offset: 0,
      current_select: -1
    };
  },
  created() {
    // console.log(JSON.stringify(this.songList))
  },
  destroyed() {
    this.$store.dispatch("emptyMassOperationList");
  },
  methods: {
    chooseSong(index) {
      if (index < 0 || index >= this.songList.length) {
        return;
      }
      let song = this.songList[index];
      if (this.isSongSelected(song)) {
        this.$store.dispatch("removeItemFromMassOperationList", song);
      } else {
        this.$store.dispatch("addItemToMassOperationList", song);
      }

      // console.log(this.selectSongs.length)
    },
    getArtistName(song) {
      let artist_name = "";
      for (let i = 0; i < song.authorLinksArr.length; i++) {
        let item = song.authorLinksArr[i];
        artist_name += item.artist_name;
        if (i < song.authorLinksArr.length-1) {
          artist_name += ',';
        }
      }

      return artist_name;
    },
    getSongId(song) {
      return this.commonFuns.getSongId(song);
    },
    isSongSelected(song) {
      let is_selected = false;
      let id = this.getSongId(song);
      for (let i = 0; i < this.selectSongs.length; i++) {
        let val = this.selectSongs[i];
        let cur_id = this.getSongId(val)
        if (id == cur_id) {
          is_selected = true;
          return is_selected;
        }
      }

      return is_selected;
    }
  }
};
</script>
<style scoped>
.scrollBarBody {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.table-title {
  display: flex;
  background: #f2f2f2;
  border-bottom: solid 1px #ffffff;
  height: 26px;
  align-items: center;
  justify-content: flex-start;
}
.song-list span {
  height: 100%;
  line-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table-song-list span.check-state {
  flex: 0 0 40px;
  display: flex;
  justify-content: center;
}

.table-song-list span.title {
  flex: 1 1 135px;
  display: flex;
  align-items: center;
}

.table-song-list span.singer {
  flex: 1 1 100px;
}

.table-song-list span.album {
  flex: 1 1 145px;
}

.table-title span {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  border: none;
}

.table-song-list li {
  display: flex;
  height: 40px;
  align-items: center;
  border-bottom: 1px solid #f2f2f2;
  cursor: default;
}

.table-song-list li:hover,
.table-song-list .active,
.table-song-list .choseme {
  background: #f2f2f2;
  transition: background-color 0.5s ease;
}

._title {
  max-width: 260px;
}

.table-song-list input[type="checkbox"] {
  width: 16px;
  height: 16px;
  background: url(../../common/images/form_checkout_icon.png) no-repeat 0 0;
  background-size: auto 16px;
  -webkit-appearance: none;
  /*去除系统默认的样式*/
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  /* 点击高亮的颜色*/
  margin-right: 5px;
  margin-top: 12px;
}
.table-song-list input[type="checkbox"].checked {
  background-position: -16px 0;
}
</style>
