<template>
    <div class="song-list-wrapper">
        <div class="song-list-title">
            <span class="num"><input type="checkbox" @click="clickToSelectAll()" :class={checked:isAllChecked} v-show="isMass"></span>
            <span class="s-title">歌曲</span>
            <span class="fct"></span>
            <span class="u-title" v-if="fields.singer">歌手</span>
            <span class="a-title" v-if="fields.album_title">专辑</span>
            <span class="hot" v-if="fields.hot">热度</span>
        </div>
        <ul class="table-song-list" :class="detail.classname">
            <li v-for="(val,index) in data" 
            :data-index='index' 
            :class="{'active':selectedSongsIndexs.indexOf(index)>-1,'current':index == currentPlayingIndex,'disabled':(val.copy_type==0 || val.del_status==1)}" 
            @dblclick="playSongUptoWholeSongList({'songArray':data,'playIndex':index},$event)" 
            @mouseenter="mouseHover(index)" 
            @click="choose(val, index)" 
            @contextmenu="onContextMenu(index, $event)"
            :key="getSongId(val)">
                <span class="num" v-show="isMass"><input type="checkbox" :class="{checked:isSongSelected(index)}"></span>
                <span class="num playing" :class="{rank:val.rank<4}" v-if="val.rank && isNotMass">{{val.rank}}</span>
                <span class="num playing" v-else>{{index+1}}</span>
    
                <span class="s-title" v-if="detail.type==='bangdan'">
                    <span class="img-border">
                        <i :class="{up_icon:val.rank_change>0,down_icon:val.rank_change<0,equal_icon:val.rank_change==0}"></i>
                        <img :src="val.pic_small" alt="">
                    </span>
                    <span class="bd_title">
                        <span class="_title" :title="val.title" :class='{"_title_1":getIconLength(val.biaoshi)==1,"_title_2":getIconLength(val.biaoshi)==2,"_title_3":getIconLength(val.biaoshi)==3,"_title_4":getIconLength(val.biaoshi)==4}'>{{val.title}}</span>
                        <span v-if="parseInt(val.has_mv) == 1" class="mv_icon" @click="playVideo({'song_id':val.song_id,'mv_id':val.mv_id})"><i></i></span>
                        <span class="biaoshi_song" v-html="getIcons(val.biaoshi)"></span>
                        <span class="fct">
                            <play-icon v-if="val.copy_type!=2" :listid="detail.list_id" :type="'songlist'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                            <play-icon v-else :type="'songlist'" :listid="detail.list_id" :disabled="'disabled'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                            <i :class="{'disabled':isSongLocal(val),'favoured-icon':favorstate, 'favour-icon':!favorstate}" @click="doFavour(val)"></i>
                            <download-icon v-if="isSongCanDownload(val)" :type="'songlist'" :data="val"></download-icon>
                            <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val"></download-icon>
                            <more-icon :type="'songlist'" :data="{songArray:data, type:detail.type, list_id:detail.list_id, selectindex:index}"></more-icon>
                        </span>
                    </span>
                </span>
                <span class="s-title" v-else-if="detail.type==='search'">
                    <span class="_title" :title="val.title" :class='{"_title_1":getIconLength(val.biaoshi)==1,"_title_2":getIconLength(val.biaoshi)==2,"_title_3":getIconLength(val.biaoshi)==3,"_title_4":getIconLength(val.biaoshi)==4}'  v-html="highlight(val.title,keyword)"></span> 
                    <span v-if="parseInt(val.has_mv) == 1" class="mv_icon" @click="playVideo({'song_id':val.song_id,'mv_id':val.mv_id})"><i></i></span>
                    <span class="biaoshi_song" v-html="getIcons(val.biaoshi)"></span>
                    <span class="fct">
                        <play-icon v-if="val.copy_type!=2" :listid="detail.list_id" :type="'songlist'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                        <play-icon v-else :type="'songlist'" :listid="detail.list_id" :disabled="'disabled'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                        <i :class="{'disabled':isSongLocal(val),'favoured-icon':favorstate, 'favour-icon':!favorstate}" @click="doFavour(val)"></i>
                        <download-icon v-if="isSongCanDownload(val)" :type="'songlist'" :data="val"></download-icon>
                        <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val"></download-icon>
                        <more-icon :type="'songlist'" :data="{songArray:data, type:detail.type, list_id:detail.list_id, selectindex:index}"></more-icon>
                    </span>
                </span>
                <span class="s-title"  v-else>
                    <span class="_title" :title="val.title"  :class='{"_title_1":getIconLength(val.biaoshi)==1,"_title_2":getIconLength(val.biaoshi)==2,"_title_3":getIconLength(val.biaoshi)==3,"_title_4":getIconLength(val.biaoshi)==4}'>{{val.title}}</span>
                    <span v-if="parseInt(val.has_mv) == 1" class="mv_icon" @click="playVideo({'song_id':val.song_id,'mv_id':val.mv_id})"><i></i></span>
                    <span class="biaoshi_song" v-html="getIcons(val.biaoshi)"></span>
                    <span class="fct" v-if="!isMass">
                        <play-icon v-if="val.copy_type!=2" :listid="detail.list_id" :type="'songlist'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                        <play-icon v-else :type="'songlist'" :listid="detail.list_id" :disabled="'disabled'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                        <!--<favour-icon v-if="!isSongLocal(val)" :type="'songlist'" :data="val" :favorstate="favorstate"></favour-icon>
                        <favour-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val" :favorstate="favorstate"></favour-icon>-->
                        <i :class="{'disabled':isSongLocal(val),'favoured-icon':favorstate, 'favour-icon':!favorstate}" @click="doFavour(val)"></i>
                        <download-icon v-if="isSongCanDownload(val)" :type="'songlist'" :data="val"></download-icon>
                        <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val"></download-icon>
                        <more-icon :type="'songlist'" :data="{songArray:data, type:detail.type, list_id:detail.list_id, selectindex:index}"></more-icon>
                    </span>
                </span>
                <span class="u-title" v-if="fields.singer">
                    <span v-if="detail.type==='search' && !isMass">
                        <router-link v-for="(author,i) in val.authorLinksArr" v-if="i<val.authorLinksArr.length-1" :to="'/music/public/singer/'+author.artist_id+'/0'" v-html="highlight(author.artist_name,keyword)+','"></router-link>
                        <router-link v-for="(author,i) in val.authorLinksArr" v-if="i === val.authorLinksArr.length-1" :to="'/music/public/singer/'+author.artist_id+'/0'" v-html="highlight(author.artist_name,keyword)"></router-link>
                    </span>
                    <router-link v-else-if="!isMass" v-for="(author,i) in val.authorLinksArr" :to="'/music/public/singer/'+author.artist_id+'/0'" :title="author.artist_name">{{author.artist_name}}
                        <i v-if="i<val.authorLinksArr.length-1">,</i>
                    </router-link>
                    <span v-else-if="isMass" class="u-title" :title="getArtistName(val)">{{getArtistName(val)}}</span>
                </span>
    
                <span class="a-title" v-if="fields.album_title && !isMass">
                    <router-link v-if="val.album_title && detail.type==='search'" :to="'/music/public/album/'+val.album_id" v-html="highlight(val.album_title,keyword)"></router-link>
                    <span v-else>
                        <router-link v-if="val.album_title" :to="'/music/public/album/'+val.album_id" :title="val.album_title">{{val.album_title}}</router-link>
                        <span v-else>未知专辑</span>
                    </span>
                </span>
                <span v-else-if="isMass" class="a-title" :title="val.album_title">{{val.album_title}}</span>
    
                <span class="hot" v-if="fields.hot">
                    <i v-if="val.hotlong==0 || val.hotlong==1" class="hot-line" :style="[{width:'2px'}]"></i>
                    <i v-else class="hot-line" :style="[{width:val.hotlong+'px'}]"></i>
                </span>
            </li>
        </ul>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import playIcon from "components/icons/playIcon.vue";
