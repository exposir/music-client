<template>
 <transition  v-on:enter="enter" v-on:leave="leave"> 
    <div class="userinfo-pop-wrapper"  id="userInfoPop"  v-show="loginStatus && isShowPop">
        <div class="triangle-left"></div>
        <div v-if="loginUserInfo && loginUserInfo.flag!=200" class="userinfo-pop-wrapper-vip pr">
            <span class="userinfo-pop-wrapper-vip-img">
                <img src="static/images/user/vip_center.svg" alt="">
            </span>
            <div class="userinfo-pop-wrapper-vip-wrap">
                <span class="userinfo-pop-wrapper-vip-center" @click="jumpVipCenter">会员中心</span>
                <span class="userinfo-pop-wrapper-vip-kt">立即开通，畅享高品质音乐</span>
            </div>
            <div class="right-btn" @click="jumpVipCenter">
                <img src="static/images/user/right_btn.png" alt="">
            </div>
        </div>
        <div v-else class="userinfo-pop-wrapper-vip pr">
            <span class="userinfo-pop-wrapper-isvip-img">
                <img src="static/images/user/vip_center.svg" alt="">
            </span>
            <div class="userinfo-pop-wrapper-isvip-wrap">
                <span class="userinfo-pop-wrapper-isvip-center" @click="jumpVipCenter">会员中心</span>
                <span class="userinfo-pop-wrapper-vip-time">{{loginUserInfo.vip_info.end_time | format_time }}到期</span>
            </div>
        </div>
        <div class="userinfo-pop-wrapper-personal pr">
            <span class="userinfo-pop-wrapper-personal-img">
                <img src="static/images/user/personal.svg" alt="">
            </span>
            <div class="userinfo-pop-wrapper-personal-wrap">
                <span class="userinfo-pop-wrapper-personal-center" @click="jumpPerson()">个人资料修改</span>
            </div>
            <div class="right-btn" @click="jumpPerson()">
                <img src="static/images/user/right_btn.png" alt="">
            </div>
        </div>
        <div class="userinfo-pop-wrapper-setup pr">
            <span class="userinfo-pop-wrapper-setup-img">
                <img src="static/images/user/setup.svg" alt="">
            </span>
            <div class="userinfo-pop-wrapper-setup-wrap">
                <span class="userinfo-pop-wrapper-setup-center" @click="jumpUserCenter()">账号安全设置</span>
            </div>
            <div class="right-btn" @click="jumpUserCenter()">
                <img src="static/images/user/right_btn.png" alt="">
            </div>
        </div>
        <div class="userinfo-pop-bottom" @click="logout()">
            退出登录
        </div>
    </div>
</transition>
</template>
<script>
    import ButtonItem from 'components/button/button-item'
    import Velocity from 'velocity-animate'
    import VelocityUI from 'velocity-animate/velocity.ui.js'
    import agreeService from 'service/agreeService'
    import getTokenService from 'service/getTokenService'

    const {
        shell,
        ipcRenderer
    } = require('electron')
    import {
        mapGetters
    } from 'vuex'
    export default {
        data() {
            return {
                isShowCancelbtn: false
            };
        },
        computed: mapGetters({
            loginStatus: 'loginStatus',
            isShowPop: 'is_show_user_pop',
            loginUserInfo: 'loginUserInfo',
            payAutoInfo: 'payAutoInfo'
        }),
        components: {
            ButtonItem
        },
        watch: {
            payAutoInfo: function() {
                if(this.payAutoInfo.error_message == 'user not sign'){
                    this.isShowCancelbtn = false;
                }else {
                    this.isShowCancelbtn = true;
                }
            }
        },
        mounted() {
            document.body.addEventListener('click', this.clickEventListener);

            document.querySelector('#userInfoPop').addEventListener('click', this.uerInfoPopEventListener);
            
        },
        // beforeDestroy() {
        //     document.body.removeEventListener('click', this.clickEventListener);

        //     document.querySelector('#userInfoPop').removeEventListener('click', this.uerInfoPopEventListener);
        // },
        filters: {
            format_time: (value) => {
                if (value) {
                    var date = new Date(parseInt(value) * 1000);
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    var day = date.getDate();
                    return year + "-" + month + "-" + day;
                }
            }
        },
        methods: {
            clickEventListener(event) {
                event.stopPropagation()
                if (!event.target.classList.contains('login-uname') &&
                    !event.target.classList.contains('login-avatar-img')) {
                    this.$store.dispatch('setShowLoginUserPop', false)
                }
            },
            uerInfoPopEventListener(event) {
                event.stopPropagation()
                this.$store.dispatch('setShowLoginUserPop', true)
            },
            jumpVipCenter() {
                // let url = 'http://music.taihe.com/vip/payment/cloud?type=up&level=comm&pst=pay_plaza'
                // shell.openExternal(url)
                // this.MessageBox.bdpay({type: 'vip'})
                // this.$store.dispatch('setShowLoginUserPop', false)
                let url = 'http://music.taihe.com/vip/'
                shell.openExternal(url)
                this.$nextTick(()=>{
                    this.$store.dispatch('setShowLoginUserPop', false);
                })  
            },
            jumpUserCenter() {
                // 百度的地址：https://passport.baidu.com/center
                let token_ = '';
                let _self = this;
                getTokenService.getTokenInfo({}, function (jsonData) {
                    console.log(jsonData);
                    if(jsonData.error_msg == "ok" && jsonData.data){
                        token_ = jsonData.data.token;
                        let gotoUrl = 'http://passport.taihe.com/v2/web/settings.html?tpl=baidu_music';
                        let url = 'http://passport.taihe.com/v2/web/clientJump.html?tpl=baidu_music&token_='+token_+'&u='+gotoUrl;
                        shell.openExternal(url)
                        _self.$store.dispatch('setShowLoginUserPop', false)
                    }
                }, function (err) {
                    console.log(err);
                });
                
            },
            jumpPerson() {
                this.$nextTick(()=>{
                    this.$store.dispatch('setShowLoginUserPop', false);
                })              
                this.$router.push('/editPerson');
            },
            logout() {
                TPASS.logout({})
                ipcRenderer.send('asynchronous-message', 'logout');
                this.$store.dispatch('logout')
                let paths = this.$route.path
                if (paths.indexOf('self') > -1 || paths.indexOf('/my/favorite/singer/') > -1 || paths.indexOf('editPerson') > -1) {
                    this.$router.push('/recommend');
                }

                this.$store.dispatch('setShowLoginUserPop', false)
            },
            enter(el, done) {
                Velocity(el, 'transition.slideDownIn', {
                    duration: 500
                }, {
                    complete: done
                })
            },
            leave(el, done) {
                Velocity(el, 'transition.slideUpOut', {
                    duration: 500
                }, {
                    complete: done
                })
            },
            // 取消连续包月
            async cancleAutopay(){
                let data = {
                    'sign_scene': 'vip',
                    'pay_type':1
                }
                let result = await agreeService.withholdDisagree(data);
                if(result.error_code == 22000) {
                    this.commonFuns.createTips('解除成功', 'success');
                    this.isShowCancelbtn = false;
                }
            }
        }

    }
