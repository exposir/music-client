<template>
<transition name="msgbox-fade">
  <div class="shareMask" v-if="shareMask">
      <div class="modal" v-if="shareModals">
        <i class="el-message-box__close" @click="closeMsgBox"></i>
        <h2 class="share-title">请选择分享方式</h2>
        <ul class="shareBox">
          <li @click="qrcode">
              <a href="javascript:;"></a>
              <i class="twx"></i>
              <p>微信</p>
          </li>
          <li @click="shareType('sina')">
            <a href="javascript:;"></a>
            <i class="tsina"></i>
            <p>新浪微博</p>
          </li>
          <li @click="shareType('qq')">
              <a href="javascript:;"></a>
              <i class="tqq"></i>
              <p>QQ好友</p>
          </li>
          <li @click="shareType('qqzone')">
              <a href="javascript:;"></a>
              <i class="tqqzon"></i>
              <p>QQ空间</p>
          </li>                    
          <li @click="shareType('copy')">
              <a href="javascript:;"></a>
              <i class="tcopy"></i>
              <p>复制链接</p>
          </li>
          
        </ul>
      </div>
      <transition name="msgbox-fade">
      <div id="qrcode" v-show="showQrcode">
        <i class="el-message-box__close" @click="closeMsgBox"></i>
        <p>打开微信，扫一扫即可打开网页</p>
      </div>
      </transition>
  </div>
  </transition>
</template>
<script>
import {
    mapGetters,
    mapActions
} from 'vuex'

import Qrcode from 'qrcodejs2'

const {
        clipboard,
        shell
      } = require('electron')

export default {
  data() {
    return {
      shareMask:false,
      shareData:null,
      qrcodes:'12345',
      shareModals:true,
      showQrcode:false
    }
  },
  name:'share',
  mounted () {
    let self = this;
    eventBus.$on('shareModal',function(msg){
      self.shareData = msg
      self.shareMask = msg.isShow     
    })

  },
  methods: {
    closeMsgBox() {
      this.shareMask = false
      this.shareModals = true
      this.showQrcode = false
    },
    shareType(type) {
      let shareSerh = '?url='+this.shareData.url+'&title=' +this.shareData.title+'（来自@千千音乐）&desc=' + this.shareData.title+'（来自@千千音乐）&pic='+this.shareData.pic+'&pics='+this.shareData.pic+'&site=千千音乐'
      let shareSerhnew = '?url='+this.shareData.url+'&title=' +this.shareData.title+'（来自@千千音乐官微）' +this.shareData.url+'&desc=' + this.shareData.title+'（来自@千千音乐官微）&pic='+this.shareData.pic+'&pics='+this.shareData.pic+'&site=千千音乐'
      let sina = 'http://service.weibo.com/share/share.php?appkey=3156384834'
      let qqzone = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey'
      let qq = 'https://connect.qq.com/widget/shareqq/index.html'
      this.shareMask = false
      if(type == 'sina') {
        shell.openExternal(sina+shareSerhnew)
      }else if(type == 'qqzone') {
        shell.openExternal(qqzone+shareSerh)
      }else if(type == 'copy') {
        clipboard.writeText(this.shareData.url)
        this.commonFuns.createTips('链接复制成功', 'success')
      }else if(type == 'qq') {
        shell.openExternal(qq+shareSerh)
      }
      
    },
    qrcode () {
      let self = this
      this.shareModals = false
      this.showQrcode = true
      let qrcodejs = new Qrcode('qrcode',{
        width:150,
        height:150,
        text:self.shareData.url,
        background:'#fff'
      })     
    }
  }
}
</script>
<style scoped>
  .shareMask{
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 66666;
  }
  .modal{
    width: 430px;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, .2);
    user-select: none;
    border-radius: 6px;
    background: #fff;
    text-align: left;
    font-size: 16px;
    overflow: hidden;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    height: 263px;
    position: absolute;
    left: 50%;
    margin-left: -157px;
    top: 30%;
  }
  .el-message-box__close {
        position: absolute;
        width: 15px;
        height: 15px;
        background: url('~static/images/topBar/icon_close.svg') no-repeat;
        right: 12px;
        top: 12px;
        z-index: 3000;
        opacity: 0.7;
    }
    .el-message-box__close:hover {
        opacity: 1;
        cursor: pointer;
    }
    .share-title{
      font-weight: normal;
      color: #515151;
      font-size: 14px;
      margin: 20px 0;
      text-align: center;
    }
    .shareBox {
      padding: 0 0px;
    }
    .shareBox::after {
      content: "";
      display: block;
      clear: both;

    }
    .shareBox li{
      float: left;
      width: 60px;
      margin-left: 70px;
      position: relative;
      margin-bottom: 12px;
      text-align: center;
    }
    .shareBox li:nth-child(3n+1) {
      margin-left: 50px;
    }
    .shareBox li a{
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    i{
      display: inline-block;
      width: 60px;
      height: 60px;
      
    }
    .tsina{
      background: url(../../common/images/sina.png) no-repeat 0 0;
    }
    .tqqzon{
      background: url(../../common/images/qqzon.png) no-repeat 0 0;
    }
    .twx{
      background: url(../../common/images/wx.png) no-repeat 0 0;
    }
    .tcopy{
      background: url(../../common/images/copy.png) no-repeat 0 0;
    }
    .tqq{
      background: url(../../common/images/qq.png) no-repeat 0 0;
    }
    .shareBox p{
      color: #515151;
      font-size: 14px;
    }
    #qrcode {
      position: absolute;
      left: 50%;
      top: 30%;
      width: 260px;
      height: 260px;
      margin-left: -130px;
      text-align: center;
      box-sizing: border-box;
      background: #fff;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, .2);
      border-radius: 6px;
      padding-left: 55px;
      box-sizing: border-box;
      padding-top: 60px;
    }
    #qrcode p{
      width: 100%;
      color: #515151;
      font-size: 14px;
      text-align: center;
      position: absolute;
      left: 0;
      top: 0;
      height: 60px;
      line-height: 60px;
    }
    .wx__close {
      position: absolute;
      right: 5px;
      top: 5px;
      width: 20px;
      height: 20px;
      text-align: center;
      line-height: 20px;
      font-size: 20px;
    }
    .wx__close a{
      display: block;
      width: 100%;
      height: 100%;
    }
</style>


