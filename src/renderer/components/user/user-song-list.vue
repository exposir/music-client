<template>
    <div class="table-song-list">
        <div class="table-title">
            <span class="num"><input @click="clickToSelectAll()" :class={checked:isAllChecked} type="checkbox" v-show="isMass"></span>
            <span class="title">歌曲</span>
            <!-- <span class="fct"></span> -->
            <span class="singer">歌手</span>
            <span class="album">专辑</span>
            <span v-if="type==='downloaded'" class="size">大小</span>
        </div>
        <ul class="song-list scrollBarBody">
            <li onselectstart="return false;" 
                v-for="(val,index) in  data" 
                :data-index='index' 
                :class="{'active':selectedSongsIndexs.indexOf(index)>-1,'choseme': activeSongId==getSongId(val),'current':index == playingInex}" 
                @click="choseSong(val, index)" 
                @mouseenter="mouseHover(index)" 
                @dblclick="playWholeSongList({'songArray':data,'playIndex':index, 'dbClick':true})" 
                @contextmenu="onContextMenu(index, $event)"
                :key="getSongId(val)">
                <span class="num check" v-show="isMass"><input type="checkbox" :class="{checked:isSongSelected(index)}"></span>
                <span class="num playing" :class="{rank:val.rank<4}" v-if="val.rank && isNotMass">{{val.rank}}</span>
                <span class="num playing" v-else>{{index+1}}</span>
                <span class="title"> 
                    <span class="_title" :title="val.title"  :class='{"_title_1":getIconLength(val.biaoshi)==1,"_title_2":getIconLength(val.biaoshi)==2,"_title_3":getIconLength(val.biaoshi)==3,"_title_4":getIconLength(val.biaoshi)==4}'>{{val.title}}</span> 
                    <span v-if="parseInt(val.has_mv) == 1" class="mv_icon" @click="playVideo({'song_id':getSongId(val),'mv_id':val.mv_id})"><i></i></span>
                    <span v-if="isSongLocal(val)" class="local_icon" :title="'非千千音乐来源歌曲'"><i></i></span>
                    <span class="biaoshi" v-html="getIcons(val)"></span>
                    <span class="fct" v-if="isNotMass">
                        <play-icon v-if="val.copy_type!=2" :type="'songlist'" :listid="list_id" :data="{'songArray':data,'playIndex':index,'dbClick':false}"></play-icon>
                        <play-icon v-else :type="'songlist'" :listid="list_id" :disabled="'disabled'" :data="{'songArray':data,'playIndex':index,'dbClick':false}"></play-icon>
                        <!--<favour-icon v-if="!isSongLocal(val)" :type="'songlist'" :data="val" :favoured-icon="type"></favour-icon>
                        <favour-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val" :favorstate="type"></favour-icon>-->
                        <i :class="{'disabled':isSongLocal(val),'favoured-icon':favorstate, 'favour-icon':!favorstate}" @click="doFavour(val)"></i>
                        <download-icon v-if="isSongCanDownload(val) && type != 'downloaded'" :type="'songlist'" :data="val"></download-icon>
                        <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val"></download-icon>
                        <more-icon :type="'songlist'" :data="{songArray:data, type:type, list_id:list_id, selectindex:index}"></more-icon>
                    </span>
                </span>
                <span class="singer">
                    <router-link v-if="!isMass" v-for="(item,i) in val.authorLinksArr" :key="i" :to="'/music/public/singer/'+item.artist_id+'/0'" :title="item.artist_name">{{item.artist_name}}
                        <i v-if="i<val.authorLinksArr.length-1">,</i>
                    </router-link>
                    <span v-else-if="isMass" class="_title" :title="getArtistName(val)">{{getArtistName(val)}}</span>
                </span>
                <span class="album">
                    <router-link v-if="!isMass" :to="'/music/public/album/'+val.album_id" :title="val.album_title">{{val.album_title}}</router-link>
                    <span v-else-if="isMass" class="_title" :title="val.album_title">{{val.album_title}}</span>
                </span>
                <span v-if="type==='downloaded'" class="size" v-html="getFileSize(index)"></span>
            </li>

            <div class="pagination-box" v-if="isShowPagination()">
              <el-pagination small layout="prev, pager, next" :total="allDataSize" :page-size="pageSize" @current-change="onChangePage"></el-pagination>
            </div>
            <div class="pagination-box" v-else></div>  
        </ul>
    </div>