</script>
<style scoped>
    .pr {
        position: relative;
    }
    .userinfo-pop-wrapper {
        width: 230px;
        padding-top: 27px;
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, .2);
        position: absolute;
        top: 8px;
        left: 10px;
        background: #fff;
        z-index: 3000;
        border-radius: 8px;
    }
    .userinfo-pop-wrapper-vip, .userinfo-pop-wrapper-setup {
        padding: 0 20px;
    }
    .userinfo-pop-wrapper-personal {
        padding: 0 20px 0 22px;
    }
    .userinfo-pop-wrapper-vip-img {
        width: 16px;
        height: 14px;
        /* background: url('~/static/images/user/vip_center.svg'); */
        display: inline-block;
        position: relative;
        top: -16px;
    }
    .userinfo-pop-wrapper-vip-img img {
        width: 16px;
        height: 14px;
        position: absolute;
    }
    .userinfo-pop-wrapper-isvip-img {
        width: 14px;
        height: 14px;
        /* background: url('~/static/images/user/vip_center.svg'); */
        display: inline-block;
        position: relative;
        top: 2px;
    }
    .userinfo-pop-wrapper-isvip-img img {
        width: 14px;
        height: 14px;
        position: absolute;
    }
    .userinfo-pop-wrapper-vip-wrap {
        display: inline-block;
        height: 54px;
        width: 154px;
        margin-left: 10px;
    }
    .userinfo-pop-wrapper-isvip-wrap {
        display: inline-block;
        height: 36px;
        margin-left: 10px;
    }
    .userinfo-pop-wrapper-vip-center {
        display: inline-block;
        width: 154px;
        font-size: 14px;
        color: #333333;
        cursor: pointer;
    }
    .userinfo-pop-wrapper-isvip-center {
        display: inline-block;
        width: 64px;
        font-size: 14px;
        cursor: pointer;
        color: #333333;
    }
    .userinfo-pop-wrapper-vip-time {
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        color: #999999;
    }
    .userinfo-pop-wrapper-vip-kt {
        margin-top: 10px;
        font-size: 11px;
        color: #999999;
    }
    .userinfo-pop-wrapper-personal-img {
        width: 14px;
        height: 14px;
        /* background: url('~/static/images/user/personal.svg') no-repeat; */
        display: inline-block;
        position: relative;
        top: 2px;
        margin-left: -2px;
        /* top: -16px; */
    }
    .userinfo-pop-wrapper-personal-img img {
        width: 14px;
        height: 14px;
        position: absolute;
    }
    .userinfo-pop-wrapper-personal-wrap {
        display: inline-block;
        height: 35px;
        width: 154px;
        margin-left: 10px;
    }
    .userinfo-pop-wrapper-personal-center {
        display: inline-block;
        width: 154px;
        font-size: 14px;
        color: #333333;
        cursor: pointer;
    }
    .userinfo-pop-wrapper-setup-img {
        width: 14px;
        height: 14px;
        display: inline-block;
        position: relative;
        top: 2px;
        /* top: -16px; */
    }
    .userinfo-pop-wrapper-setup-img img {
        width: 14px;
        height: 14px;
        position: absolute;
    }
    .userinfo-pop-wrapper-setup-wrap {
        display: inline-block;
        height: 43px;
        width: 154px;
        margin-left: 10px;
    }
    .userinfo-pop-wrapper-setup-center {
        display: inline-block;
        width: 154px;
        font-size: 14px;
        color: #333333;
        cursor: pointer;
    }
    .userinfo-pop-bottom {
        height: 41px;
        border-top: 1px solid #f1f1f1;
        line-height: 41px;
        font-size: 14px;
        color: #333333;
        text-align: center;
        cursor: pointer;
    }
    .right-btn {
        height: 11px;
        width: 7px;
        /* background: url('~/static/images/user/right_btn.png') no-repeat; */
        position: absolute;
        top: 5px;
        right: 20px;
        cursor: pointer;
    }
    .right-btn img {
        height: 11px;
        width: 7px;
        position: absolute;
    }
    .triangle-left {
        width: 0;
        height: 0;
        border: solid 8px #fff;
        border-left: solid 8px transparent;
        border-right: solid 8px transparent;
        border-top: none;
        position: absolute;
        top: -8px;
        right: 110px;
    }
</style>