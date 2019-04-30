<template>
    <div v-cloak class="addtoContext"  ref="addtoContexts" :style="{'left':positionX+'px','top':positionY+'px'}" :class="{'opacity':!isShowContext}">
        <ul>
            <li v-if="isHaveNetSong()" @click="addToFavorite">我的收藏</li>
            <li @click="addToPlayList">播放列表</li>
            <li v-if="isHaveNetSong()" @click="addToNewList">新建歌单</li>
            <div v-if="isHaveNetSong()" class="seconds-menu-wrap">
                <ul class="seconds-menu-list-ul">
                    <li v-if="loginStatus && userDiyList && userDiyList.listinfo && (val.list_id!=listid)" v-for="(val,index) in userDiyList.listinfo" :key="val.list_id" @click="addSongsToSelfSongList(val.list_id)" :title="val.list_title">{{val.list_title}}</li>
                </ul>
            </div>
        </ul>
    </div>
</template>

<script>
import Popup from "utils/popup";
import downloadingService from "../../service/downloadSongService.js";
import { mapGetters, mapActions } from "vuex";

const { shell } = require("electron");

export default {
  name: "addtomenu",
  mixins: [Popup],
  props: {
    modal: {
      default: true
    },
    closeOnClickModal: {
      default: true
    }
  },
  computed: {
    ...mapGetters({
      loginStatus: "loginStatus",
      userInfo: "loginUserInfo",
      userDiyList: "userDiyList",
      currentPlaysList: "currentPlaysList"
    }),
    clientY() {
      return this.positionData.clientY;
    },
    clientX() {
      return this.positionData.clientX;
    },
    boxHeight() {
      let boxDom = document.querySelector(".addtoContext");

      let boxHeight = parseFloat(this.domAction.getStyle(boxDom, "height"));
      if (!boxDom) {
        let me = this;
        let count = 0;
        let interval = setInterval(function() {
          count++;
          boxDom = document.querySelector(".addtoContext");
          if (boxDom) {
            me.isShowContext = true;
            boxHeight = parseFloat(me.domAction.getStyle(boxDom, "height"));
            me.boxData.height = boxHeight;
            clearInterval(interval);
          } else {
            if (count > 10) {
              clearInterval(interval);
            }
          }
        }, 300);
      } else {
        return boxHeight;
      }
    },
    boxWidth() {
      let boxDom = document.querySelector(".addtoContext");
      let boxWidth = parseFloat(this.domAction.getStyle(boxDom, "width"));
      if (!boxDom) {
        let me = this;
        let count = 0;
        let interval = setInterval(function() {
          count++;
          boxDom = document.querySelector(".addtoContext");
          if (boxDom) {
            me.isShowContext = true;
            boxWidth = parseFloat(me.domAction.getStyle(boxDom, "width"));
            me.boxData.width = boxWidth;
            clearInterval(interval);
          } else {
            if (count > 10) {
              clearInterval(interval);
            }
          }
        }, 300);
      } else {
        return boxWidth;
      }
    },
    miniBarHeight() {
      let minibarBox = document.getElementById("minibar");
      let miniBarHeight = parseFloat(
        this.domAction.getStyle(minibarBox, "height")
      );
      return miniBarHeight;
    },
    clientHeight() {
      //主区域
      let mainContentBox = document.getElementById("app");
      let clientHeight = parseFloat(
        this.domAction.getStyle(mainContentBox, "height")
      );
      return clientHeight;
    },
    clientWidth() {
      //主区域
      let mainContentBox = document.getElementById("app");
      let clientHeight = parseFloat(
        this.domAction.getStyle(mainContentBox, "width")
      );
      return clientHeight;
    },
    positionX() {
      let clientX = this.clientX,
        boxWidth = this.boxWidth ? this.boxWidth : this.boxData.width,
        clientWidth = this.clientWidth;
      let scrollBarWidth = 8;
      if (clientX + boxWidth > clientWidth - scrollBarWidth) {
        this.isComputedLeftStyle = true;
        let positionX = clientX - boxWidth;
        return positionX > 0 ? positionX : "0";
      } else {
        return clientX;
      }
    },
    positionY() {
      let clientY = this.clientY,
        boxHeight = this.boxHeight ? this.boxHeight : this.boxData.height,
        clientHeight = this.clientHeight,
        miniBarHeight = this.miniBarHeight,
        positionY = 0;
      if (clientY + boxHeight > clientHeight - miniBarHeight) {
        positionY = clientY - boxHeight;
        return positionY > 0 ? positionY : "0";
      } else {
        return clientY;
      }
    }
  },
  data() {
    return {
      songArray: [],
      listid: "",
      positionData: {
        clientX: 0,
        clientY: 0
      },
      isComputedLeftStyle: false,
      boxData: {
        width: 0,
        height: 0
      },
      isShowContext: false
    };
  },
  mounted() {
  },
  created() {
    if (document.querySelector(".addtoContext")) {
      this.isShowContext = true;
    }
    document.body.addEventListener("click", this.clickEventListener);
  },
  beforeDestroy() {
    document.body.removeEventListener('click', this.clickEventListener);
  },
  methods: {
    clickEventListener(event) {
        if (!event.target.classList.contains("download-btn") &&
            !event.target.classList.contains("download-icon") &&
           document.getElementsByClassName("addtoContext").length > 0
        ) {
          document.body.removeChild(document.getElementsByClassName("addtoContext")[0]);
        } 
    },
    isHaveNetSong() {
      if (this.songArray.length <= 0) {
        return false;
      }

      for (let i = 0; i < this.songArray.length; i++) {
        let song = this.songArray[i];
        let songid = this.commonFuns.getSongId(song);
        if (songid.length > 0 && songid.indexOf("_local") === -1) {
          return true;
        }
      }

      return false;
    },
    playSelectSongs() {
      let songs = [];
      for (let i = 0; i < this.songArray.length; i++) {
        let song = this.songArray[i];
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

      let isPlay = false;
      if (this.currentPlaysList.length <= 0) {
        isPlay = true;
      }
      this.$store.dispatch("addSongsToCurrentPlayinglist", {
        songArray: songs,
        playIndex: 0,
        isPlay: isPlay,
        isReset: false
      });

      this.commonFuns.createTips("已添加到正在播放列表", "success");
    },
    addToPlayList() {
      this.playSelectSongs();
      if (document.querySelector('.v-modal')) {
        document.body.removeChild(document.querySelector('.v-modal'))
      }
    },
    addToFavorite() {
      if (document.querySelector('.v-modal')) {
        document.body.removeChild(document.querySelector('.v-modal'))
      }
      if (!this.loginStatus) {
        this.$store.dispatch("TpassLogin");
        return;
      }
      let songs = [];
      for (let i = 0; i < this.songArray.length; i++) {
        let song = this.songArray[i];
        let songid = this.commonFuns.getSongId(song);
        if (songid.length > 0 && songid.indexOf("_local") === -1) {
          songs.push(song);
        }
      }

      let isFavorite = false;
      this.$store.dispatch("addSongFavorites", {
        songsData: songs,
        isFavoured: isFavorite
      });

      songs.forEach(song => {
        let songid = this.commonFuns.getSongId(song);
        let favourIconDom = document
          .querySelector("#song_" + songid)
          .querySelector(".favour-icon");
        this.domAction.removeClass(favourIconDom, "favour-icon");
        this.domAction.addClass(favourIconDom, "favoured-icon");
      });
    },
    getSelectSongIds() {
      let song_ids = "";
      if (this.songArray.length <= 0) {
        return song_ids;
      }

      let songids = [];
      for (let i = 0; i < this.songArray.length; i++) {
        let song = this.songArray[i];
        let songid = this.commonFuns.getSongId(song);
        if (songid.length > 0 && songid.indexOf("local") == -1) {
          songids.push(songid);
        }
      }

      song_ids = songids.join(",");
      return song_ids;
    },
    addSongsToSelfSongList(list_id) {
      if (document.querySelector('.v-modal')) {
        document.body.removeChild(document.querySelector('.v-modal'))
      }

      if (this.listid == list_id) {
        return false;
      }

      let song_ids = this.getSelectSongIds();
      this.$store.dispatch("addSongsToList", {
        list_id: list_id,
        song_ids: song_ids
      });
    },
    addToNewList() {
      if (!this.loginStatus) {
        this.$store.dispatch("TpassLogin");
        return;
      }

      let me = this;
      let song_ids = this.getSelectSongIds();
      if (song_ids.length <= 0) {
        return;
      }

      let empty_title = "新建自建歌单";
      this.MessageBox.tips("新建歌单", empty_title, {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        showCancelButton: true,
        showInput: true,
        confirmButtonClass: "noraml-btn",
        cancelButtonClass: "cancel-big-btn",
        beforeClose: null,
        handleAction: () => {
          let title = document.getElementById("modifyGedanNameInput").value;
          if (title.length > 20) {
            this.commonFuns.createTips("歌单名称不能超过20个字符", "warning");
            return;
          }
          if (title.trim().length == 0) {
            this.commonFuns.createTips("名称不能为空", "warning");
            return;
          }
          let paramsJson = {
            title: title,
            song_ids: song_ids,
            isDone: false,
            ret_code: 0
          };
          me.$store.dispatch("addSongListAndSongs", paramsJson);
          let messageBoxDom = document.querySelectorAll(
            ".el-message-box__wrapper"
          );
          messageBoxDom.forEach((itemdom, index) => {
            document.body.removeChild(itemdom);
          });
          if (document.querySelector(".v-modal")) {
            document.body.removeChild(document.querySelector(".v-modal"));
          }
        }
      });
    }
  }
};
</script>
<style scoped>
.addtoContext {
  display: block;
  max-width: 110px;
  max-height: 240px;
  overflow-x: hidden;
  position: absolute;
  z-index: 300000;
  top: 0;
  left: 0;
  background: #fff;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
}

.addtoContext ul {
  display: flex;
  flex-flow: column wrap;
}

.addtoContext ul .seconds-menu-wrap {
  max-height: 120px;
  overflow-y: scroll;
  overflow-x: hidden;
}

.addtoContext ul .seconds-menu-wrap li {
  max-width: 100px;
  overflow: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-modal {
  background: transparent;
}

.addtoContext li {
  height: 40px;
  line-height: 40px;
  padding: 0 13px 0 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-bottom: solid 1px #f2f2f2;
  cursor: pointer;
  position: relative;
}

.addtoContext li:hover {
  background-color: #e13228;
  color: #ffffff;
}

.download-vip-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("~static/images/icon_vip2.svg") no-repeat;
  vertical-align: -5px;
  margin-left: 5px;
}

.opacity {
  opacity: 0;
}
</style>