import favourIcon from "components/icons/favourIcon";
import moreIcon from "components/icons/moreIcon.vue";
import downloadIcon from "components/icons/downloadIcon.vue";
import songService from "../../service/songService";
import mvService from "../../service/mvService";
import playMv from "../../utils/mv/playMv.js";
import constant from "../../constant.js";
import index from "vue";
import { triggerAsyncId } from 'async_hooks';

const ipc = require("electron").ipcRenderer;

export default {
  name: "song-list",
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters({
      selectedSongsIndexs: "ListSelectedLines",
      loginStatus: "loginStatus",
      massOpSelectLines: "massOpSelectLines",
      currentPlayingSong: "currentPlayingSong"
    })
  },
  created() {
    this.currentPlayingIndex = -1;
    eventBus.$on("playingsongchanged", this.playingsongchangedEvent);
    eventBus.$on("isMass", this.massOpEvent);
  },
  beforeDestroy() {
    eventBus.$off("playingsongchanged", this.playingsongchangedEvent);
    eventBus.$off("isMass", this.massOpEvent);
  },
  props: {
    data: Array,
    detail: Object,
    fields: Object,
    highlight: Function,
    keyword: String,
    playingInex: Number,
    type: String
  },
  data() {
    return {
      currentPlayingIndex: -1,
      favorstate: "",
      isMass: false,
      isNotMass: true,
      isAllChecked: false,
    };
  },

  components: {
    playIcon,
    favourIcon,
    moreIcon,
    downloadIcon
  },
  methods: {
    massOpEvent(val) {
      this.isMass = val;
      this.isNotMass = !val;

      this.isAllChecked = false;
    },
    playingsongchangedEvent() {
      this.caculateCurrentPlayingIndex();
    },
    clickToSelectAll() {
      let value = true;
      if (this.massOpSelectLines.length == this.data.length) {
        value = false;
      }

      if (value) {
        let index_Arr = [];
        for (let i = 0; i < this.data.length; ++i) {
          index_Arr.push(i);
        }

        this.$store.dispatch("addItemsAndClearOld", index_Arr);
        this.isAllChecked = true;
      } else {
        this.$store.dispatch("emptyMassOperationList");
        this.isAllChecked = false;
      }
    },
    playSongUptoWholeSongList(paramsJson) {
      if (this.isMass) {
        return;
      }
      let listid = "";
      if (this.detail.hasOwnProperty("list_id")) {
        listid = this.detail.list_id;
      }
      if (paramsJson.songArray && listid && listid.length > 0) {
        console.log("current play song list id is: " + listid);
        for (let i = 0; i < paramsJson.songArray.length; i++) {
          paramsJson.songArray[i].listid = listid;
        }
      }

      let index = paramsJson.playIndex;
      let songArray = paramsJson.songArray;
      let song = songArray[index];
      let songid = this.commonFuns.getSongId(song);
      let song_listid = "";
      if (song.hasOwnProperty("listid")) {
        song_listid = song.listid;
      }
      let del_status = 0;
      if (song.hasOwnProperty("del_status")) {
        del_status = song.del_status;
      }
      let request_data = {
        songid: songid,
        res: 1
      };
      if (song_listid == constant.favorite_songlist_id) {
        request_data.res = 2;
      }
      let me = this;
      let isGetResponse = false;
      songService.getSongLink(
        request_data,
        res => {
          isGetResponse = true;
          if (res.error_code == 22000) {
            me.$store.dispatch("playSongUptoWholeSongList", paramsJson);
            eventBus.$emit("isShowAddMusicIcon", true);
            return;
          } else if (res.error_code == 22469) {
            //单点售卖歌曲、专辑
            if (del_status == 0) {
              let songinfoJson = res.result;
              me.$store.dispatch("showSaleSongMessageBox", songinfoJson);
            } else {
              this.commonFuns.createTips("歌曲已下线", "error");
            }
            return;
          } else if (res.error_code == 22467) {
            //全球付费
            let songinfoJson = res.result;
            me.$store.dispatch("showOpenVipMessageBox");
            return;
          } else {
            let errorMsg = "暂不支持付费歌曲播放和购买";
            me.commonFuns.createTips(errorMsg, "error");
            return;
          }
        },
        function(err) {
          if (!isGetResponse) {
            me.commonFuns.createTips("网络错误", "error");
          } else {
            me.commonFuns.createTips("播放失败", "error");
          }
        }
      );
    },
    choose(songinfo, index) {
      if (!this.isMass) {
        let ctrlKey = false;
        let shiftKey = false;
        if (event.metaKey || event.ctrlKey) {
          ctrlKey = true;
        } else if (event.shiftKey) {
          // shift键
          shiftKey = true;
        }
        let isCurrentPlaylist = false;
        this.$store.dispatch("updateLinesSelected", {
          index,
          ctrlKey,
          shiftKey,
          isCurrentPlaylist
        });
      } else {
        this.$store.dispatch("updateSelectIndex", index);
        if (this.massOpSelectLines.length == this.data.length) {
          this.isAllChecked = true;
        } else {
          this.isAllChecked = false;
        }
      }
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
    isSongLocal(songInfo) {
      let songid = this.commonFuns.getSongId(songInfo);
      if (songid.length <= 0 || songid.indexOf("_local") !== -1) {
        return true;
      }

      return false;
    },
    isSongCanDownload(songInfo) {
      return this.commonFuns.isSongCanDownload(songInfo);
    },
    caculateCurrentPlayingIndex() {
      this.currentPlayingIndex = -1;
      if (!this.data) {
        return;
      }

      let listid = "";
      if (this.detail.hasOwnProperty("list_id")) {
        listid = this.detail.list_id;
      }
      if (listid.length <= 0) {
        return;
      }

      // console.log('current show list id is: ' + listid)
      let param = {
        listid: "",
        songid: "",
        title: ""
      };
      this.$store.dispatch("getCurrentPlayingSongListId", param);
      // console.log(param)
      if (
        param.listid &&
        param.songid &&
        param.listid == listid &&
        param.songid.length > 0
      ) {
        for (let i = 0; i < this.data.length; i++) {
          let song = this.data[i];
          let song_id = this.commonFuns.getSongId(song);
          if (song_id == param.songid) {
            this.currentPlayingIndex = i;
            console.log("current playing index is: " + i);
            break;
          }
        }
      }
    },
    getIcons(namesStr) {
      let biaoshi = "";
      if (namesStr) {
        let biaoshiArr = ["pay", "sole", "presell", "lossless", "first"];
        let namesArr = namesStr.split(",");

        namesArr.forEach((item, index) => {
          if (biaoshiArr.indexOf(item) > -1) {
            biaoshi += '<i class="' + item + '"></i>';
          }
        });
      }
      return biaoshi;
    },
    getIconLength(namesStr) {
      let len = 0;
      if (namesStr) {
        let biaoshiArr = ["pay", "sole", "presell", "lossless", "first"];
        let namesArr = namesStr.split(",");
        namesArr.map(item => {
          biaoshiArr.indexOf(item);
        });
        len = namesArr.length;
      }
      return len;
    },
    mouseHover(index) {
      if (this.loginStatus) {
        if (index < 0 || index >= this.data.length) {
          return;
        }

        let songInfo = this.data[index];
        let param = {
          song: songInfo,
          is_match: false
        };
        this.$store.dispatch("isSongFavored", param);
        this.favorstate = param.is_match;
        // console.log('current favor state is: ' + this.favorstate + ' song is: ' + songInfo.title)
      } else {
        this.favorstate = false;
      }
    },
    addFavour(data) {
      let songsData = [];
      songsData.push(data);
      let isFavoured = this.favorstate;
      let paramsJson = {
        songsData,
        isFavoured
      };
      this.$store.dispatch("addSongFavorites", paramsJson);
      this.favorstate = true;
    },
    deleteFavour(data) {
      let songsData = [];
      songsData.push(data);
      let isFavoured = this.favorstate;
      let paramsJson = {
        songsData,
        isFavoured
      };
      this.$store.dispatch("delSongFavorites", paramsJson);

      this.favorstate = false;
    },
    doFavour(song) {
      if (this.isSongLocal(song)) {
        return;
      }

      if (this.favorstate) {
        this.deleteFavour(song);
      } else {
        this.addFavour(song);
      }
    },
    onContextMenu(index, event) {
      if (this.isMass) {
        return;
      }
      let indexArray = [];
      this.$store.dispatch("getSelectIndexs", {
        isCurrentPlaylist: false,
        indexArray: indexArray
      });
      if (indexArray.indexOf(index) == -1) {
        let ctrlKey = false;
        let shiftKey = false;
        let isCurrentPlaylist = false;
        let isRightButton = true;
        this.$store.dispatch("updateLinesSelected", {
          index,
          ctrlKey,
          shiftKey,
          isCurrentPlaylist,
          isRightButton
        });

        indexArray.splice(0, indexArray.length);
        indexArray.push(index);
      }

      let clientX = event.clientX;
      let clientY = event.clientY;
      let positionData = {
        clientX: clientX,
        clientY: clientY
      };

      this.MessageBox.context(
        this.data,
        indexArray,
        this.detail.type,
        this.detail.list_id,
        positionData
      );
    },
    getSongId(song) {
      return this.commonFuns.getSongId(song);
    },
    isSongSelected(index) {
      let is_selected = false;
      for (let i = 0; i < this.massOpSelectLines.length; i++) {
        let cur_index = this.massOpSelectLines[i];
        if (cur_index == index) {
          is_selected = true;
          return is_selected;
        }
      }

      return is_selected;
    },
    playVideo(obj) {
      let data = {};
      let _self = this;
      if (obj.song_id) {
        data = {
          song_id: obj.song_id
        };
        mvService.getMvPlayUrl(
          data,
          res => {
            if (res.error_code == 22000) {
              playMv.playMv(res.result ? res.result : {});
            }
          },
          err => {
            console.log(err);
          }
        );
      } else if (obj.mv_id) {
        data = {
          mv_id: obj.mv_id
        };
        mvService.getMvPlayUrl(
          data,
          res => {
            if (res.error_code == 22000) {
              playMv.playMv(res.result ? res.result : {});
            }
          },
          function(err) {
            console.log(err);
          }
        );
      } else {
        alert("播放数据有误");
        return false;
      }
    }
  },
  watch: {
    data() {
      this.currentPlayingIndex = -1
      let temp_id = this.currentPlayingSong.song_id
      this.data.forEach((item, index)=>{
        if(item.song_id == temp_id) {
          this.currentPlayingIndex = index
        }
      })
    }
  }
};
</script>
<style scoped>
.song-list-wrapper input.checked {
  background-position: -16px 0;
}
.song-list-wrapper input {
  width: 16px;
  height: 16px;
  background: url(../../common/images/form_checkout_icon.png) no-repeat 0 0;
  background-size: auto 16px;
  -webkit-appearance: none;
  /*去除系统默认的样式*/
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  /* 点击高亮的颜色*/
  margin-right: 5px;
}
.song-list-wrapper {
  display: flex;
  flex-flow: column wrap;
}

