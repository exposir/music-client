<template>
    <i v-if="disabled!=='disabled'" class="play-icon" @click="playSongUptoWholeSongList(data,$event)" title="播放">
    </i>
    <i v-else class="play-icon" :class="{disabled:disabled==='disabled'}" title="播放"></i>
</template>
<script>
import { mapGetters } from "vuex";
import songService from "../../service/songService";
import constant from "../../constant.js";
const fs = require("fs");
export default {
  name: "play-icon",
  props: {
    data: Object,
    listid: {
      type: String,
      default: ""
    },
    playIndex: 0,
    type: {
      type: String,
      default: ""
    },
    disabled: {
      type: String,
      default: ""
    }
  },
  computed: mapGetters({
    loginUserInfo: "loginUserInfo"
  }),
  methods: {
    formatRequestData(params) {
      let song = params.songInfo;
      let enableHQ = params.enableHQ; //开启高品质试听
      let isAutoSwitch = params.isAutoSwitch;

      console.log("get song link song is: " + song.title);
      let aac = 0;
      // let aac = enableHQ ? "2" : "1";
      // if (process.platform == "darwin") {
      //   aac = 0; //mac不支持aac试听？其实应该也可以支持
      // }
      let songId = this.commonFuns.getSongId(song);

      let song_listid = "";
      let res = "1";
      if (song.hasOwnProperty("listid")) {
        song_listid = song.listid;
        if (song_listid == constant.favorite_songlist_id) {
          res = 2;
        }
      }

      let del_status = 0;
      if (song.hasOwnProperty("del_status")) {
        del_status = song.del_status;
      }
      let request_data = {
        songid: songId,
        res: res,
        aac: aac
      };
      return request_data;
    },
    playSongUptoWholeSongList(paramsJson, event) {
      if (this.type != "playing") {
        let index = paramsJson.playIndex;
        let songArray = paramsJson.songArray;
        let song = songArray[index];

        let songid = this.commonFuns.getSongId(song);
        if (songid.indexOf("_local") != -1) {
          if (!fs.existsSync(song.file_path)) {
            this.commonFuns.createTips("本地文件不存在", "error");
            this.$store.dispatch("resetCurrentPlayingState");
            return;
          }
        }
        if (paramsJson.songArray && this.listid && this.listid.length > 0) {
          console.log("current play song list id is: " + this.listid);
          for (let i = 0; i < paramsJson.songArray.length; i++) {
            paramsJson.songArray[i].listid = this.listid;
          }
        }
        if (this.commonFuns.isLocalSong(song)) {
          this.$store.dispatch("playSongUptoWholeSongList", paramsJson);
          eventBus.$emit("isShowAddMusicIcon", true);
          return;
        }

        let params = {};
        params.songInfo = song;
        params.enableHQ = this.loginUserInfo.flag == 200 ? true : false;
        let request_data = this.formatRequestData(params);

        let isGetResponse = false;
        let me = this;
        songService.getSongLink(
          request_data,
          res => {
            isGetResponse = true;
            console.log(res);
            if (res.error_code == 22000) {
              let songinfoJson = res.songinfo;
              // console.log(songinfoJson);
              if ((songinfoJson.copy_type == 1 || songinfoJson.copy_type == 3) && songinfoJson.del_status == 0) {
                let playLinkInfo = this.commonFuns.extractSongFileLink(
                  res,
                  params.enableHQ
                );
                console.log(playLinkInfo);

                let show_link = "";
                if (playLinkInfo.hasOwnProperty("show_link")) {
                  show_link =
                    playLinkInfo.show_link.trim().length > 0
                      ? playLinkInfo.show_link
                      : playLinkInfo.file_link;
                }
                if (show_link.length < 1) {
                  me.$store.dispatch("showOpenVipMessageBox");
                  return;
                }
                me.$store.dispatch("playSongUptoWholeSongList", paramsJson);
                eventBus.$emit("isShowAddMusicIcon", true);
              } else {
                let error_msg = "您好，应版权方要求，该歌曲下载后，即可播放哦~";
                if (songinfoJson.copy_type == 0) {
                  error_msg = "应版权方要求，该歌曲暂时无法播放";
                } else if (songinfoJson.del_status == 1) {
                  error_msg = "该歌曲已下线";
                }
                this.commonFuns.createTips(error_msg);
              }
            } else if (res.error_code == 22469) {
              //单点售卖歌曲、专辑
              me.$store.dispatch("showSaleSongMessageBox", res.result);
            } else if (res.error_code == 22467) {
              //全球付费
              me.$store.dispatch("showOpenVipMessageBox");
            }
          },
          function(err) {
            console.log("get song link occurs error..................");
            let error_msg = "网络错误";
            if (!isGetResponse) {
              me.$store.dispatch("playErrorHandler", {
                isAutoSwitch: false,
                errorMsg: error_msg
              });
            }
          }
        );
      } else {
        let playIndex = paramsJson.playIndex;
        let isAutoSwitch = false;
        this.$store.dispatch("playSpecifySong", { playIndex, isAutoSwitch });
      }
    }
  }
};
</script>
<style scoped>
.play-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon1.svg") no-repeat;
  cursor: pointer;
}

.play-icon:hover {
  background: url("~static/images/listIcon/icon1_1.svg") no-repeat;
}

.disabled.play-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("~static/images/listIcon/icon1_2.svg") no-repeat;
  cursor: default;
}
</style>