<template>
  <div class="new-rec-bangdan">
    <div class="rec-wrapper">
      <div class="rec-title">
        <div class="rec-a">
          <span class="play-all" @click="playWholeSongList({'songArray':data})">
            <p class="left-margin" >播放全部</p>
          </span>
        </div>
        <div class="rec-a">
          <span class="download-all" @click="showDownload()" @click.stop>
            <p class="left-margin">下载全部</p>
          </span>
          <ul class="import-con">
            <li v-if="isHaveDonglownloadType(0)" @click="downloadSelectSongs(0)">
              无损品质
              <i class="download-vip-icon"></i>
            </li>
            <li v-if="isHaveDonglownloadType(1)" @click="downloadSelectSongs(1)">高品质</li>
            <li v-if="isHaveDonglownloadType(2)" @click="downloadSelectSongs(2)">标准品质</li>
          </ul>
        </div>

        <div class="selectBtn">
          <el-pagination small layout="prev, next" :total="30" @current-change="onChangePage"></el-pagination>
          <span class="left-btn"></span>
          <span class="select-title">{{rec_page}}/3</span>
          <span class="right-btn" ></span>
        </div>
      </div>
      <div class="rec-list">
        <div
          class="rec-item"
          v-for="(val,index) in data"
          :class="{'disabled':(val.copy_type==0 || val.del_status==1),'active':select_index_array.indexOf(index)>-1}"
          @dblclick="playWholeSongList({'songArray':data,'playIndex':index})"
          :data-index="index"
          @mouseenter="mouseHover(index)"
          @contextmenu="onContextMenu(index, $event)"
          @click.stop="choseSong(index)"
          :key="getSongId(val)"
        >
          <div class="rec-item-red" :class="{'active':select_index_array.indexOf(index)>-1}"></div>
          <img alt class="rec-item-img" :src="val.pic_big">
          <div class="rec-item-inner">
            <div class="rec-item-title">
              <p>{{val.title}}</p>
            </div>
            <div class="rec-item-author" :title="val.author">
              <span
                v-if="parseInt(val.has_mv) == 1"
                class="mv_icon"
                @click="playVideo({'song_id':val.song_id,'mv_id':val.mv_id})"
              >
                <i></i>
              </span>
              <span class="biaoshi_new" v-html="getIcons(val.biaoshi)"></span>
              <router-link 
                @click.native="commonFuns.crmStatistics('recommend','recommendSinger')"
                class="rec-item-author-name"
                v-for="(item,i) in val.authorLinksArr"
                :to="'/music/public/singer/'+item.artist_id+'/0'"
              >
                {{item.artist_name}}
                <i v-if="i<val.authorLinksArr.length-1">,</i>
              </router-link>
            </div>
            <span class="fct" :class="{'fct_active':select_index_array.indexOf(index)>-1}">
              <span @click="commonFuns.crmStatistics('recommend','clickPlay')">
              <play-icon 
                v-if="val.copy_type!=2"
                :type="'songlist'"
                :listid="''"
                :data="{'songArray':data,'playIndex':index}"
              ></play-icon>
              <play-icon
                v-else
                :type="'songlist'"
                :listid="''"
                :disabled="'disabled'"
                :data="{'songArray':data,'playIndex':index}"
              ></play-icon>
              </span>
              <span @click="commonFuns.crmStatistics('recommend','clickDownload')">
              <download-icon v-if="isSongCanDownload(val)" :type="'songlist'" :data="val"></download-icon>
              <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val"></download-icon>
              </span>
              <span @click="commonFuns.crmStatistics('recommend','recommendCaidan')">
              <more-icon
                :type="'songlist'"
                :data="{songArray:data, type:'bangdan', list_id:val.type, selectindex:index}"
              ></more-icon>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script scoped>
/**
 * 新版首页，为您推荐模块
 * @author Dxxx丶
 * @time  2018-08-08
 */
import { mapGetters, mapActions } from "vuex";
import playIcon from "components/icons/playIcon.vue";
import favourIcon from "components/icons/favourIcon";
import moreIcon from "components/icons/moreIcon.vue";
import downloadIcon from "components/icons/downloadIcon.vue";
import commonFuns from "../../components/commonFuns/common.js";
import mvService from "../../service/mvService";
import playMv from "../../utils/mv/playMv.js";
const ipc = require("electron").ipcRenderer;

