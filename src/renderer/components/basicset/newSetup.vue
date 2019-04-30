<template>
    <div id="setup" class="setupbox">
        <h2 class="setup_title">设置</h2>
        <div class="setup_content">
            <div class="setup_content_left">
                <div v-for="(item,index) in titleCollect" @click="changeSelect(index)" class="setup_content_left_common" :class="{'isActive': isActive == index}"><span>{{item}}</span></div>
            </div>
            <div class="test"></div>
            <div class="setup_content_right">
                <div class="getTotalHeight">
                    <!-- 常规设置 -->
                    <div class="setup_content_right_0 m60">
                        <h2 class="setup_content_right_title">常规设置</h2>
                        <div class="setup_content_right_secondbottom">
                            <h3 class="setup_content_right_second_title">启动</h3>
                            <div class="setup_content_right_detail">
                                <input type="checkbox" id="startPlay" v-model="istartPlay" :class="{checked:istartPlay}"><label for="startPlay">启动时自动播放歌曲</label>
                            </div>
                            <!--<h3 class="setup_content_right_second_title">播放</h3>
                            <div class="setup_content_right_detail">
                                <input type="checkbox" id="setDefault" v-model="isDefaultPlayer" :class="{checked:isDefaultPlayer}"><label for="setDefault">将千千音乐设为默认播放器</label>
                            </div>-->
                            <h3 class="setup_content_right_second_title">点击关闭主面板</h3>
                            <div class="setup_content_right_detail">
                                <input class="closeFunc" type="radio" v-model="closeToWhere" value="0">最小化至托盘，不退出
                                <input class="closeFunc m80" type="radio" v-model="closeToWhere" value="1">退出程序
                            </div>
                        </div>
                    </div>
                    <!-- 下载设置 -->
                    <div class="setup_content_right_1 m60">
                        <h2 class="setup_content_right_title">下载设置</h2>
                        <div class="setup_content_right_secondbottom">
                            <h3 class="setup_content_right_second_title">下载目录<span>(默认将下载的音乐保存在次文件夹)</span></h3>
                            <div class="setup_content_right_detail h59">
                                <input type="text" class="savePath" v-model="downloadFolder" readonly>
                                <div>
                                    <span class="setBtn" @click="changeDownloadFolder">更改目录</span>
                                    <span class="setBtn m17" @click="openDownloadFolder">打开文件夹</span>
                                </div>
                            </div>
                        </div>
                        <!--<h3 class="setup_content_right_second_title">下载文件分类</h3>
                        <div class="setup_content_right_detail">
                            <input type="checkbox" id="setClassify"><label for="setClassify">按歌手名分文件夹</label>
                        </div>-->
                        <h3 class="setup_content_right_second_title">歌曲下载</h3>
                        <div class="setup_content_right_detail">
                            <input type="checkbox" id="setDownload" v-model="isDownloadLyricWithSong" :class="{checked:isDownloadLyricWithSong}"><label for="setDownload">同时下载歌词</label>
                        </div>
                        <h3 class="setup_content_right_second_title">缓存目录</h3>
                        <div class="setup_content_right_detail h59">
                            <input type="text" class="savePath" v-model="cacheFolder" readonly>
                            <div>
                                <span class="setBtn" @click="changeCacheFolder">更改目录</span>
                                <span class="setBtn m17" @click="openCacheFolder">打开文件夹</span>
                            </div>
                        </div>
                        <h3 class="setup_content_right_second_title">缓存空间</h3>
                        <div class="setup_content_right_detail h25 lh25 c999 df">
                            缓存最大占用空间<input type="text" class="saveCache" v-model="audioCoreCacheSize" @blur="checkCacheSize">MB(请设置600-10000之间)
                        </div>
                    </div>
                    <!-- 快捷键 -->
                    <div class="setup_content_right_2 m60">
                        <h2 class="setup_content_right_title">快捷键</h2>
                        <div class="setup_content_right_detail c333 h25">
                            <input type="checkbox" id="quickBtn" v-model="isenableGlobalShortCut" :class="{checked:isenableGlobalShortCut}"><label for="quickBtn">启动全局快捷键</label>
                            <span class="setBtn m10" @click="setDefaultShortcut">恢复默认</span>
                        </div>
                        <div class="">
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c333">功能</span>
                                <span class="quickBtn_title_right c333">快捷键</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">播放/暂停</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_playpause" class="quickBtnInput" @blur="shortCut_blur('shortcut_playpause', $event)" @focus="getOldValue('shortcut_playpause')" @keydown="shortCut_keydown('shortcut_playpause', $event)" @keyup="shortCut_keyup('shortcut_playpause', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_playpause']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">上一首</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_playprev" class="quickBtnInput" @blur="shortCut_blur('shortcut_playprev', $event)" @focus="getOldValue('shortcut_playprev')" @keydown="shortCut_keydown('shortcut_playprev', $event)" @keyup="shortCut_keyup('shortcut_playprev', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_playprev']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">下一首</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_playnext" class="quickBtnInput" @blur="shortCut_blur('shortcut_playnext', $event)" @focus="getOldValue('shortcut_playnext')" @keydown="shortCut_keydown('shortcut_playnext', $event)" @keyup="shortCut_keyup('shortcut_playnext', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_playnext']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">音量开关</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_volume" class="quickBtnInput" @blur="shortCut_blur('shortcut_volume', $event)" @focus="getOldValue('shortcut_volume')" @keydown="shortCut_keydown('shortcut_volume', $event)" @keyup="shortCut_keyup('shortcut_volume', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_volume']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">增大音量</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_volume_up" class="quickBtnInput" @blur="shortCut_blur('shortcut_volume_up', $event)" @focus="getOldValue('shortcut_volume_up')" @keydown="shortCut_keydown('shortcut_volume_up', $event)" @keyup="shortCut_keyup('shortcut_volume_up', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_volume_up']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">减小音量</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_volume_down" class="quickBtnInput" @blur="shortCut_blur('shortcut_volume_down', $event)" @focus="getOldValue('shortcut_volume_down')" @keydown="shortCut_keydown('shortcut_volume_down', $event)" @keyup="shortCut_keyup('shortcut_volume_down', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_volume_down']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">快进</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_fast_forward" class="quickBtnInput" @blur="shortCut_blur('shortcut_fast_forward', $event)" @focus="getOldValue('shortcut_fast_forward')" @keydown="shortCut_keydown('shortcut_fast_forward', $event)" @keyup="shortCut_keyup('shortcut_fast_forward', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_fast_forward']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">快退</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_rewind" class="quickBtnInput" @blur="shortCut_blur('shortcut_rewind', $event)" @focus="getOldValue('shortcut_rewind')" @keydown="shortCut_keydown('shortcut_rewind', $event)" @keyup="shortCut_keyup('shortcut_rewind', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_rewind']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">mini模式</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_minimode" class="quickBtnInput" @blur="shortCut_blur('shortcut_minimode', $event)" @focus="getOldValue('shortcut_minimode')" @keydown="shortCut_keydown('shortcut_minimode', $event)" @keyup="shortCut_keyup('shortcut_minimode', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_minimode']">热键被占用</span>
                            </div>
                            <div class="quickBtn_title">
                                <span class="quickBtn_title_left c999">最小化/还原</span>
                                <input :disabled="!isenableGlobalShortCut" type="text" v-model="shortCut.shortcut_minimize" class="quickBtnInput" @blur="shortCut_blur('shortcut_minimize', $event)" @focus="getOldValue('shortcut_minimize')" @keydown="shortCut_keydown('shortcut_minimize', $event)" @keyup="shortCut_keyup('shortcut_minimize', $event)">
                                <span class="error-tips m17" v-if="!this.shortCut_Registered['shortcut_minimize']">热键被占用</span>
                            </div>
                        </div>
                    </div>
                    <!-- 关于千千音乐 -->
                    <div class="setup_content_right_3 m60">
                        <h2 class="setup_content_right_title">关于千千音乐</h2>
                        <div class="setup_content_right_detail c333">
                            <label class="w127">当前版本 v{{version}}</label>
                            <!--<span class="setBtn m4">检查更新</span>-->
                            <span class="setBtn m17" @click="showDialog">意见反馈</span>
                        </div>
                        <div class="setup_content_right_detail c333">
                            <a href="javascript:;" @click="openlink('http://music.taihe.com')">千千音乐官网</a>
                            <a class="m47" href="javascript:;" @click="openlink('http://music.taihe.com/download/index.html')">下载移动端，好音乐永久保存</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="dialogbox">
            <el-dialog title="意见反馈" v-model="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
                <div class="feedbackbox">
                    <textarea id="feedback_content" name="fb-content" placeholder="请在这里输入您的建议，您的支持是我们成功的最大的动力！（最多300字）" class="fb-content" v-model="fbContent" @keyup="keyupfn"></textarea>
                    <form id="uploadform" enctype="multipart/form-data" v-if="isshowUpload">
                        <div class="file-box">
                            <input name="up-img" type="file" id="up-img" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp" ref="file" @change="onFileChange">
                        </div>
                        <div class="load-btn">
                            <span>上传图片</span>
                            <img src="../../common/images/icon_load.png">
                            <div class="clear_float"></div>
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
    import channel_getter from '../../service/channel_getter.js'
    import feedbackService from 'service/feedbackService'
    import os from 'os'

    import {
        mapGetters,
        mapActions
    } from 'vuex'

    const {
        shell,
        ipcRenderer,
    } = require('electron');

    const globalShortcut = require('electron').remote.globalShortcut;
    const dialog = require('electron').remote.dialog;
    const currentWindow = require('electron').remote.getCurrentWindow()

    export default {
        computed: mapGetters({
            autoplay: 'autoplay',
            defaultPlayer: 'defaultPlayer',
            current_shortCuts: 'shortCuts',
            closeMode: 'closeMode',
            downloadFolder: 'downloadFolder',
            cacheFolder: 'cacheFolder',
            cacheSize: 'cacheSize',
            downloadLyricWithSong: 'downloadLyricWithSong',
            enableGlobalShortCut: 'enableGlobalShortCut',
            loginUserInfo: 'loginUserInfo'
        }),
        data() {
            return {
                titleCollect: ['常规设置','下载设置','快捷键','关于千千音乐'],
                isActive: 0,
                istartPlay: false, //是否自启动播放
                isDefaultPlayer: false, //是否默认播放器
                isDownloadLyricWithSong: false, //下载歌曲的同时是否下载歌词
                isenableGlobalShortCut: true,
                closeToWhere: '0', //关闭到最小化or退出程序
                audioCoreCacheSize: '1000', //缓存大小
                dialogFormVisible: false, //是否展示对话框
                version: "",
                fbContent: "",
                fbContact: "",
                isshowUpload: true,
                unbind: false, //是否解绑事件
                uploadurl: "http://upload.qianqian.com/uploadfile?appid=qianqian&restype=",
                shortCutKey: "",
                shortCutKey_old: "",
                shortCutValue: [],
                shortCut: {},
                shortCut_default: {
                    shortcut_playpause: "Ctrl+shift+X",
                    shortcut_playprev: "Ctrl+shift+L",
                    shortcut_playnext: "Ctrl+shift+R",  
                    shortcut_volume: "Ctrl+Alt+S", 
                    shortcut_volume_up: "Ctrl+shift+U",
                    shortcut_volume_down: "Ctrl+shift+D", 
                    shortcut_fast_forward: "Ctrl+Alt+F", 
                    shortcut_rewind: "Ctrl+Alt+R", 
                    shortcut_minimode: "Ctrl+shift+M", 
                    shortcut_minimize: "Ctrl+Alt+W",
                },
                shortCut_Registered: {
                    shortcut_playpause: true,
                    shortcut_playprev: true,
                    shortcut_playnext: true,  
                    shortcut_volume: true, 
                    shortcut_volume_up: true,
                    shortcut_volume_down: true, 
                    shortcut_fast_forward: true, 
                    shortcut_rewind: true, 
                    shortcut_minimode: true, 
                    shortcut_minimize: true,
                }     //是否是在中文输入法下输入的字母：keyDown时能根据event.key == Process判断，但keyUp时没有依据，所以设置了该变量
            }
        },
        created() {
            let me = this
            window.onresize = function () {
                me.changeScroll();
            }
            this.version = require('electron').remote.app.getVersion()

            ipcRenderer.on('asynchronous-reply', (event, arg) => {
                if (arg === 'show-feedbk') {
                    this.dialogFormVisible = true;
                }
            })
            
        },
        mounted() {
            this.changeScroll()
            this.resetShortcutState();
            
            this.initState();

            //监听滚动事件
            setTimeout(()=>{
                document.querySelector('.setup_content_right').addEventListener('scroll', this.handleScroll)
            },0)
        },
        watch: {
            isDefaultPlayer: function() {
                this.$store.dispatch('setDefaultPlayer', this.isDefaultPlayer?'1':'0')
            },
            istartPlay: function() {
                this.$store.dispatch('setAutoPlay', this.istartPlay?'1':'0')
            },
            closeToWhere: function() {
                this.$store.dispatch('setCloseMode', this.closeToWhere)
            },
            isDownloadLyricWithSong: function() {
                this.$store.dispatch('setDownloadLyricWithSong', this.isDownloadLyricWithSong?'1':'0')
            },
            audioCoreCacheSize: function(now, before) {
                let reg = /^[1-9][0-9]*$/
                if ( !now ) {
                    //this.audioCoreCacheSize = 600
                } else if ( !reg.test(now) ) {
                    this.audioCoreCacheSize = before
                }
                this.$store.dispatch('setCacheSize', this.audioCoreCacheSize)
            },
            isenableGlobalShortCut: function() {
                this.$store.dispatch('setShortcutState', this.isenableGlobalShortCut?'1':'0')
            }
        },
        methods: {
            initState() {
                this.isDefaultPlayer = this.defaultPlayer == '1'?true:false
                this.istartPlay = this.autoplay == '1'?true:false
                console.log('is start play: ' + this.istartPlay)
                this.isDownloadLyricWithSong = this.downloadLyricWithSong == '1'?true:false
                this.closeToWhere = this.closeMode;
                this.audioCoreCacheSize = this.cacheSize;
                this.isenableGlobalShortCut = this.enableGlobalShortCut=='1'?true:false
            },
            resetShortcutState() {
                for (let i = 0; i < this.current_shortCuts.length; i++) {
                    let item = this.current_shortCuts[i];
                    let key = item.desc;
                    this.shortCut[key] = item.accelerator_key;
                    let isRegistered = true;
                    if (item.accelerator_key.length > 4) {
                        isRegistered = globalShortcut.isRegistered(item.accelerator_key);
                    }
                    this.shortCut_Registered[key] = isRegistered;

                }
                console.log(this.shortCut);
            },
            changeDownloadFolder() {
                let me = this;
                dialog.showOpenDialog({
                    title:'选择下载目录',
                    properties: ['openDirectory']
                }, function(folders) {
                    if (folders && folders.length > 0) {
                        let folder = folders[0];
                        me.$store.dispatch('setDownloadFolder', folder)
                    }
                })
            },
            openDownloadFolder() {
                shell.showItemInFolder(this.downloadFolder);
            },
            changeCacheFolder() {
                let me = this;
                dialog.showOpenDialog({
                    title:'选择缓存目录',
                    properties: ['openDirectory']
                }, function(folders) {
                    if (folders && folders.length > 0) {
                        let folder = folders[0];
                        me.$store.dispatch('setCacheFolder', folder)
                    }
                })
            },
            openCacheFolder() {
                shell.showItemInFolder(this.cacheFolder);
            },
            setDefaultShortcut(){
                this.$store.dispatch('resetShortcutDefault');
                
                this.shortCut = Object.assign({},this.shortCut_default)
                let shortcut_data = {};
                shortcut_data.desc = 'reset_shortcut';
                console.log('reset all shortcut..........')
                ipcRenderer.send('asynchronous-message', shortcut_data); 

                this.resetShortcutState();
            },
            checkCacheSize(){
                if ( this.audioCoreCacheSize > 10000 ) {
                    this.audioCoreCacheSize = 10000
                } else if ( this.audioCoreCacheSize < 600 ) {
                    this.audioCoreCacheSize = 600
                }
                this.$store.dispatch('setCacheSize', this.audioCoreCacheSize)
            },
            getOldValue(key){
                //保留修改前的快捷键，若修改后的不符合规范则恢复旧值
                this.shortCutKey_old = this.shortCut[key]
            },
            shortCut_blur(key, event){
                //补丁：在中文输入法下，输入字母后移开焦点的情况
                if ( this.shortCut[key] && this.shortCut[key].indexOf("+") == -1 ){
                    this.$forceUpdate();
                    this.$set(this.shortCut, key, "")
                //补丁：在已有快捷键后面，用中文输入法输入字幕后，移开焦点的情况
                } else if ( this.shortCut[key].split("+").pop().length != 1 ){
                    this.$forceUpdate();
                    this.$set(this.shortCut, key, "")
                }
            },
            shortCut_keydown(key, event){
                event.preventDefault()
                // 目前只支持"Control", "Alt", "Shift"和字母的组合快捷键
                let value = event.key,
                    abledValue = ["Control", "Alt", "Shift"],
                    disabledValue = ["Tab", " ",  "Enter", "Escape", "Meta", "CapsLock", "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"],
                    trans = {
                        Control: "Ctrl+",
                        Alt: "Alt+",
                        Shift: "Shift+"
                    }
                if ( value && ( abledValue.indexOf( value ) > -1 || (/[a-z]{1}/i.test(value) && value.length == 1) ) ) {
                    if ( value.length == 1 ) {
                        value = value.toUpperCase()
                    }
                    value = trans[value] || value
                    if ( this.shortCutKey == key ) {
                        if ( this.shortCutValue.indexOf( value ) == -1 ){
                            if ( this.shortCut[key] == "" || this.shortCut[key].slice(-1) == "+" ) {
                                this.shortCutValue.push( value )
                            } else {
                                this.shortCutValue.pop()
                                this.shortCutValue.push( value )
                            }
                            
                        }
                    } else {
                        this.shortCutKey = key
                        this.shortCutValue = new Array(0)
                        this.shortCutValue.push( value )
                    }
                    this.$forceUpdate();
                    this.$set(this.shortCut, key, this.shortCutValue.join(""))
                } else if ( value == "Process" ){
                } else {

                }
            },
            modify_shortcut(key, value){
                console.log('current modify key is: ' + key + '  value is: ' + value)
                if(!key || key.length <= 0) {
                    console.log('modify key is ilegal.......');
                    return;
                }

                if (!value || value.length < 4) {
                    console.log('to be set shortcut is valid: ' + value);
                    value = '';
                }
                this.$forceUpdate();

                let shortcut_item = {}
                shortcut_item.desc = key;
                shortcut_item.accelerator_key = value;

                this.shortCut[key] = value;

                //修改设置的值
                this.$store.dispatch('modifyShortcutItem', shortcut_item)

                //通知主进程更新快捷键
                let shortcut_data = {};
                shortcut_data.desc = 'modify_shortcut';
                shortcut_data.data = shortcut_item;
                ipcRenderer.send('asynchronous-message', shortcut_data); 

                //判断快捷键是否被占用
                let isRegistered = true;
                if (value.length > 4) {
                    isRegistered = globalShortcut.isRegistered(value);
                }
                this.shortCut_Registered[key] = isRegistered;

                this.commonFuns.createTips('快捷键已保存', 'success');
            },
            shortCut_keyup(key, event){
                //去掉汉字
                this.$forceUpdate();
                this.$set(this.shortCut, key, this.shortCut[key].replace(/[\u4e00-\u9fa5]/g, ""))
                // 目前只支持"Control", "Alt", "Shift"和字母的组合快捷键
                let value = event.key,
                    abledValue = ["Control", "Alt", "Shift"],
                    disabledValue = ["Tab", " ",  "Enter", "Escape", "Meta", "CapsLock", "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"],
                    trans = {
                        Control: "Ctrl+",
                        Alt: "Alt+",
                        Shift: "Shift+"
                    }
                if ( !value ) {

                } else if ( value == "Backspace" || value == "Delete" ){
                    this.modify_shortcut(key, '');
                    this.shortCutKey = ""
                } else if ( abledValue.indexOf( value ) > -1 || (/[a-z]{1}/i.test(value) && value.length == 1) ) {
                    value = trans[value] || value
                    // 以Ctrl+、Alt+、Shift+结尾时，重置为空
                    if ( this.shortCut[key].slice(-1) == "+" || this.shortCut[key].split("+").pop().length != 1) {
                        this.modify_shortcut(key, '');
                        this.shortCutKey = ""
                        // this.$forceUpdate();
                        // this.$set(this.shortCut, key, "")
                        // this.shortCutKey = ""
                        // this.shortCut_Registered[key] = true;

                        // shortcut_item.accelerator_key = '';
                        // this.$store.dispatch('modifyShortcutItem', shortcut_item)
                        // this.commonFuns.createTips('快捷键已保存', 'success');
                    } else {
                        if ( this.shortCut[key].length == 1 ) {
                            this.$forceUpdate();
                            this.$set(this.shortCut, key, "Ctrl+shift+"+this.shortCut[key].toUpperCase())
                        }
                        let isAbled = true
                        for ( let item in this.shortCut ) {
                            if ( item != key && this.shortCut[key] == this.shortCut[item] ) {
                                this.commonFuns.createTips('与已有快捷键冲突！', 'error');
                                this.$set(this.shortCut, key, this.shortCutKey_old)
                                this.shortCutKey = ""
                                isAbled = false
                                break
                            }
                        }

                        if ( isAbled &&  this.shortCutKey_old != this.shortCut[key] ) {
                            this.modify_shortcut(key, this.shortCut[key]);
                            // let item = {};
                            // item.desc = key;
                            // item.accelerator_key = this.shortCut[key];
                            // this.$store.dispatch('modifyShortcutItem', item)
                            // let shortcut_data = {};
                            // shortcut_data.desc = 'modify_shortcut';
                            // shortcut_data.data = item;
                            // ipcRenderer.send('asynchronous-message', shortcut_data); 
                            // this.commonFuns.createTips('快捷键已保存', 'success');
                            
                            this.shortCutKey_old = this.shortCut[key]
                            this.shortCutKey = ""
                        }
                    }
                } else {
                    this.$forceUpdate();
                    this.$set(this.shortCut, key, "")
                }
                
                
            },
            changeSelect(index) {
                this.isActive = index
                let selectDom = document.querySelector(".setup_content_right_" + index)
                let scrollDom = document.querySelector(".setup_content_right");
                scrollDom.scrollTop = selectDom.offsetTop - 83
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
            showDialog() {
                this.dialogFormVisible = true
                const ret = globalShortcut.register('CmdOrCtrl+Shift+K', () => {
                    currentWindow.webContents.openDevTools({ mode: 'undocked' })
                    globalShortcut.unregister('CmdOrCtrl+Shift+K')
                })
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
                    'platform_type': '4',
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
            },
            changeScroll() {
                let myWrapperDom = document.querySelector("#mainContent");
                let _mainHeight = parseFloat(
                    this.domAction.getStyle(myWrapperDom, "height")
                );
                //标题高度
                let sectionTitleDom = document.querySelector(".setup_title");
                let _titleHeight = parseFloat(
                    this.domAction.getStyle(sectionTitleDom, "height")
                );
                let _height = parseFloat(
                    _mainHeight - _titleHeight - 2
                );
                let scrollBarBodyDom = document.querySelector(".setup_content_right");
                this.domAction.setStyle(scrollBarBodyDom, "height", _height + "px");
            },
            handleScroll(){
                let scrollHeight = document.querySelector('.setup_content_right').offsetHeight
                let temp = 390 * (scrollHeight/489)
                let scrollOffset = document.querySelector('.setup_content_right').scrollTop + 83
                if(scrollOffset >= document.querySelector('.getTotalHeight').scrollHeight - temp) {
                    this.isActive = 3
                    return
                }
                for(var i=3; i>=0; i--){
                    if(scrollOffset >= document.querySelector(".setup_content_right_" + i).offsetTop) {
                        this.isActive = i
                        return
                    }
                }
            },
        }
    }
</script>
<style scoped>
    .test {
        position: absolute;
        width: 100%;
    }
    .setupbox {
        padding: 0 17px;
    }
    .setup_title {
        height: 53px;
        line-height: 53px;
        font-size: 20px;
        font-weight: bold;
        border-bottom: 1px solid #efefef;
        letter-spacing: 3px;
        color: #333333;
    }
    .setup_content {
        display: flex;
    }
    .setup_content_left {
        flex: 1 1 140px;
    }
    .setup_content_right {
        flex: 1 1 635px;
    }
    .setup_content_left_common {
        height: 15px;
        line-height: 14px;
        margin: 30px 0 6px;
        position: relative;
    }
    .setup_content_left_common span {
        font-size: 14px;
        color: #333333;
        margin-left: 12px;
        cursor: pointer;
    }
    .isActive span {
        color: #e13228;
    }
    .isActive.setup_content_left_common:before {
        content: '';
        position: absolute;
        width: 2px;
        height: 15px;
        background: #e13228;
        top: 0;
        left: 0;
    }
    .setup_content_right {
        margin-left: 17px;
        overflow-y: auto;
    }
    .setup_content_right_title {
        height: 20px;
        line-height: 20px;
        font-size: 20px;
        color: #333333;
        font-weight: bold;
        margin: 30px 0;
    }
    .setup_content_right_second_title {
        height: 14px;
        line-height: 14px;
        font-size: 14px;
        color: #333333;
        margin-bottom: 17px;
    }
    .setup_content_right_second_title span {
        margin-left: 10px;
        color: #999999;
    }
    .setup_content_right_detail {
        height: 16px;
        line-height: 16px;
        font-size: 14px;
        color: #999999;
        margin-bottom: 29px;
    }
    .setup_content_right_detail input[type="checkbox"] {
        width: 16px;
        height: 16px;
        background: url(../../common/images/form_checkout_icon.png) no-repeat 0 0;
        background-size: auto 16px;
        -webkit-appearance: none;
        /*去除系统默认的样式*/
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        /* 点击高亮的颜色*/
        margin-right: 5px;
        margin-top: -2px;
        cursor: pointer;
    }
    .setup_content_right_detail input.checked {
        background-position: -16px 0;
    }
    .setup_content_right_detail a {
        text-decoration: underline;
    }
    .closeFunc {
        cursor: pointer;
        width: 14px;
        margin: -4px 5px 0 2px;
    }
    .m4 {
        margin-left: 4px;
    }
    .m10 {
        margin-left: 10px;
    }
    .m47 {
        margin-left: 47px;
    }
    .m60 {
        margin-bottom: 60px;
    }
    .m80 {
        margin-left: 80px;
    }
    .m17 {
        margin-left: 17px;
    }
    .savePath {
        height: 25px;
        width: 60%;
        border-radius: 4px;
        border: 1px solid #e6e5e5;
        padding: 0 10px;
        margin-bottom: 10px;
    }
    .h25 {
        height: 25px;
    }
    .lh25 {
        line-height: 25px;
    }
    .h59 {
        height: 59px;
    }
    .c333 {
        color: #333333;
    }
    .c999 {
        color: #999999;
    }
    .df {
        display: flex;
    }
    .w127 {
        width: 127px;
        display: inline-block;
    }
    .setBtn {
        display: inline-block;
        height: 22px;
        line-height: 22px;
        border: 1px solid #333333;
        color: #333333;
        font-size: 12px;
        padding:0 14px;
        border-radius: 22px;
        cursor: pointer;
    }
    .saveCache {
        height: 25px;
        width: 15%;
        border-radius: 4px;
        border: 1px solid #e6e5e5;
        padding: 0 10px;
        text-align:center;
        margin: 0 10px 10px;
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
        font-size: 14px;
        /*display: none;*/
    }
    .active.error-tips {
        display: inline-block;
    }
    .quickBtn_title {
        height: 25px;
        margin-bottom: 20px;
    }
    .quickBtn_title_left {
        display: inline-block;
        width: 127px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
    }
    .quickBtn_title_right {
        display: inline-block;
        width: 190px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        margin-left: 3px;
    }
    .quickBtnInput {
        display: inline-block;
        width: 188px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        margin-left: 3px;
        border: 1px solid #e6e5e5;
        border-radius: 4px;
        padding: 0 15px;
    }
</style>