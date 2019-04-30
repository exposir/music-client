<template>
  <div class="mass-operation">
    <div class="button-wrapper">
        <span class="ischeckoutall"><input v-model="isAllChecked" :class={checked:isAllChecked} type="checkbox"><label>全选</label></span>
        <div class="button-box">
            <button-item class="button-margin" :btnTxt="'播放'" :icon="'playall-icon'" :handleAction="playSelectSongs"></button-item>
            <div class="import-con-box">
                <div class="content">
                     <button-item :btnTxt="'添加到'" :icon="'add-icon'"></button-item>
                     <ul class="import-con">
                        <li @click="addToFavorite">我的收藏</li>
                        <li @click="addToPlayList">播放列表</li>
                        <li @click="addToNewList">新建歌单</li>
                        <ul class="seconds-menu-list-ul">
                          <li v-if="loginStatus && userDiyList && userDiyList.listinfo" v-for="(val,index) in userDiyList.listinfo" @click="addSongsToSelfSongList(val.list_id)" :title="val.list_title">{{val.list_title}}</li>
                        </ul>
                    </ul>
                </div>
            </div>
            <!--<button-item class="button-margin" :btnTxt="'下载'" :icon="'download-icon'" :handleAction="downloadSelectSongs"></button-item>-->
            <div class="import-con-box">
                <div class="content">
                     <button-item :btnTxt="'下载'" :icon="'download-icon'"></button-item>
                     <ul class="import-con" v-if="selectSongs.length>0">
                        <li v-if="isHaveDonglownloadType(0)" @click="downloadSelectSongs(0)">无损品质
                          <i class="download-vip-icon"></i>
                        </li>
                        <li v-if="isHaveDonglownloadType(1)" @click="downloadSelectSongs(1)">高品质</li>
                        <li v-if="isHaveDonglownloadType(2)" @click="downloadSelectSongs(2)">标准品质</li>
                    </ul>
                </div>
            </div>
            <button-item class="button-margin" :btnTxt="'退出批量操作'" :icon="'icon_exit_mass_op'" :handleAction="exitMassOp"></button-item>
        </div>
    </div>
    <mass-songlist v-if="songList.length>0" :songList="songList"></mass-songlist>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import commonFuns from "../../components/commonFuns/common.js";
import scrollBar from "../scrollBar/scrollBar.js";
import massSonglist from "./mass-songlist.vue";
import buttonItem from "components/button/button-item.vue";