export default {
  name: "recForU",
  computed: mapGetters({
    loginStatus: "loginStatus"
  }),
  props: {
    titleData: Object,
    data: Array
  },
  data() {
    return {
      select_index_array: [],
      favorstate: "",
      rec_page: 1
    };
  },
  components: {
    playIcon,
    favourIcon,
    moreIcon,
    downloadIcon
  },
  created() {
    document.body.addEventListener("click", this.clickEventListener);
  },
  beforeDestroy() {
    document.body.removeEventListener("click", this.clickEventListener);
  },
  methods: {
    clickEventListener(event) {
      this.select_index_array = [];
      if (
        document.getElementsByClassName("import-con")[0].style.display ==
        "block"
      ) {
        document.getElementsByClassName("import-con")[0].style.display = "none";
      }
    },
    playWholeSongList(paramsJson) {
      if (this.domAction.hasClass(event.currentTarget, "disabled")) {
        return false;
      }
      this.$store.dispatch("playWholeSongList", paramsJson);
      eventBus.$emit("isShowAddMusicIcon", true);
      this.commonFuns.crmStatistics('recommend','playAll')
    },
    showDownload() {
      if (
        document.getElementsByClassName("import-con")[0].style.display ==
        "block"
      ) {
        document.getElementsByClassName("import-con")[0].style.display = "none";
      } else {
        document.getElementsByClassName("import-con")[0].style.display =
          "block";
      }
      console.log(
        document.getElementsByClassName("import-con")[0].style.display
      );
      this.commonFuns.crmStatistics('recommend','downloadAll','click')

      // document.body.addEventListener('click', function (event) {
      //     if(document.getElementsByClassName('import-con')[0]){
      //         document.getElementsByClassName('import-con')[0].style.display = "none"
      //     }
      // })
    },
    downloadSong(songinfoJson, event) {
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
    //选择歌曲
    choseSong(index) {
      this.select_index_array = [];
      this.select_index_array.push(index);
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
      } else {
        this.favorstate = false;
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
    getSongId(song) {
      return this.commonFuns.getSongId(song);
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
      if (this.favorstate) {
        this.deleteFavour(song);
      } else {
        this.addFavour(song);
      }
    },
    isHaveDonglownloadType(download_type) {
      if (this.data.length <= 0) {
        return false;
      }

      if (this.data.length > 1) {
        return true;
      }

      let param = {
        sq: [],
        hq: [],
        normal: []
      };
      this.commonFuns.getSongBitrates(this.data[0], param);

      if (download_type === 0) {
        return param.sq.length > 0;
      } else if (download_type === 1) {
        return param.hq.length > 0;
      } else {
        return param.normal.length > 0;
      }
    },
    downloadSelectSongs(download_type) {
      if (!this.loginStatus) {
        if (download_type == 0) {
          this.$store.dispatch("TpassLogin");
          return;
        }
      }

      let download_array = [];
      for (let i = 0; i < this.data.length; i++) {
        let song = this.data[i];
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
    onContextMenu(index, event) {
      if (this.select_index_array.indexOf(index) == -1) {
        this.select_index_array.splice(0, this.select_index_array.length);
        this.select_index_array.push(index);
      }
      let clientX = event.clientX;
      let clientY = event.clientY;
      let positionData = {
        clientX: clientX,
        clientY: clientY
      };

      this.MessageBox.context(
        this.data,
        this.select_index_array,
        "online",
        "recBangdan",
        positionData
      );
    },
    onChangePage(page) {
      this.select_index_array = [];
      this.rec_page = page;
      this.commonFuns.crmStatistics('recommend','recommendRight');
      this.$store.dispatch("getRecommendDaily", {
        page_size: 10,
        page_no: page
      });
    },
    playVideo(obj) {
      this.commonFuns.crmStatistics('recommend','recommendMV')
      let data = {};
      let _self = this;
      if (obj.song_id) {
        data = { song_id: obj.song_id };
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
        data = { mv_id: obj.mv_id };
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
  }
};
</script>
<style>
.el-pagination .btn-next,
.el-pagination .btn-prev {
  background-color: transparent !important;
  border: 0 !important;
}
.el-pagination .btn-prev {
  margin-left: -12px;
}
.el-pagination .btn-next {
  margin-left: 36px;
}
.el-pagination button.disabled {
  background-color: transparent !important;
}
.el-pagination button {
  border: 0 !important;
}
.el-pagination {
  border: 0 !important;
}
</style>
<style scoped>
.new-rec-bangdan {
  flex: 1;
  width: 100%;
}
.rec-wrapper {
  width: 100%;
  height: 367px;
  background: rgba(229, 228, 228, 0.15);
}
.rec-title {
  width: 100%;
  height: 61px;
  display: flex;
  align-items: center;
  position: relative;
}
.rec-title .rec-a {
  height: 20px;
  width: 75px;
  margin-left: 15px;
  display: flex;
  align-items: center;
}
.rec-title div span:hover {
  cursor: pointer;
}
.rec-title div .play-all {
  background: url("~static/images/btn_play.svg") no-repeat;
}
.rec-title div .download-all {
  background: url("~static/images/btn_download.svg") no-repeat;
}
.rec-title div span .left-margin {
  margin-left: 24px;
  font-size: 12px;
}
.rec-title .selectBtn {
  position: absolute;
  top: 17px;
  right: 16px;
  width: 66px;
  height: 14px;
}
.rec-title .selectBtn .left-btn {
  width: 6px;
  height: 10px;
  margin-top: 9px;
  background: url("~static/images/left_btn.png") no-repeat;
}
.rec-title .selectBtn .left-btn:hover {
  background: url("~static/images/left_select_btn.png") no-repeat;
}
.rec-title .selectBtn .select-title {
  width: 54px;
  height: 10px;
  font-size: 14px;
  color: #999999;
  display: block;
  text-align: center;
  position: absolute;
  top: 3px;
  left: 9px;
}
.rec-title .selectBtn .right-btn {
  width: 6px;
  margin-top: 9px;
  height: 10px;
  background: url("~static/images/right_btn.png") no-repeat;
}
.rec-title .selectBtn .right-btn:hover {
  background: url("~static/images/right_select_btn.png") no-repeat;
}
.rec-list {
  height: 300px;
  widows: 100%;
  overflow: hidden;
}
.rec-list .rec-item {
  height: 60px;
  width: 50%;
  float: left;
  display: flex;
  position: relative;
}
.rec-list .rec-item:hover .rec-item-red {
  background: #e13228;
}
.rec-list .rec-item .rec-item-red {
  height: 48px;
  width: 6px;
  background: transparent;
}
.rec-list .rec-item .rec-item-img {
  height: 48px;
  width: 48px;
}
.rec-list .rec-item .rec-item-inner {
  flex: 1;
  height: 48px;
  overflow: hidden;
  margin-left: 9px;
}
.rec-list .rec-item .rec-item-inner .rec-item-title {
  height: 14px;
  line-height: 14px;
  margin-top: 8px;
  width: 65%;
  font-size: 14px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rec-list .rec-item .rec-item-inner .rec-item-title p {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
.rec-list .rec-item .rec-item-inner .rec-item-author {
  height: 16px;
  line-height: 16px;
  margin-top: 8px;
  width: 100%;
  display: flex;
  font-size: 12px;
  flex: 0 0 80px;
    overflow: hidden;
  text-overflow: ellipsis;
  justify-content: flex-start;
  white-space: nowrap;
  text-align: left;
  margin-left: -2px;
}
.rec-list .rec-item .rec-item-inner .rec-item-author .rec-item-author-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 4px;
  font-size: 12px;
}

.rec-list .rec-item .rec-item-inner .rec-item-author a {
  color: #999999;
}
.biaoshi_new {
  max-width: 118px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  opacity: 1;
  transition: 0.2s linear;
}
.biaoshi_new >>> i {
  display: flex;
  width: 20px;
  height: 20px;
  margin-left: 3px;
  /* margin-right: 6px; */
  margin-bottom:6px;

}

.biaoshi_new >>> i.first {
  background: url("~static/images/jiaobiao/first.svg") no-repeat 0 8px;
}

.biaoshi_new >>> i.lossless {
  background: url("~static/images/jiaobiao/lossless.svg") no-repeat 0 8px;
}

.biaoshi_new >>> i.pay {
  background: url("~static/images/jiaobiao/pay.svg") no-repeat 0 8px;
}

.biaoshi_new >>> i.sole {
  background: url("~static/images/jiaobiao/sole.svg") no-repeat 0 8px;
}

.biaoshi_new >>> i.presell {
  background: url("~static/images/jiaobiao/presell.svg") no-repeat 0 8px;
}
.mv_icon {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  opacity: 1;
  transition: 0.2s linear;
  cursor: pointer;
  /* margin-left: 3px; */
}
.mv_icon i {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 2px;
  margin-bottom: 6px;
  /* margin-right:-7px; */
  background: url("~static/images/jiaobiao/mv.svg") no-repeat 0 8px;
}
.mv_icon:hover i {
  background: url("~static/images/jiaobiao/mv_hover.svg") no-repeat 0 8px;
}
.mv_icon.gray {
  cursor: default;
}
.mv_icon.gray:hover i,
.mv_icon.gray i {
  background: url("~static/images/jiaobiao/mv_gray.svg") no-repeat 0 8px;
}
.fct {
  position: absolute;
  top: 14px;
  right: 30px;
  opacity: 0;
}
.fct_active {
  opacity: 1 !important;
}
.fct i {
  margin-left: 6px;
}
.rec-list .rec-item:hover .fct {
  opacity: 1;
}
.rec-list .rec-item.disabled:hover .fct {
  opacity: 0;
}
/* .rec-list .rec-item:hover .biaoshi {
    opacity: 0;
} */
.rec-list .rec-item.disabled span,
.rec-list .rec-item.disabled a {
  color: #ccc;
}

.author {
  flex: 0 0 80px;
  justify-content: flex-start;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: right;
}

.play {
  width: 23px;
  height: 23px;
  margin-top: 6px;
}

.rec-list .rec-item .rec-item-red.active {
  background: #e13228 !important;
}
.rec-item-author a:hover {
  color: #e13228;
}
.import-con {
  position: absolute;
  width: 120px;
  height: 110px;
  box-shadow: 0px 0px 20px 2px #d2d2d2;
  border: 1px solid #f2f2f2;
  background: #fff;
  left: 82px;
  top: 46px;
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

.download-vip-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("~static/images/icon_vip2.svg") no-repeat;
  vertical-align: -5px;
  margin-left: 5px;
}
</style>