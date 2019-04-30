     <template>
    <div class="list-left-con" id="mainWindowLeftBox">
        <div class="left-scroll-con">
            <!-- <user-info v-if="loginStatus"></user-info>
            <nologin v-else></nologin> -->
            <!-- 在线音乐 begin-->
            <div class="section music-online">
                <p class="level-one">音乐库</p>
                <ul>
                    <router-link to="/muwindow" tag="li" class="level-two" :class="{'active-nav':isrecommend}">发现音乐</router-link>
                    <router-link to="/privateRadio" tag="li" class="level-two" :class="{'active-nav':isPrivateRadio}" @click.native="statisticsRadio">私人电台</router-link>
                    <router-link to="/mvvideo" tag="li" class="level-two" :class="{'active-nav':isMvList}" @click.native="statisticsMV">音乐视频</router-link>
                    <!--<router-link to="/dynamic-main" tag="li" class="level-two music-dynamic" >动态</router-link>-->
                </ul>
            </div>
            <!-- 在线音乐 end-->
            <!-- 我的音乐 begin	 -->
            <div class="section music-my">
                <p class="level-one">我的音乐</p>
                <ul>
                    <router-link to="/my/history/0" tag="li" class="level-two music-tyrlist">播放历史</router-link>
                    <!--<router-link to="/my/local/0"  tag="li" class="level-two" :class="{'active-nav':isLocal}">本地和下载</router-link>-->
                    <router-link to="/my/localanddownload"  tag="li" class="level-two" :class="{'active-nav':isLocal}">本地和下载</router-link>
                    <!--<router-link to="/my/bought/" tag="li" class="level-two music-bendi">已购音乐</router-link>-->
                    <router-link to="/my/collection" tag="li" class="level-two" :class="{'active-nav':isCollection}">我的收藏</router-link>
                    <!-- <router-link to="/my/bought/" tag="li" class="level-two music-bendi">已购音乐</router-link> -->
                </ul>
            </div>
            <!-- 我的音乐 end -->
            <!-- 自建歌单 begin -->
            <div class="section music-mygedan">
                <p class="level-one" :class="{'after-close-icon':switch1,'after-open-icon':!switch1}" @click.stop="switch1=!switch1">自建歌单
                    <i class="add-gedan-icon" @click.stop="newGedan()"></i>
                </p>
                <div class="my-list" v-if="switch1">
                    <ul v-if="loginStatus">
                        <li v-show="isNewGedan">
                            <input id="newlistname" @keyup.enter="addNewList()" @keyup.stop="validateTitleLength($event)" class="newGedanInput" type="text" name="gedanName" autofocus="autofocus" maxlength="20" value="">
                        </li>
                        <router-link  v-if="userDiyList && userDiyList.listinfo" v-for="(val,index) in userDiyList.listinfo"
                        class="level-two music-buildself"
                        :to="'/music/public/gedan/'+val.list_id+'/self'"
                        v-context="{type:'self', list_id:val.list_id, list_title:val.list_title}" 
                         :data-url="'/music/public/gedan/'+val.list_id+'/self'"
                         :data-listid="val.list_id"
                         :data-listtitle="val.list_title"
                         :key="val.list_id"
                        :title="val.list_title" tag="li" @click.native="commonFuns.crmStatistics('functionlist','selfGedan')">{{val.list_title}}</router-link>
                    </ul>
                </div>
            </div>
            <!-- 自建歌单 end -->
            <!-- 收藏 begin-->
            <div class="section music-collect">
                <p class="level-one" v-if="loginStatus" :class="{'after-close-icon':switch2,'after-open-icon':!switch2}" @click="switch2=!switch2">收藏歌单</p>
                <div v-if="switch2 && loginStatus">
                    <!-- <router-link to="/my/favorite/singer/" tag="div" class="collect-singer level-two">歌手 {{userFavoriteSingerListNum}}</router-link>
                    <div class="collect-gedan level-two" :class="{'after-close-icon':switch3,'after-open-icon':!switch3}" @click="switch3=!switch3">歌单 {{userFavoriteDiyListNum}}</div> -->
                    <div class="my-list" v-if="switch3">
                        <ul>
                            <router-link v-if="userFavoriteDiyList && userFavoriteDiyList.listinfo" v-for="(val,index) in userFavoriteDiyList.listinfo"  
                            :to="'/music/public/gedan/'+val.list_id+'/online/favour'" class="level-two music-buildself"
                             v-context="{type:'online', list_id:val.list_id, list_title:val.list_title}" 
                              :data-url="'/music/public/gedan/'+val.list_id+'/online/favour'"
                              :data-listid="val.list_id"
                              :data-listtitle="val.list_title"
                              :key="val.list_id"
                             tag="li" :title="val.list_title" @click.native="commonFuns.crmStatistics('functionlist','collectionGedan')">{{val.list_title}}</router-link>
                        </ul>
                    </div>
                    <!-- <div class="collect-album level-two" :class="{'after-close-icon':switch4,'after-open-icon':!switch4}" @click="switch4=!switch4">专辑 {{userFavoriteAlbumListNum}}</div>
                    <div class="my-list" v-if="switch4">
                        <ul>
                            <router-link v-if="userFavoriteAlbumList && userFavoriteAlbumList.listinfo" v-for="(val,index) in userFavoriteAlbumList.listinfo" 
                            :to="'/music/public/album/'+val.album_id+'/favour'" tag="li" class="level-two music-buildself"
                            :data-url="'/music/public/album/'+val.album_id+'/favour'"
                             v-context="{type:'album', list_id:val.album_id, list_title:val.title}" 
                             :data-listid="val.album_id"
                             :data-listtitle="val.title"
                            :title="val.title">{{val.title}}</router-link>
                        </ul>
                    </div> -->
                </div>
                <div class="collect-tips" v-if="!loginStatus">
                    <i class="collect-icon"></i>
                    <p>碰到喜欢的内容
                        <br>收藏一下就不会丢失啦</p>
                </div>
            </div>
            <!-- 收藏 end-->
        </div>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import userInfo from "components/user/userInfo.vue";