export default {
  name: "mass-operation",
  computed: {
    ...mapGetters({
      selectSongs: "massoperationlist",
      currentPlaysList: "currentPlaysList",
      loginStatus: "loginStatus",
      userDiyList: 'userDiyList',
    }),
    isAllChecked: {
      get: function() {
        // console.log(this.selectSongs.length);
        let checked = false;
        if (this.selectSongs.length == this.songList.length) {
          checked = true;
        }
        return checked;
      },
      set: function(value) {
        this.all_selected_checked = value;
        if (value) {
          this.$store.dispatch("addItemsAndClearOld", this.songList);
        } else {
          this.$store.dispatch("emptyMassOperationList");
        }
        // console.log(this.selectSongs.length);
      }
    }
  },

  components: {
    massSonglist,
    buttonItem
  },
  data() {
    return {
      songList: []
    };
  },
  watch: {
    $route(to, from) {
      console.log(to);
      console.log(from);
    }
  },
  mounted() {
    this.songList = this.$route.query.songList;
    // console.log(JSON.stringify(this.songList));
  },
  methods: {
    playSelectSongs() {
      if (this.selectSongs.length <= 0) {
        return;
      }

      let songs = [];
      for (let i = 0; i < this.selectSongs.length; i++) {
        let song = this.selectSongs[i];
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
    },
    getSelectSongIds() {
      let song_ids = "";
      if (this.selectSongs.length <= 0) {
        return song_ids;
      }

      let songids = [];
      for (let i = 0; i < this.selectSongs.length; i++) {
        let song = this.selectSongs[i];
        let songid = this.commonFuns.getSongId(song);
        if (songid.length > 0) {
          songids.push(songid);
        }
      }

      song_ids = songids.join(",");
      return song_ids;
    },
    addToFavorite() {
      
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
    },
    downloadSelectSongs(download_type) {
      if (!this.loginStatus) {
        if (download_type == 0) {
          this.$store.dispatch("TpassLogin");
          return;
        }
      }

      let download_array = [];
      for (let i = 0; i < this.selectSongs.length; i++) {
        let song = this.selectSongs[i];
        if (this.commonFuns.isSongCanDownload(song)) {
          download_array.push(song);
        }
      }
      // console.log(download_array)
      for (let i = 0; i < download_array.length; i++) {
        let songInfo = download_array[i];
        let param = {
          sq: [],
          hq: [],
          normal: []
        };
        let empty = [];
        this.commonFuns.getSongBitrates(songInfo, param);
        let sq = param.sq.concat(empty);
        let hq = param.hq.concat(empty);
        let normal = param.normal.concat(empty);

        let timestamp = Date.parse(new Date());
        let dt = normal[0];
        if (download_type === 0) {
          if (sq.length > 0) {
            dt = sq[0];
          } else if (hq.length > 0) {
            dt = hq[0];
          }
        } else if (download_type === 1) {
          if (hq.length > 0) {
            dt = hq[0];
          }
        }
        let songid = this.commonFuns.getSongId(songInfo);

        let me = this;
        if (download_array.length === 1) {
          downloadingService.getDownloadUrl(
            {
              dt: dt,
              timestamp: timestamp,
              songid: songid
            },
            function(jsonData) {
              let error_code = jsonData.error_code;
              if (error_code == 22000) {
                me.$store.dispatch("addDownloadingItem", {
                  dt: dt,
                  song_info: jsonData.songinfo
                });
                me.commonFuns.createTips("已添加到下载队列", "success");
              } else {
                if (error_code == 22469) {
                  //单点售卖歌曲、专辑
                  if (jsonData.hasOwnProperty("result")) {
                    me.$store.dispatch(
                      "showSaleSongMessageBox",
                      jsonData.result
                    );
                  }
                } else if (error_code == 22467) {
                  //全球付费
                  me.$store.dispatch("showOpenVipMessageBox");
                } else {
                  console.log(
                    "song.download return failed, code is: " + error_code
                  );
                }
              }
            },
            function() {}
          );
        } else {
          me.$store.dispatch("addDownloadingItem", {
            dt: dt,
            song_info: songInfo
          });
        }
      }

      if (download_array.length > 1) {
        this.commonFuns.createTips("已添加到下载队列", "success");
      }
    },
    isHaveDonglownloadType(download_type) {
      if (this.selectSongs.length <= 0) {
        return false;
      }

      if (this.selectSongs.length > 1) {
        return true;
      }

      let param = {
        sq: [],
        hq: [],
        normal: []
      };
      this.commonFuns.getSongBitrates(this.selectSongs[0], param);

      if (download_type === 0) {
        return param.sq.length > 0;
      } else if (download_type === 1) {
        return param.hq.length > 0;
      } else {
        return param.normal.length > 0;
      }
    },
    exitMassOp() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.mass-operation {
  height: 100%;
  overflow: hidden;
  padding: 0 17px;
}
.mass-operation input {
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
.mass-operation input.checked {
  background-position: -16px 0;
}

.button-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}
.ischeckoutall {
  padding-left: 14px;
}
.ischeckoutall input {
  margin-right: 10px;
}

.button-box {
  display: flex;
  flex-flow: row nowrap;
}

.button-margin {
  margin-right: 10px;
}

.import-con-box {
  position: relative;
  z-index: 10;
  width: 90px;
  height: 24px;
  margin-right: 10px;
}

.import-con-box.icon_exit_mass_op {
  margin-right: 0;
}

.import-con-box .content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 114px;
}

.import-con-box:hover .content {
  height: 114px;
}

.import-con-box:hover .import-con {
  display: block;
}

.import-con {
  position: absolute;
  width: 120px;
  height: 110px;
  box-shadow: 0px 0px 20px 2px #d2d2d2;
  border: 1px solid #f2f2f2;
  background: #fff;
  left: -4px;
  top: 32px;
  display: none;
  z-index: 10;
}

.import-con li {
  height: 37px;
  padding-left: 13px;
  line-height: 37px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}

.import-con li:hover {
  background: #f2f2f2;
}

.download-vip-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("~static/images/icon_vip2.svg") no-repeat;
  vertical-align: -5px;
  margin-left: 5px;
}
</style>

