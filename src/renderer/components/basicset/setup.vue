<template>
    <div id="setup" class="setupbox">
        <h2 class="title-txt">设置</h2>
        <div class="setup-cont">
            <h3 class="cont-title blue-dot">播放</h3>
            <div class="detail">
                <input type="checkbox" id="startPlay" v-model="istartPlay" :class="{checked:istartPlay}"><label for="startPlay">启动时自动播放歌曲</label>
            </div>
        </div>
        <div class="setup-cont">
            <h3 class="cont-title blue-dot">关于千千音乐</h3>
            <div class="detail aboutus">
                <div class="text"><span>当前版本 v{{version}}</span><span v-show="false">更新日期 2017-03-10</span><span>官网：<a href="javascript:;" @click="openlink('http://music.taihe.com/download/index.html')">http://music.taihe.com/download/index.html</a></span></div>
                <p class="sm-font">北京音之邦文化科技有限公司版权所有</p>
            </div>
        </div>
        <div class="setup-cont">
            <h3 class="cont-title blue-dot"><span class="hasboder" @click="dialogFormVisible = true">意见反馈</span></h3>
            <div class="detail">
                <div class="text">您的反馈和意见是我们进步的动力</div>
            </div>
        </div>
        <!--测试用 btn   start -->
        <!--<div class="setup-cont"><span class="hasboder cleardatabase" @click='clearDataBase'>清除数据库</span></div>-->
        <!--测试用 btn   end -->

        <div class="dialogbox">
            <el-dialog title="意见反馈" v-model="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
                <div class="feedbackbox">
                    <textarea id="feedback_content" name="fb-content" placeholder="请在这里输入您的建议，您的支持是我们成功的最大的动力！（最多300字）" class="fb-content" v-model="fbContent" @keyup="keyupfn"></textarea>
                    <form id="uploadform" enctype="multipart/form-data" v-if="isshowUpload">
                        <div class="file-box">
                            <input name="up-img" type="file" id="up-img" accept="image/gif,image/jpeg,image/png,image/bmp" ref="file" @change="onFileChange">
                        </div>
                        <div class="load-btn">
                            <span>上传图片</span>
                            <img src="../../common/images/icon_load.png">
                            <div class="clear_float"></div>
                            <!--<img class="fileimg" :src="fileurl" v-show="false" />-->
                        </div>
                    </form>
                    <div class="fileimgbox">
                        <div :class="{'fileimg':true,'hide':isshowUpload}" id="fileimg">
                            <span class="del-icon" @click="delimg"></span>
                        </div>
                    </div>
                    
                    <input name="fb-connect" id="fb-connect" placeholder="您的联系方式（QQ\邮箱\手机均可）" autocomplete="off" class="fb-connect" v-model="fbContact">
                    <span class="tips" id="tips"></span>
                </div>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="hideDailog">取 消</el-button>
                    <el-button v-if="!unbind" type="primary" @click="submitfeedback" class="fb-sub-btn">提交</el-button>
                    <el-button v-else type="primary" class="fb-sub-btn gray">提交</el-button>
                </div>
            </el-dialog>

        </div>
    </div>