.song-list-wrapper .song-list-title {
  flex: 0 0 100%;
  display: flex;
  background: #fafafa;
  height: 28px;
  justify-content: flex-start;
  align-items: center;
  border-bottom: solid 1px #ffffff;
}

.song-list-wrapper span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.num {
  flex: 0 0 40px;
  display: flex;
  justify-content: center;
}

.s-title {
  flex: 1 0 224px;
  height: 40px;
  display: flex;
  align-items: center;
  position: relative;
}

.fct {
  position: absolute;
  top: 10px;
  right: 0;
  width: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  margin-right: 14px;
  transition: 0.2s 0.05s linear;
}

.u-title {
  flex: 1 1 140px;
}

.a-title {
  flex: 1 1 180px;
  padding-left: 5px;
}

.big .s-title {
  display: flex;
  align-items: center;
  /* flex: 1 1 154px; */
  flex: 1 0 224px;
}

.bd_title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.bd_title ._title._title_1,
.bd_title ._title._title_2,
.bd_title ._title._title_3,
.bd_title ._title._title_4 {
  max-width: 70px;
}

._title {
  max-width: 120px;
  transition: 0.2s linear;
}

._title._title_1 {
  max-width: 150px;
}

._title._title_2 {
  max-width: 188px;
}

._title._title_3 {
  max-width: 120px;
}

