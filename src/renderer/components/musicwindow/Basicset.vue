<template>
	<div id="BasicSet">
        <div class="BasicSet_leftWrap">
            <!-- 用户登录 -->
            <user-info v-if="loginStatus"></user-info>
            <nologin v-else></nologin>
        </div>
        <div class="BasicSet_rightWrap">
            <!-- 前进后退按钮 -->
            <div class="BasicSet_rightWrap_lr">
                <a class="BasicSet_rightWrap_lr_btn BasicSet_rightWrap_lr_backward" :class="{'disbaled':cannotGoback}" @click="backward"></a>
                <a class="BasicSet_rightWrap_lr_btn BasicSet_rightWrap_lr_forward" :class="{'disbaled':cannotGoforward}" @click="forward"></a>
            </div>
            <!-- 搜索框 -->
            <search-panel></search-panel>
            <!-- 右侧菜单 -->
            <div class="BasicSet_rightWrap_icon">
                <router-link :to="'/setup'" title="设置" class="BasicSet_rightWrap_icon_common BasicSet_rightWrap_icon_setup"></router-link>
                <i title="mini模式" class="BasicSet_rightWrap_icon_common BasicSet_rightWrap_icon_mini" @click="miniMode"></i>
                <i title="最小化" class="BasicSet_rightWrap_icon_common BasicSet_rightWrap_icon_small" @click="min"></i>
                <i title="最大化" class="BasicSet_rightWrap_icon_common BasicSet_rightWrap_icon_enlarge" @click="fullscreen"></i>
                <i title="关闭" class="BasicSet_rightWrap_icon_common BasicSet_rightWrap_icon_close" @click="close"></i>
            </div>
        </div>
	</div>
</template>
<script>
    import searchPanel from 'components/search/search-panel'
    import userInfo from "components/user/userInfo.vue";
    import nologin from "components/user/nologin.vue";
    import {
        mapGetters
    } from 'vuex'
    const {
        shell,
        ipcRenderer
    } = require('electron');
    export default {
        name: 'BasicSet',
        data() {
            return {
                msg: '基础设置',
                keyword: "",
                now: -1,
                cannotGoback: false,
                cannotGoforward: false,
                maximize: false
            }
        },
        watch: {
            '$route' (to, from) { //记录路径 判断是否cangoback
                this.cannotGoback = false
                this.cannotGoforward = false
                ipcRenderer.send('asynchronous-message', 'can-goback')
                ipcRenderer.send('asynchronous-message', 'can-goforward')
            }
        },
        computed: {
            ...mapGetters({
                loginUserInfo: 'loginUserInfo',
                loginStatus: 'loginStatus',
                closeMode: 'closeMode'
            })
        },
        created() {
            if (!window.navigator.onLine) {
                this.$store.dispatch("setLoginStatus", {
                    loginStatus: false
                });
            }
            this.asyMessage()
            this.$store.dispatch('getLoginUserInfo')
            //接受主进程消息
            ipcRenderer.on('asynchronous-reply', (event, arg) => {
                if (arg === 'maximize_main_window') {
                    this.maximize = true;
                } else if (arg === 'unmaximize_main_window') {
                    this.maximize = false;
                } else if (arg === 'shortcut_minimode') {
                    eventBus.$emit('isMiniMode',true)
                    ipcRenderer.send('asynchronous-message', 'mini-window')
                }
            })
        },
        mounted() {
            ipcRenderer.send('component-ready', 'Basicset.vue is ready')
        },
        methods: {
            backward() {
                if (!this.cannotGoback) {
                    this.$router.go(-1) //退一步
                    ipcRenderer.send('asynchronous-message', 'can-goback')
                }
            },
            forward() {
                if (!this.cannotGoforward) {
                    this.$router.go(1) //退一步
                    ipcRenderer.send('asynchronous-message', 'can-goforward')
                }
            },
            close() {
                if (this.closeMode == '0') {
                    ipcRenderer.send('asynchronous-message', 'close_to_tray');
                } else {
                    ipcRenderer.send('asynchronous-message', 'close_main_window');
                } 
            },
            min() {
                ipcRenderer.send('asynchronous-message', 'minimize_main_window');
            },
            fullscreen() {
                if(this.maximize) {
                    ipcRenderer.send('asynchronous-message', 're_maximize_main_window');
                }else{
                    ipcRenderer.send('asynchronous-message', 'maximize_main_window');
                }
            },
            open(url) {
                shell.openExternal(url);
            },
            asyMessage() {
                ipcRenderer.send('asynchronous-message', 'can-goback')
                ipcRenderer.send('asynchronous-message', 'can-goforward')
                let me = this
                ipcRenderer.on('asynchronous-reply', (event, arg) => {
                    if (arg === 'cannot-goback') {
                        me.cannotGoback = true
                    } else if (arg === 'cannot-goforward') {
                        me.cannotGoforward = true
                    } else if (arg === 'go-setup') {
                        this.$router.push('/setup');
                    } else if (arg === 'login-success') {
                        let me = this
                        TPASS.close()
                        me.$store.dispatch('login')
                    }
                })
            },
            miniMode() {
                eventBus.$emit('isMiniMode',true)
                ipcRenderer.send('asynchronous-message', 'mini-window')
            }
        },
        components: {
            searchPanel,
            userInfo,
            nologin
        }
    }