</template>
<script>
    import settings from '../../dataoperation/settings/settings.js'
    import settingKey from '../../dataoperation/settings/settingsKey.js'
    import constant from '../../constant.js'
    import database from '../../dataoperation/websql/sqlstorage.js'
    import feedbackService from 'service/feedbackService'
    import channel_getter from '../../service/channel_getter.js'

    const {
        shell,
        ipcRenderer
    } = require('electron');
    import os from 'os'
    import {
        mapGetters
    } from 'vuex'

    export default {
        name: 'setup',
        data() {
            return {
                uploadurl: "http://upload.qianqian.com/uploadfile?appid=feedback&restype=",
                istartPlay: false, //是否自启动播放
                dialogFormVisible: false, //是否展示对话框
                fbContent: "",
                fbContact: "",
                unbind: false, //是否解绑事件
                isshowUpload: true,
                fileurl: "",
                restype: "jpg",
                tips: "",
                version: ""
            }
        },
        computed: mapGetters({
            loginUserInfo: 'loginUserInfo'
        }),
        watch: {
            istartPlay: function() {
                if (this.istartPlay) {
                    settings.set_setting_value(settingKey.autoplay, 1)
                } else {
                    settings.set_setting_value(settingKey.autoplay, 0)
                }
            }
        },
        created() {
            this.istartPlay = settings.get_setting_value(settingKey.autoplay);
            let autoplay = settings.get_setting_value(settingKey.autoplay)
            if (autoplay == null || autoplay == "" || typeof autoplay == "undefined") {
                //默认启动不播放
                autoplay = '0';
            }
            if (autoplay == 1) {
                this.istartPlay = true;
            } else {
                this.istartPlay = false;
            }
            this.version = require('electron').remote.app.getVersion()

            ipcRenderer.on('asynchronous-reply', (event, arg) => {
                // console.log(arg);
                if (arg === 'show-feedbk') {
                    this.dialogFormVisible = true;
                }
            })
        },
        methods: {
            clearDataBase() {
                database.delete_songlist(constant.history_list_id);
                database.delete_songlist(constant.local_songlist_id);
                database.delete_songlist(constant.current_play_list_id);
            },
            hideDailog() {
                let tips = document.getElementById("tips");
                this.dialogFormVisible = false;
                this.fbContent = "";
                this.fbContact = "";
                this.unbind = false;
                this.fileurl = "";
                this.isshowUpload = true;
                tips.innerHTML = '';
            },
            delimg() {
                this.isshowUpload = true;
                this.fileurl = "";
            },
            onFileChange(e) {
                let vm = this;
                let size = 0;
                let files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                if (files[0].type.split("/")[1]) {
                    this.restype = files[0].type.split("/")[1];
                    size = files[0].size;
                    size = size / (1024 * 1024);
                }
                if (size > 3) {
                    this.commonFuns.createTips("图片大小不能超过3M");
                    return false;
                }

                this.createImage(files[0]);


                //上传图片
                let form = document.getElementById("uploadform");
                let formdata = new FormData(form);
                let xhr = new XMLHttpRequest();
                let tips = document.getElementById("tips");
                tips.innerHTML = '正在上传图片……';

                xhr.open("POST", this.uploadurl + this.restype);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                            let res = JSON.parse(xhr.responseText);
                            // console.log(res)
                            if (res.code == 0) {
                                vm.isshowUpload = false;
                                if (res.url) {
                                    vm.fileurl = res.url;
                                    let urlel = document.getElementById("fileimg");
                                    urlel.style.backgroundImage = "url(" + res.url + ")";
                                }
                                tips.innerHTML = '';
                            }
                        }
                    } else {
                        console.log(xhr.status);
                        tips.innerHTML = '';
                    }
                }
                xhr.send(formdata);

            },
            createImage(file) {
                let image = new Image();
                let reader = new FileReader();
                reader.onload = (e) => {
                    this.image = e.target.result;
                };
                reader.readAsDataURL(file);
            },
            submitfeedback() {
                let vm = this;
                this.unbind = true;
                //反馈考虑qianqianmini需要ip,就使用bmpc,不需要传ip
                // let apiurl = "http://musicapi.qianqian.com/v1/restserver/ting?from=bmpc&" + "method=baidu.ting.feedback.info";
                let tips = document.getElementById("tips");
                let connectType = this.getConnect(this.fbContact);
                let versions = "mac_" + this.version;
                let sys_version = os.release();
                let email = "";

                if (this.fbContent === '') {
                    tips.innerHTML = '请输入您的建议';
                    this.unbind = false;
                    return false;
                }
                if (this.fbContact == '' || connectType == 0) {
                    this.fbContact = "";
                    tips.innerHTML = '请输入正确的联系方式';
                    this.unbind = false;
                    setTimeout(function() {
                        tips.innerHTML = '';
                    }, 1000);
                    return false;
                }
                if (connectType == 1 || connectType == 2 || connectType == 3 || connectType == 4) {
                    email = this.fbContact;
                } else {
                    email = "";
                }

                let data = {
                    'feedback_detail': this.clearString(this.fbContent),
                    'pic_url': this.fileurl,
                    'contact_info': email,
                    'channel_no': channel_getter.get_app_channel(),
                    'version': versions,
                    'platform_type': '0',
                    'feedback_type': '0', 
                    'system_version': os.platform() + '_' + os.arch(),                    
                };

                if(this.loginUserInfo.userid){
                    data.user_id = this.loginUserInfo.userid;
                    data.user_name = this.loginUserInfo.username;
                }
                feedbackService.creatFeedback(data, function (jsonData) {
                    let postdata = jsonData;
                    if (postdata.error_code == 22000) {
                        vm.commonFuns.createTips("您的反馈已收到，感谢您的反馈");
                    } else if (postdata.error_code == 22011) {
                        vm.commonFuns.createTips("操作太频繁 稍后再试");
                    }
                    vm.fbContent = "";
                    vm.fbContact = "";
                    vm.unbind = false;
                    vm.fileurl = "";
                    vm.dialogFormVisible = false;
                    vm.isshowUpload = true;
                    tips.innerHTML = '';
                }, function (err) {
                    console.log(err);
                    vm.fbContent = "";
                    vm.fbContact = "";
                    vm.unbind = false;
                    vm.fileurl = "";
                    vm.dialogFormVisible = false;
                    vm.isshowUpload = true;
                    tips.innerHTML = '';
                });

            },
            keyupfn() {
                let tips = document.getElementById("tips");
                let contLen = this.fbContent.length;
                if (contLen > 288 && contLen <= 299) {
                    this.unbind = false;
                    tips.innerHTML = '<div class="suc-tips"> 还可以输入' + (300 - parseInt(contLen)) + '个字 </div>';
                }
                if (contLen == 300) {
                    this.unbind = false;
                    tips.innerHTML = '已输满300字';
                }
                if (contLen > 300) {
                    this.unbind = true;
                    tips.innerHTML = '已超出' + (parseInt(contLen) - 300) + '字';

                }
                if (contLen <= 280) {
                    this.unbind = false;
                    tips.innerHTML = '';
                }
            },
            /**
             *  验证联系方式，并返回类型
             *  @param  connectStr  用户输入的联系方式
             *  0：error, 1 电话， 2：邮箱， 3: QQ, 4: 手机
             */
            getConnect(connectStr) {
                if (connectStr.length > 24) {
                    var connectStr = connectStr.substr(0, 24);
                }
                var reg_email = /^([a-zA-Z0-9]+[_|\_|\.|\-]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                    reg_mobile = /^1[3|4|5|6|7|8|9][0-9]{1}[0-9]{8}$/,
                    reg_QQ = /^[1-9]\d{4,9}$/,
                    result = 0;
                result = reg_email.test(connectStr) ? 2 : (reg_QQ.test(connectStr) ? 3 :
                    (reg_mobile.test(connectStr) ? 4 : 0));
                return result;
            },
            openlink(url) {
                shell.openExternal(url);
            },
            // 过滤用户输入的特殊字符
            clearString(s) {
                var pattern = new RegExp("[~'!%^&<>]");
                var rs = "";
                for (var i = 0; i < s.length; i++) {
                    rs = rs + s.substr(i, 1).replace(pattern, '');
                }
                return rs;
            }
        }
    }