._title._title_4 {
  max-width: 80px;
}

.table-song-list li:hover ._title {
  max-width: 90px;
}

.img-border {
  margin-right: 5px;
}

.img-border img {
  width: 28px;
  height: 28px;
  border: solid 2px #f2f2f2;
}

.active {
  background: #f2f2f2;
}

.table-song-list li {
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-top: solid 1px #f2f2f2;
}

.table-song-list.big li {
  height: 50px;
}

.table-song-list li:hover {
  background: #f2f2f2;
  transition: background-color 0.5s ease;
}

.table-song-list li:hover .fct {
  opacity: 1;
}

.table-song-list li.disabled:hover  .fct {
  opacity: 0;
}
.table-song-list li a:hover {
  color: #e13228;
}

.table-song-list .current .playing {
  width: 12px;
  height: 12px;
  background: url("~static/images/icon_playing.svg") no-repeat;
  text-indent: -100000px;
  position: relative;
  left: 13px;
}

.rank {
  color: #ff5c6f;
}

.up_icon,
.down_icon,
.equal_icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: url(../../common/images/up_icon2.png) no-repeat 0 0;
  background-size: 12px auto;
  margin-right: 3px;
}

.down_icon {
  background-position: 0 -12px;
}

.equal_icon {
  background-position: 0 -24px;
}

