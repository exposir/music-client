<template>
    <div class="user-info-wrapper">
        <div class="user-info-box">
            <div class="avatar">
                <img v-if="data.userpic" class="login-avatar-img" :src="data.userpic" @click="showUserInfoPop">
                <img v-else class="login-avatar-img" src="static/images/user/person.svg" @click="showUserInfoPop">
            </div>
          
            <p class="username login-uname" :title="data.username" @click="showUserInfoPop"> {{data.username}}</p>
            <p class="user-login-link" @click="logout()" v-if="clientConfigs.get_payment_state()=='0'">退出登录</p>

            <button-item v-if="data.flag==200 && clientConfigs.get_payment_state()=='1'" :btnTxt="''" :icon="'vip-icon'" :handleAction="jumpUserCenter"></button-item>
            <button-item v-if="data.flag!=200 && clientConfigs.get_payment_state()=='1'" :btnTxt="''" :icon="'not-vip-icon'" :handleAction="handleAction"></button-item>
        </div>
    </div>
</template>
<script>
import ButtonItem from "components/button/button-item";

import { mapGetters } from "vuex";
const { shell, ipcRenderer } = require("electron");

export default {
  computed: mapGetters({
    isShowPop: "is_show_user_pop",
    data: "loginUserInfo",
    loginStatus: "loginStatus"
  }),

  components: {
    ButtonItem
  },
  created() {
  },
  beforeDestroy() {},
  methods: {
    handleAction() {
      // let url = "http://music.taihe.com/vip/payment/cloud?type=up&level=comm&pst=pay_plaza";
      // shell.openExternal(url);
      this.MessageBox.bdpay({type: 'vip'})
    },
    logout() {
      TPASS.logout({});
      ipcRenderer.send("asynchronous-message", "logout");
      this.$store.dispatch("logout");
    },
    showUserInfoPop() {
      if (this.clientConfigs.get_payment_state() == "1") {
        let isShowPop;
        if (this.isShowPop) {
          isShowPop = false;
        } else {
          isShowPop = true;
        }
        this.$store.dispatch("setShowLoginUserPop", isShowPop);
      }
    },
    jumpUserCenter() {
      // let url = "https://passport.baidu.com/center";
      // let url = "http://music.taihe.com/vip/"
      // shell.openExternal(url);
      this.MessageBox.bdpay({type: 'vip'})
    }
  }
};
</script>
<style scoped>
.user-info-wrapper {
  position: absolute;
  left: 16px;
}

.user-info-box {
  max-width: 130px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 27px;
}

.avatar {
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.avatar img {
  width: 27px;
  height: 27px;
  /* border: solid 1px #f2f2f2; */
  border-radius: 50%;
}

p.username {
  /* padding: 10px 0 8px 0; */
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-app-region: no-drag;
  /* width: 100%; */
  max-width: 90px;
  margin-left: 9px;
  text-align: center;
}

.user-info-pop-box {
  position: absolute;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  width: 100px;
  height: 100px;
  z-index: 2000;
  left: 10px;
  border-radius: 10px;
}

p.user-login-link {
  padding: 10px 0 2px 0;
  cursor: pointer;
  color: #333333;
  -webkit-app-region: no-drag;
}
</style>