</script>
<style scoped>
    /*@includ url(./css/dialog.css)*/
    
    .setupbox {
        padding: 30px 38px 30px 30px;
    }
    
    .setupbox .title-txt {
        font-size: 18px;
        height: 22px;
        line-height: 22px;
        margin-bottom: 14px;
    }
    
    .setup-cont {
        border-bottom: 1px solid #e5e5e5;
        padding: 15px 0 15px 28px;
    }
    
    .setup-cont .cont-title {
        position: relative;
        margin-bottom: 10px;
        padding-left: 10px;
        font-size: 16px;
    }
    
    .setup-cont .blue-dot:before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        width: 6px;
        height: 6px;
        margin-top: -2px;
        background: #e13228;
        border-radius: 50%;
    }
    
    .detail {
        padding-left: 10px;
        font-size: 14px;
    }
    
    .detail input {
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
    
    .detail input.checked {
        background-position: -16px 0;
    }
    
    .aboutus span {
        padding-right: 25px;
        line-height: 150%;
    }
    
    .aboutus a {
        color: #e13228;
    }
    
    .aboutus .sm-font {
        font-size: 12px;
    }
    
    .hasboder {
        width: 80px;
        height: 25px;
        line-height: 25px;
        background: #fff;
        border: 1px solid #cecece;
        border-radius: 5px;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
    }
    
    .hasboder:hover {
        background: #f2f2f2;
    }
    /*弹窗*/
    
    div.v-modal {
        background: none!important;
    }
    
    .el-dialog {
        box-shadow: 0 0 14px rgba(0, 0, 0, 0.3)!important;
    }
    
    .dialog-footer {
        height: 38px;        
        display: inline-block;
    }
    /*feedback*/
    
    .feedbackbox {
        border: 1px solid #d4d4d4;
    }
    
    .uploadbox {
        text-align: right;
        padding: 10px;
    }
    
    textarea.fb-content {
        box-sizing: border-box;
        width: 100%;
        height: 90px;
        margin: 0 auto;
        padding: 10px 5px;
        margin-bottom: 0;
        overflow: auto;
        position: relative;
        font-size: 13px;
        border: none;
    }
    
    .file-box input {
        width: 82px;
        position: absolute;
        right: 22px;
        margin-top: 25px;
        cursor: pointer;
        opacity: 0;
        z-index: 99;
    }
    
    .load-btn {
        height: 35px;
        padding: 8px;
        position: relative;
        border-top: 1px solid #d4d4d4;
        border-top: 0;
    }
    
    .thumb {
        float: right;
        position: relative;
        right: 10px;
        cursor: pointer;
    }
    
    .load-btn img,
    .load-btn span {
        float: right;
        cursor: pointer;
        position: relative;
        right: 0;
        top: 20px;
    }
    
    .load-btn img {
        margin-right: 8px;
        top: 22px;
    }
    
    .load-btn span {
        color: #e13228;
        font-size: 12px;
    }
    
    .fileimgbox {
        padding: 10px;
        text-align: right;
    }
    
    .fileimg {
        position: relative;
        display: inline-block;
        width: 100px;
        height: 100px;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-size: 100% auto;
        border: 1px solid #d4d4d4;
    }
    
    .fileimg.hide {
        display: none;
    }
    
    .fileimg .del-icon {
        position: absolute;
        right: 0;
        top: 0;
        width: 15px;
        height: 15px;
        background: url(../../common/images/del_icon.png) 0 0;
        background-size: 100% auto;
        cursor: pointer;
        display: none;
    }
    
    .fileimg:hover .del-icon {
        display: block;
    }
    
    .tips {
        width: 200px;
        height: 35px;
        display: inline-block;
        float: left;
        position: relative;
        font-size: 14px;
        line-height: 35px;
        color: #ff3131;
    }
    
    .fb-connect {
        width: 100%;
        height: 18px;
        margin-top: 0;
        padding: 20px 10px;
        position: relative;
        border-top: 1px solid #d4d4d4;
        font-size: 13px;
        box-sizing: border-box;
    }
    .el-button--default:hover {
        border: 1px solid #e13228;
        color: #e13228;
    }
    .fb-sub-btn,
    .dis-fb-sub-btn {
        width: 105px;
        height: 35px;
        text-align: center;
        float: right;
        border: none;
        background: #e13228;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
    }
    
    .fb-sub-btn.gray {
        cursor: not-allowed;
        background: gray;
    }
    
    .dis-fb-sub-btn {
        background: gray;
    }
    
    .success-feed {
        margin: 0 auto;
        width: 240px;
        font-size: 16px;
        margin-top: 120px;
    }
    /*error style */
    
    .error-tips {
        color: red;
    }
    
</style>