.hot {
  flex: 0 0 180px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 5px;
}

.hot-line {
  height: 7px;
  background: #cccccc;
  border-radius: 3px;
}

.disabled,
.disabled a,
.disabled span,
.table-song-list li.disabled a:hover {
  color: #cccccc;
}

.table-song-list li.disabled:hover .fct {
  visibility: hidden;
}

.table-song-list li.disabled:hover {
  background: #fff;
}

.table-song-list li:first-child {
  border-top: 0;
}

.favour-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon2.svg") no-repeat;
  cursor: pointer;
}

.favour-icon:hover {
  background: url("~static/images/listIcon/icon2_1.svg") no-repeat;
}

.favoured-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon5.svg") no-repeat;
  cursor: pointer;
}

.disabled.favour-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon2_2.svg") no-repeat;
  cursor: default;
}

.nobiao-box {
  max-width: 100%;
}

.mv_icon {
  display: inline-block;
  width: 20px;
  cursor: pointer;
  margin-left: 4px;
  margin-top: 4px;
}

.mv_icon i {
  display: inline-block;
  width: 20px;
  height: 30px;
  background: url("~static/images/mv/mv.svg") no-repeat 0 10px;
}

.mv_icon:hover i {
  background: url("~static/images/mv/mv_hover.svg") no-repeat 0 10px;
}

