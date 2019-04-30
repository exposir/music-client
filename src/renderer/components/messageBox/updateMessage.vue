<template>
    <div class="updateWrapper">
        <div class="updateMask" v-if="updateMask">
            <div class="updateHeader">
                <span class="updateHeader_title">更新提示</span>
                <button type="button" aria-label="Close" class="el-dialog__headerbtn" @click="closeMessageBox"><i class="el-dialog__close el-icon el-icon-close"></i></button>
            </div>
            <div class="updateMain">
                <span class="updateMain_title">请点击以下链接获取最新客户端：</span>
                <div class="updateMain_link">
                    <a href="javascript:;" @click="jumpToDownload">https://download.qianqian.com/channel/2/guanwang</a>
                </div>
            </div>
            <div class="updateFooter">
                <button data-v-96116bf0="" type="button" class="el-button qx-sub-btn el-button--default" @click="closeMessageBox"><span>取 消</span></button>
                <button data-v-96116bf0="" type="button" class="el-button fb-sub-btn el-button--primary" @click="jumpToDownload"><span>下 载</span></button>
            </div>
        </div>
    </div>
</template>
<script>
    const { shell } = require('electron');
    import channel_getter from '../../service/channel_getter.js'
    export default {
        name : 'update-message',
        data(){
            return {
                updateMask: false,
                payment_state: 1,
                tip_user_download: ""
            }
        },
        created(){
            let channel = channel_getter.get_app_channel();
            this.tip_user_download = this.clientConfigs.tip_user_download();
            let versionCheck = this.commonFuns.checkVersion(this.tip_user_download);
            //设置cookie，过期时间12小时
            let hasCookie = this.commonFuns.getCookies("updateMessage");
            if((channel == 'mas_app')&&(versionCheck == 'Lt')&&(hasCookie == '')){
                this.updateMask = true;
                this.commonFuns.setCookie("updateMessage", "2", "12 * 60 * 60 * 1000");
            }
        },
        methods: {
            closeMessageBox(){
                this.updateMask = false
            },
            jumpToDownload(){
                let url = 'https://download.qianqian.com/channel/2/guanwang'
                shell.openExternal(url);
            }
        }
    }
</script>
<style scoped>
    .updateMask {
        position: fixed;
        width: 50%;
        height: 30%;
        left: 50%;
        top: 30%;
        transform: translateX(-50%);
        background: #fff;
        z-index: 66666;
        border: 1px solid #d4d4d4;
    }
    .updateHeader {
        padding: 20px 20px 0;
    }
    .updateHeader_title {
        line-height: 1;
        font-size: 16px;
        font-weight: 700;
        color: #1f2d3d;
    }
    .updateMain {
        padding: 20px 20px 0;
    }
    .updateMain_title {
        font-size: 14px;
    }
    .updateMain_link {
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
        overflow: hidden;
    }
    .updateMain_link a {
        color: #e13228;
        font-size: 16px;
    }
    .updateFooter {
        padding: 30px 20px;
        float: right;
    }
    .fb-sub-btn {
        background-color: #e13228;
        border-color: #e13228;
    }
    .qx-sub-btn:hover {
        border: 1px solid #e13228;
        color: #e13228;
    }
</style>