import nologin from "components/user/nologin.vue";
import onContextMenu from "directives/contextMenu";
import reportService from '../../service/reportService';
const { shell } = require("electron");
const ipc = require('electron').ipcRenderer;


export default {
  name: "left-nav-bar",
  props: {
    isrecommend: Boolean,
    isLocal: Boolean,
    isMvList: Boolean,
    isCollection: Boolean,
    isPrivateRadio: Boolean
  },
  computed: {
    ...mapGetters({
      userDiyList: "userDiyList",
      userFavoriteSingerList: "userFavoriteSingerList",
      userFavoriteDiyList: "userFavoriteDiyList",
      userFavoriteAlbumList: "userFavoriteAlbumList",
      loginStatus: "loginStatus",
      loginUserInfo: "loginUserInfo"
    }),
    userFavoriteSingerListNum() {
      if (
        this.userFavoriteSingerList.listinfo &&
        Array.isArray(this.userFavoriteSingerList.listinfo)
      ) {
        return this.userFavoriteSingerList.listinfo.length;
      } else {
        return "0";
      }
    },
    userFavoriteDiyListNum() {
      if (
        this.userFavoriteDiyList.listinfo &&
        Array.isArray(this.userFavoriteDiyList.listinfo)
      ) {
        return this.userFavoriteDiyList.listinfo.length;
      } else {
        return "0";
      }
    },
    userFavoriteAlbumListNum() {
      if (
        this.userFavoriteAlbumList.listinfo &&
        Array.isArray(this.userFavoriteAlbumList.listinfo)
      ) {
        return this.userFavoriteAlbumList.listinfo.length;
      } else {
        return "0";
      }
    },
    // userDownloadingNum() {
    //   let num = "";
    //   let len = this.downloadingItems.length;
    //   if (len >= 100) {
    //     num = "99+";
    //   } else if (len > 0 && len <= 99) {
    //     num = this.downloadingItems.length.toString();
    //   }
    //   return num;
    // }
  },
  directives: {
    context: onContextMenu
  },
  data() {
    return {
      switch1: true,
      switch2: true,
      switch3: true,
      switch4: true,
      isNewGedan: false
    };
  },
  created: function() {
    if (!window.navigator.onLine) {
      this.$store.dispatch("setLoginStatus", {
        loginStatus: false
      });
    }

    document.body.addEventListener("click", this.clickEventListener);

    if(!window._czc) {
      const script = document.createElement("script")
      script.src = "https://s13.cnzz.com/z_stat.php?id=1274119965&web_id=1274119965"
      script.language = "JavaScript"
      document.body.appendChild(script)
    }

    let me = this;
    console.log("add event listener to recv js post message");
    window.addEventListener("message",function(event) {
        console.log(JSON.stringify(event.data));
        if (event.data === "loginSuccess") {
          //第三方登录
          console.log("login success");
          TPASS.close();
          me.$store.dispatch("login");
          me.$store.dispatch("setShowLoginUserPop", false);
        } else if (event.data.name === "regLink") {
          shell.openExternal(event.data.url);
        } else if (event.data.name === "getPassword") {
          shell.openExternal(event.data.url);
        } else if (event.data.name === "upgrade") {
          shell.openExternal(event.data.url);
        } else if (event.data.name === "name") {
          shell.openExternal(event.data.url);
        } else if (event.data === "closeLoginPop") {
          TPASS.close();
        } else if (event.data.name === "protocol") {
          shell.openExternal(event.data.url);
        } else if (event.data.name === "qqserver") {
          shell.openExternal(event.data.url);
        }else if (event.data.name === "payOpenNewWin") {// 第三方告知打开新窗口--因为直接调用window.open无法修改窗口大小
          shell.openExternal(event.data.url);
        }else if (event.data.name === "paySuccessCallback") {// 打包后是file目录，有跨域：支付成功--通知bdpay去关闭窗口
          me.$store.dispatch('getLoginUserInfo');//重新获取用户信息
          window.bdpayInstance.dismiss();//关闭支付弹窗
        }
      },
      false
    );

    //自建歌单
    this.$store.dispatch("getUserDiyList", {
      source: 0,
      type: 10,
      offset: 0
    });

    //收藏的歌手
    this.$store.dispatch("getUserDiyList", {
      source: 2,
      type: 0,
      offset: 0
    });

    //收藏的歌单
    this.$store.dispatch("getUserDiyList", {
      source: 0,
      type: 0,
      offset: 0
    });

    //收藏的专辑
    this.$store.dispatch("getUserDiyList", {
      source: 1,
      type: 0,
      offset: 0
    });
  },
  beforeDestroy() {
      document.body.removeEventListener("click", this.clickEventListener);
  },
  components: {
    userInfo,
    nologin
  },
  methods: {
    clickEventListener(e) {
      if (this.isNewGedan && !e.target.classList.contains("newGedanInput")) {
        let title = document.getElementById("newlistname").value;
        if (title.length < 1) {
          this.isNewGedan = false;
        } else {
          this.addNewList();
        }
      }
    },
    newGedan() {
      if (!this.loginStatus) {
        this.$store.dispatch("TpassLogin");
      }
      if (this.isNewGedan) {
        this.isNewGedan = false;
      } else {
        //创建歌单
        this.isNewGedan = true;
      }
      this.switch1 = true;
      setTimeout(function() {
        document.getElementById("newlistname").focus();
      }, 500);
    },
    validateTitleLength() {
      let title = document.getElementById("newlistname").value;
      let isTitleValidate = this.commonFuns.getStringLength(title, 20);

      if (!isTitleValidate) {
        this.commonFuns.createTips("歌单名称不能超过20个字符", "warning");
        return false;
      }
    },
    onContextMenu(type, list_id, list_title, event) {
      let clientX = event.clientX;
      let clientY = event.clientY;
      let positionData = {
        clientX: clientX,
        clientY: clientY
      };

      let url = "/music/public/gedan/" + list_id + "/self";
      if (type == "online") {
        url = "/music/public/gedan/" + list_id + "/online";
      } else if (type == "album") {
        url = "/music/public/album/" + list_id;
      }

      this.$router.push(url);
      this.MessageBox.leftBarContext(type, list_id, list_title, positionData);
    },
    statisticsRadio() {
      reportService.clickReport({
        'type': 'click',
        'page': 'functionlist',
        'pos': 'privateRadio'
      });
    },
    statisticsMV() {
      reportService.clickReport({
        'type': 'click',
        'page': 'functionlist',
        'pos': 'mvvideo'
      });
    },
    addNewList() {
      let title = document.getElementById("newlistname").value;
      if (title.length > 20) {
        this.commonFuns.createTips("歌单名称不能超过20个字符", "warning");
        return false;
      }

      this.isNewGedan = false; //close new list input
      if (title.trim().length == 0) {
        return;
      }

      let id = "";
      let paramsJson = {
        title: title,
        isSuccess: false,
        isDone: false,
        list_id: id
      };
      this.$store.dispatch("addSonglist", paramsJson);

      let count = 0;
      let interval = setInterval(() => {
        count++;
        // console.log(JSON.stringify(paramsJson))
        if (paramsJson.isDone) {
          if (paramsJson.isSuccess) {
            let listid = paramsJson.list_id;
            this.$router.push("/music/public/gedan/" + listid + "/self");
          }
          clearInterval(interval);
        } else {
          if (count >= 10) {
            console.log("wait create new song list timeout!");
            clearInterval(interval);
          }
        }
      }, 500);
      document.getElementById("newlistname").value = "";
    }
  }
};
</script>
<style scoped>
.list-left-con {
  position: absolute;
  left: 0;
  width: 161px;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.list-left-con:hover ::-webkit-scrollbar-thumb{
  background: #cccccc;
}

.left-scroll-con {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  background: -webkit-linear-gradient(to left,#f7f7f7,#ffffff); /* Safari 5.1-6.0 */
  background: -o-linear-gradient(to left,#f7f7f7,#ffffff); /* Opera 11.1-12.0 */ 
  background: -moz-linear-gradient(to left,#f7f7f7,#ffffff); /* Firefox 3.6-15 */
  background: linear-gradient(to left,#f7f7f7,#ffffff); /* 标准语法 */
}

.left-scroll-con::-webkit-scrollbar-track {
  background: transparent;
}

.section {
  margin-bottom: 6px;
}

.level-one {
  padding-left: 10px;
  font-size: 12px;
  height: 34px;
  line-height: 34px;
  color: #999999;
  margin-right: 8px;
}

.level-two {
  width: 140px;
  height: 30px;
  line-height: 30px;
  padding-left: 28px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* border-left: 4px solid transparent; */
  font-size: 14px;
  /*transition: all .5s;*/
  cursor: pointer;
  position: relative;
  color: #333333;
  margin-right: 16px;
  padding-right: 12px;
}

.level-two:before {
  content: "";
  position: absolute;
  top: 7px;
  left: 21px;
  width: 16px;
  height: 16px;
}

/* .level-two:before {
  background: url("~static/images/leftBar/icon1.svg") no-repeat;
}

.level-two.music-mv:before {
  background: url("~static/images/leftBar/icon4.svg") no-repeat;
}

.level-two.music-tyrlist:before {
  background: url("~static/images/leftBar/icon2.svg") no-repeat;
}

.level-two.music-bendi:before {
  background: url("~static/images/leftBar/icon4.svg") no-repeat;
}

.level-two.music-down:before {
  background: url("~static/images/leftBar/icon3.svg") no-repeat;
}

.level-two.music-buildself::before {
  width: 3px;
  height: 3px;
  background: url("~static/images/leftBar/icon6.svg") no-repeat;
  margin-top: 6px;
  margin-left: 6px;
}

.level-two.music-mylike::before {
  background: url("~static/images/leftBar/icon5.svg") no-repeat;
}

.level-two.collect-singer::before {
  background: url("~static/images/leftBar/icon13.svg") no-repeat;
}

.level-two.collect-gedan::before {
  background: url("~static/images/leftBar/icon7.svg") no-repeat;
}

.level-two.collect-album::before {
  background: url("~static/images/leftBar/icon8.svg") no-repeat;
} */

.router-link-active,
.active-nav {
  /*border-left: solid 4px #22c5bd;*/
  background: rgba(225,50,40,0.05);
  /* border-radius: 3px; */
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  color: #e13228;
  /* border-left: 4px solid #e13228; */
}

.router-link-active:before,
.active-nav:before {
  width: 4px;
  height: 100%;
  background: red;
  top: 0;
  left: 0;
  border-radius: 3px;
}

/* .active-nav.level-two:before,
.router-link-active.level-two:before {
  background: url("~static/images/leftBar/icon1_1.svg") no-repeat;
}

.active-nav.level-two.music-mv:before,
.router-link-active.level-two.music-mv:before {
  background: url("~static/images/leftBar/icon4_1.svg") no-repeat;
}

.router-link-active.level-two.music-tyrlist:before {
  background: url("~static/images/leftBar/icon2_1.svg") no-repeat;
} 

.router-link-active.level-two.music-bendi:before {
  background: url("~static/images/leftBar/icon4_1.svg") no-repeat;
}

.active-nav.level-two.music-down:before,
.router-link-active.level-two.music-down:before {
  background: url("~static/images/leftBar/icon3_1.svg") no-repeat;
}

.router-link-active.level-two.music-mylike::before {
  background: url("~static/images/leftBar/icon5_1.svg") no-repeat;
}

.router-link-active.level-two.collect-singer::before {
  background: url("~static/images/leftBar/icon13_1.svg") no-repeat;
}

.router-link-active.level-two.collect-gedan::before {
  background: url("~static/images/leftBar/icon7_1.svg") no-repeat;
}

.router-link-active.level-two.collect-album::before {
  background: url("~static/images/leftBar/icon8_1.svg") no-repeat;
}

.router-link-active.level-two.music-buildself::before {
  background: url("~static/images/leftBar/icon6_1.svg") no-repeat;
} */

.after-close-icon,
.after-open-icon {
  position: relative;
  cursor: pointer;
}

.after-open-icon:after {
  content: "";
  position: absolute;
  top: 12px;
  width: 10px;
  height: 5px;
  background: url("~static/images/leftBar/icon14.svg") no-repeat;
  margin-left: 8px;
}

.after-close-icon:after {
  content: "";
  position: absolute;
  top: 12px;
  width: 10px;
  height: 5px;
  background: url("~static/images/leftBar/icon14.svg") no-repeat;
  margin-left: 8px;
  transform: rotate(180deg);
}

.level-one.after-close-icon:after,
.level-one.after-open-icon:after {
  top: 15px;
}

.level-two.after-close-icon:after,
.level-two.after-open-icon:after {
  right: 5px;
}

.add-gedan-icon {
  position: absolute;
  top: 10px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: url("~static/images/leftBar/icon10.svg") no-repeat;
}

.level-two.music-buildself.selected-detail {
  background: #e13228;
  color: #fff;
  border-radius: 3px;
}

.level-two.music-buildself.selected-detail::before {
  width: 4px;
  height: 4px;
  background: url("~static/images/leftBar/icon6_1.svg") no-repeat;
  margin-top: 6px;
}

.collect-tips .collect-icon {
}

.collect-tips p {
  text-align: center;
}

.newGedanInput {
  width: 135px;
  height: 30px;
  border: solid 1px #999999;
  margin-left: 8px;
  padding: 0 2px;
  margin-bottom: 5px;
  margin-top: 5px;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  /* background-color: #f3f6f6; */
}

::-webkit-scrollbar-track {
  border-radius: 10px;
  /* background-color: #f3f6f6; */
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: transparent;
}

</style>