.mv_icon.gray {
  cursor: default;
}

.mv_icon.gray:hover i,
.mv_icon.gray i {
  background: url("~static/images/mv/mv_gray.svg") no-repeat 0 10px;
}

.table-song-list li:hover .biaoshi_song {
  opacity: 0;
}

.table-song-list li:hover ._title._title_2 {
  max-width: 86px;
}

@media screen and (min-width: 1100px) {
  .song-list-title .s-title,
  .table-song-list .s-title {
    flex: 1 0 366px;
  }
  .table-song-list ._title._title_1 {
    max-width: 300px;
  }
  .table-song-list ._title._title_2 {
    max-width: 300px;
  }
  .table-song-list ._title._title_3 {
    max-width: 270px;
  }
  .table-song-list ._title._title_4 {
    max-width: 245px;
  }
  .table-song-list li:hover .s-title {
    flex: 1 0 366px;
  }
  .table-song-list li:hover ._title {
    max-width: 240px !important;
  }
}
</style>
<style lang="">
.biaoshi_song {
  max-width: 118px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  opacity: 1;
  transition: 0.2s linear;
  margin-left:4px;
  margin-top:5px;

}

.biaoshi_song i {
  display: inline-block;
  width: 20px;
  height: 30px;
  margin-right:4px;
  
}


.biaoshi_song i.first {
  background: url("~static/images/jiaobiao/first.svg") no-repeat 0 8px;
}

.biaoshi_song i.lossless {
  background: url("~static/images/jiaobiao/lossless.svg") no-repeat 0 8px;
}

.biaoshi_song i.pay {
  background: url("~static/images/jiaobiao/pay.svg") no-repeat 0 8px;
}

.biaoshi_song i.sole {
  background: url("~static/images/jiaobiao/sole.svg") no-repeat 0 8px;
}

.biaoshi_song i.presell {
  background: url("~static/images/jiaobiao/presell.svg") no-repeat 0 8px;
}
</style>