</script>
<style>
    #BasicSet {
        height: 56px;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 2000;
        -webkit-app-region: drag;
        background-color: rgba(255,255,255,0.9);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .BasicSet_leftWrap {
        width: 161px;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .BasicSet_rightWrap_lr {
        width: 44px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .BasicSet_rightWrap_lr_btn {
        width: 13px;
        height: 16px;
        display: inline-block;
        -webkit-app-region: no-drag;
    }
    .BasicSet_rightWrap_lr_backward {
        background: url('~static/images/topBar/back_normal.svg') no-repeat;
        -webkit-app-region: no-drag;
    }
    .BasicSet_rightWrap_lr_backward:not(.disbaled):hover {
        background: url('~static/images/topBar/back_press.svg') no-repeat;
    }
    .BasicSet_rightWrap_lr_forward {
        background: url('~static/images/topBar/forward_normal.svg') no-repeat;
        -webkit-app-region: no-drag;
    }
    .BasicSet_rightWrap_lr_forward:not(.disbaled):hover {
        background: url('~static/images/topBar/forward_press.svg') no-repeat;
    }
    .BasicSet_rightWrap_lr_btn.disbaled {
        opacity: 0.6;
        cursor: default;
    }
    .BasicSet_rightWrap {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 28px;
    }
    .BasicSet_rightWrap_icon {
        width: 162px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .BasicSet_rightWrap_icon_common {
        cursor: pointer;
        -webkit-app-region: no-drag;
        opacity: 0.7;
    }
    .BasicSet_rightWrap_icon_common:hover {
        opacity: 1;
    }
    .BasicSet_rightWrap_icon_setup {
        background: url('~static/images/topBar/icon_setting.svg') no-repeat;
        width: 19px;
        height: 19px;
    }
    .BasicSet_rightWrap_icon_mini {
        background: url('~static/images/topBar/icon_mini.svg') no-repeat;
        width: 15px;
        height: 15px;
        opacity: 0.6;
    }
    .BasicSet_rightWrap_icon_small {
        background: url('~static/images/topBar/icon_small.svg') no-repeat;
        width: 13px;
        height: 13px;
        background-position-y: 50%;
    }
    .BasicSet_rightWrap_icon_enlarge {
        background: url('~static/images/topBar/icon_enlarge.svg') no-repeat;
        width: 17px;
        height: 14px;
    }
    .BasicSet_rightWrap_icon_close {
        background: url('~static/images/topBar/icon_close.svg') no-repeat;
        width: 15px;
        height: 15px;
    }
</style>