</template>
<script scoped>
import { mapGetters, mapActions } from "vuex";
import playIcon from "components/icons/playIcon.vue";
import favourIcon from "components/icons/favourIcon";
import moreIcon from "components/icons/moreIcon.vue";
import downloadIcon from "components/icons/downloadIcon.vue";
import scrollDirective from "../../directives/scroll.js";
import songService from "../../service/songService";
import constant from "../../constant.js";
import scrollBar from "components/scrollBar/scrollBar.js";
import mvService from "../../service/mvService";
import playMv from "../../utils/mv/playMv.js";
import commonFuns from "components/commonFuns/common.js"

const ipc = require("electron").ipcRenderer;
const fs = require("fs");

export default {
  name: "user-song-list",
  computed: {
    ...mapGetters({
      selectedSongsIndexs: "ListSelectedLines",
      loginStatus: "loginStatus",
      massOpSelectLines: "massOpSelectLines"
    })
  },
  created() {
    let me = this
    window.onresize = function () {
      me.changeScroll();
    }
    eventBus.$on("isMass", val => {
      this.isMass = val;
      this.isNotMass = !val;

      this.isAllChecked = false;
      this.$store.dispatch("emptyMassOperationList");
    });
  },
  props: {
    data: Array,
    allDataSize: Number,
    playingInex: Number,
    type: {
      default: "favourSong"
    },
    contextMenuType: String,
    list_id: String,
    activeSongId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      isScroll: false,
      offset: 0,
      pageSize: 100,
      currentPage: 1,
      favorstate: "",
      isMass: false,
      isNotMass: true,
      isAllChecked: false
    };
  },
  watch: {
    activeSongId() {
      if (this.activeSongId) {
        scrollBar.scrollToActivePosition();
      }
    },
    massOpSelectLines(now, before) {
      if (now.length == 0) {
        this.isAllChecked = false;
      }
    }
  },
  mounted() {
    this.changeScroll();
    if (this.activeSongId) {
      scrollBar.scrollToActivePosition();
    }
  },
  components: {
    playIcon,
    favourIcon,
    moreIcon,
    downloadIcon
  },
  methods: {
    getSongId(song) {
      return commonFuns.getSongId(song)
    },
    isShowPagination() {
      let show = false;
      if (this.list_id == constant.history_list_id ||
          this.list_id == constant.favorite_songlist_id ||
          this.list_id == constant.local_songlist_id ||
          this.list_id == constant.downloaded_songlist_id) 
         {
            if (this.allDataSize > this.pageSize) {
            show = true;
        }
      }

      // console.log(show)
      return show;
    },
    clickToSelectAll() {
      let value = true;
      if (this.massOpSelectLines.length == this.data.length) {
        value = false;
      }

      if (value) {
        let index_Arr = [];
        for (let i = 0; i < this.data.length; ++i) {
          let song = this.data[i];
          index_Arr.push(i);
        }

        this.$store.dispatch("addItemsAndClearOld", index_Arr);
        this.isAllChecked = true;
      } else {
        this.$store.dispatch("emptyMassOperationList");
        this.isAllChecked = false;
      }
    },
    onChangePage(page) {
      this.currentPage = page;
      // console.log('page...............'+page)
      if (this.list_id == constant.favorite_songlist_id) {
        this.$nextTick(() => {
          document.querySelector(".scrollBarBody").scrollTop = 0;
          let offset = (page - 1) * this.pageSize;
          let paramsJson = {
            pn: offset,
            rn: this.pageSize
          };
          this.$store.dispatch("getUserFavourSongList", paramsJson);
        });
      } else if (this.list_id == constant.history_list_id) {
          this.$nextTick(() => {
            this.$store.dispatch('getCurrentPageHistoryData', page-1)
          })
      } else if (this.list_id == constant.local_songlist_id) {
          this.$nextTick(() => {
              this.$store.dispatch('getCurrentPageLocalData', page-1)
          })
      } else if (this.list_id == constant.downloaded_songlist_id) {
          this.$nextTick(() => {
              this.$store.dispatch('getCurrentPageDownloadedData', page-1)
          })
      }
    },
    playWholeSongList(paramsJson) {
      if (this.isMass) {
        return;
      }
      let song = this.data[paramsJson.playIndex];
      let songid = this.commonFuns.getSongId(song);
      if (songid.indexOf("_local") != -1) {
        if (!fs.existsSync(song.file_path)) {
          this.commonFuns.createTips("本地文件不存在", "error");
          this.$store.dispatch("resetCurrentPlayingState");
          return;
        }
      }

      if (this.commonFuns.isLocalSong(song)) {
        this.$store.dispatch("playSongUptoWholeSongList", paramsJson);
        eventBus.$emit("isShowAddMusicIcon", true);
        return;
      }
      
      let song_listid = "";
      if (song.hasOwnProperty("listid")) {
        song_listid = song.listid;
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
      // console.log(request_data)
      songService.getSongLink(
        request_data,
        res => {
          isGetResponse = true;
          if (res.error_code == 22000) {
            me.$store.dispatch("playSongUptoWholeSongList", paramsJson);
            return;
          } else if (res.error_code == 22469) {
            //单点售卖歌曲、专辑
            let songinfoJson = res.result;
            me.$store.dispatch("showSaleSongMessageBox", songinfoJson);
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
      eventBus.$emit("isShowAddMusicIcon", true);
    },
    choseSong(songinfo, index) {
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
    isSongLocal(songInfo) {
      let songid = this.commonFuns.getSongId(songInfo);
      if (songid.length <= 0 || songid.indexOf("_local") !== -1) {
        return true;
      }

      return false;
    },
    // onScroll() {
    //     // if (this.isScroll) {
    //     //     return false
    //     // }
    //     // this.isScroll = true
    //     // this.request()
    // },
    isSongCanDownload(songInfo) {
      return this.commonFuns.isSongCanDownload(songInfo);
    },
    getFileSize(index) {
      let filesize = "";
      if (index < 0 || index >= this.data.length) {
        return filesize;
      }

      let songInfo = this.data[index];
      if (songInfo.hasOwnProperty("file_size")) {
        let size = songInfo.file_size;
        if (parseInt(size) > 0) {
          filesize = (size / 1024 / 1024).toFixed(1);
          filesize += "M";
        }
      }

      return filesize;
    },
    downloadSong(songinfoJson, event) {
      let songid = this.commonFuns.getSongId(songinfoJson);
      if ((!songid && songid.length <= 0) || song_id.indexOf("_local") != -1) {
        return;
      }

      let clientX = event.clientX;
      let clientY = event.clientY;
      let positionData = {
        clientX: clientX,
        clientY: clientY
      };
      if (document.getElementsByClassName("context-menu-wrapper").length > 0) {
        document.body.removeChild(
          document.getElementsByClassName("context-menu-wrapper")[0]
        );
      }
      let songArray = [];
      songArray.push(songinfoJson);
      this.MessageBox.download(songArray, positionData);
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
        //console.log('current favor state is: ' + this.favorstate + ' song is: ' + songInfo.title)
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

      let offset = (this.currentPage - 1) * this.pageSize;
      let options = {
        currentPage: this.currentPage,
        offset: offset,
        pageSize: this.pageSize,
        type: this.type
      };

      this.$store.dispatch("delSongFavorites", {
        songsData: songsData,
        isFavoured: isFavoured,
        options: options
      });

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

      console.log("currentPage:" + this.currentPage);

      this.MessageBox.context(
        this.data,
        indexArray,
        this.type,
        this.list_id,
        positionData,
        {
          currentPage: this.currentPage
        }
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
    getIcons(song) {
      let namesStr = song.biaoshi;
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

      // if(this.isSongLocal(song)) {
      //   biaoshi += '<i class="' + "local" + '"></i>';
      // }
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
    getArtistName(song) {
      let artist_name = "";
      for (let i = 0; i < song.authorLinksArr.length; i++) {
        let item = song.authorLinksArr[i];
        artist_name += item.artist_name;
        if (i < song.authorLinksArr.length - 1) {
          artist_name += ",";
        }
      }

      return artist_name;
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
    },
    changeScroll() {
      // 获取主页面高度
      let myWrapperDom = document.querySelector(".my-wrapper");
      let _mainHeight = parseFloat(
        this.domAction.getStyle(myWrapperDom, "height")
      );
      //导航高度
      let sectionTitleDom = document.querySelector(".fixedTab");
      let _titleHeight = parseFloat(
        this.domAction.getStyle(sectionTitleDom, "height")
      );
      
      let _tableTitleDom = document.querySelector(".table-title");
      let _tableTitleHeight = parseFloat(
        this.domAction.getStyle(_tableTitleDom, "height")
      );

      if ((location.href.indexOf("local") > -1)||(location.href.indexOf("downloaded") > -1)) {
        _mainHeight -= 69;
      }
      if (location.href.indexOf("favourCollectionSong") > -1) {
        _mainHeight -= 34 ;
      }
      let _height = parseFloat(
        _mainHeight - _titleHeight - _tableTitleHeight
      );
      let scrollBarBodyDom = document.querySelector(".scrollBarBody");
      this.domAction.setStyle(scrollBarBodyDom, "height", _height + "px");
    }
  }
};
</script>
<style scoped>
.table-song-list input.checked {
  background-position: -16px 0;
}
.table-song-list input {
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
.check input {
  margin-top: 14px;
}

.scrollBarBody {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.table-song-list {
  /*height: 100%;*/
}

.table-title {
  display: flex;
  background: #fafafa;
  border-bottom: solid 1px #ffffff;
  height: 26px;
  align-items: center;
  justify-content: flex-start;
}

.table-song-list span.num {
  flex: 0 0 40px;
  display: flex;
  justify-content: center;
}

.table-song-list span.title {
  flex: 1 1 239px;
  display: flex;
  position: relative;
  height: 40px;
  align-items: center;
}

.table-song-list span.fct {
  position: absolute;
  top: 0px;
  right: 10px;
  width: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  margin-right: 14px;
  transition: 0.2s 0.05s linear;
}

.table-song-list span.singer {
  flex: 1 1 100px;
}

.table-song-list span.album {
  flex: 1 1 145px;
  padding-left: 5px;
}

.table-song-list span.time {
  flex: 1 1 60px;
}

.table-song-list span.size {
  flex: 0 0 40px;
  display: flex;
  justify-content: center;
  padding-left: 5px;
}

.table-song-list span.progress {
  flex: 1 1 120px;
}

.table-song-list span.status {
  flex: 1 1 120px;
  display: flex;
  align-items: center;
}

.table-title span {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  /*border-left: 1px solid #e5e5e5;*/
  border: none;
  /*padding-left: 5px;*/
}

.table-title span.fct {
  /*border-left: none;*/
}

.song-list span {
  /*width: 100%;*/
  height: 100%;
  line-height: 40px;
  /*padding-left: 5px;*/
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.table-song-list .current .playing {
  width: 12px;
  height: 12px;
  background: url("~static/images/icon_playing.svg") no-repeat;
  margin-left: -2px;
  position: relative;
  left: 15px;
}

.table-song-list li:hover span.fct {
  opacity: 1;
}
.table-song-list li.disabled:hover span.fct {
  opacity: 1;
}
.table-song-list a:hover {
  color: #e13228;
}

.play-btn {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url(../../common/images/play_small.png) no-repeat;
}

.progress .el-progress {
  margin-top: 17px;
}

.song-list span.bd-btn {
  display: inline-block;
  padding: 0 8px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  border: solid 1px #c5c5c5;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 4px;
}

.warning {
  color: #ff7e6b;
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

._title {
  max-width: 130px;
  transition: 0.2s linear;
}

._title._title_1 {
  max-width: 140px;
}

._title._title_2 {
  max-width: 140px;
}

._title._title_3 {
  max-width: 120px;
}

._title._title_4 {
  max-width: 80px;
}

.table-song-list li:hover ._title {
  max-width: 130px;
}

.mv_icon {
  display: inline-block;
  width: 20px;
  cursor: pointer;
  margin-left: 4px;
  margin-top: 5px;
}

.mv_icon i {
  display: inline-block;
  width: 20px;
  height: 30px;
  background: url("~static/images/mv/mv.svg") no-repeat 0 13px;
}

.mv_icon:hover i {
  background: url("~static/images/mv/mv_hover.svg") no-repeat 0 13px;
}

.mv_icon.gray {
  cursor: default;
}

.mv_icon.gray:hover i,
.mv_icon.gray i {
  background: url("~static/images/mv/mv_gray.svg") no-repeat 0 13px;
}

.local_icon {
  display: inline-block;
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 3px;
}

.local_icon i {
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url("~static/images/jiaobiao/local.svg") no-repeat 0 13px;
}

.table-song-list li:hover .biaoshi {
  opacity: 0;
}

@media screen and (min-width: 1100px) {
  .table-song-list span.title {
    flex: 1 1 339px;
  }
  ._title {
    max-width: 200px;
  }
  ._title._title_1 {
    max-width: 210px;
  }
  ._title._title_2 {
    max-width: 210px;
  }
  ._title._title_3 {
    max-width: 190px;
  }
  ._title._title_4 {
    max-width: 170px;
  }
  .table-song-list li:hover ._title {
    max-width: 200px !important;
  }
  /* .table-song-list ._title._title_2 {
            max-width: 300px;
        }
        .table-song-list li:hover .s-title {
            flex: 1 0 366px;
        }
        .table-song-list li:hover ._title._title_2 {
            max-width: 240px;
        } */
}

.biaoshi {
  max-width: 118px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  opacity: 1;
  transition: 0.2s linear;
}
/*  >>>  用来解决v-html添加的元素在sacpe不解析对应css的问题 */

.biaoshi >>> i {
  display: inline-block;
  width: 20px;
  height: 30px;
  margin-left: 4px;
  margin-top: 4px;
}

.biaoshi >>> i.first {
  background: url("~static/images/jiaobiao/first.svg") no-repeat 0 8px;
}

.biaoshi >>> i.lossless {
  background: url("~static/images/jiaobiao/lossless.svg") no-repeat 0 8px;
}

.biaoshi >>> i.pay {
  background: url("~static/images/jiaobiao/pay.svg") no-repeat 0 8px;
}

.biaoshi >>> i.sole {
  background: url("~static/images/jiaobiao/sole.svg") no-repeat 0 8px;
}

.biaoshi >>> i.presell {
  background: url("~static/images/jiaobiao/presell.svg") no-repeat 0 8px;
}

.biaoshi >>> i.local {
  background: url("~static/images/jiaobiao/local.svg") no-repeat 0 8px;
}
</style>
<style>
.el-progress {
  line-height: auto;
}

.el-progress-bar__inner {
  background-color: #e13228;
}

.el-progress-bar {
  width: 80%;
}

.el-progress.is-exception .el-progress-bar__inner {
  background: #999999;
}
</style>