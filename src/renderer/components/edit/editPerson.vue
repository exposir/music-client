<template>
    <div class="editPerson">
        <div class="editPerson-title-wrap">
            <span class="editPerson-title fb">个人资料修改</span>
        </div>
        <div class="editPerson-content-wrap">
            <div class="editPerson-content-name">
                <h3 class="editPerson-content-name-title f14 c3 fb"><span style="margin-right:9px;color: #e13228">*</span>昵称：</h3>
                <div class="editPerson-content-name-box pr">
                    <input type="text" class="editPerson-content-name-input t" :class="{'text-alarm':username.length > 24}" placeholder="请输入昵称" v-model="username"  ref="usercount"><br>
                    <span v-if="isEmpty" class="editPerson-content-tips c9">昵称不能为空</span>
                    <span v-if="username.length > 24" class="editPerson-content-tips c9 color-alarm">昵称需在2-24个字之间，可以包含英文字母、中文、-、_、数字</span>
                    <span v-else class="nick-text pa t c9">{{24 - username.length}}</span>
                </div>
            </div>

            <div class="editPerson-content-sex">
                <h3 class="editPerson-content-sex-title f14 c3 fb">性别：</h3>
                <div class="editPerson-content-sex-box pr">
                    <input class="input-radio" type="radio" v-model="personSex" value="1">男
                    <input class="input-radio" type="radio" v-model="personSex" value="0">女
                    <input class="input-radio" type="radio" v-model="personSex" value="2">保密
                </div>
            </div>

            <div class="editPerson-content-age">
                <h3 class="editPerson-content-age-title f14 c3 fb">年龄：</h3>
                <div class="editPerson-content-age-box pr">
                    <el-date-picker type="date" :picker-options="dataPickerOptions" v-model="selectDate" placeholder="选择日"></el-date-picker>
                </div>
            </div>

            <div class="editPerson-content-position">
                <h3 class="editPerson-content-position-title f14 c3 fb">地区：</h3>
                <div class="editPerson-content-position-box pr">
                    <area-select :level='1' type='text' v-model="areaSelect" :data="pca"></area-select>
                </div>
            </div>

            <div class="editPerson-content-tag">
                <h3 class="editPerson-content-tag-title f14 c3 fb">标签：</h3>
                <span v-for="item in finalSelectTag" class="f14 cr distance">{{item}}</span>
                <div class="editPerson-content-tag-add f12 c3" @click="openTag">添加标签</div>
            </div>

            <div class="editPerson-content-detail">
                <h3 class="editPerson-content-detail-title f14 c3 fb">介绍：</h3>
                <div class="editPerson-content-detail-content pr">
                    <textarea name="" id="" cols="30" rows="10" class="edit-desc" v-model="personDesc" :class="{'text-alarm':personDesc.length > 140}"></textarea>
                    <span v-if="personDesc.length <= 140" class="desc-text pa t c9">{{140 - personDesc.length}}</span>
                    <span v-else class="desc-text pa t c9 color-alarm">最多输入140个字</span>
                </div>
            </div>

            <dl class="editPerson-content-img pa">
                <dt>
                    <div class="editPerson-content-img-btn">
                        <img v-if="headerImage" :src="headerImage" alt="" class="editPerson-content-img-btn-preview">
                        <img v-else class="editPerson-content-img-btn-preview" src="static/images/edit/editGedan-default.png" alt="">
                        <a class="f14 t editPerson-content-img-btn-bg">更改头像<input type="file" class="" accept="image/gif,image/png,image/jpeg,image/jpg,image/bmp" @change="change" value="更改封面" id="change"></a>
                    </div>
                </dt>
                <dd class="c9 f12 new_width">
                    支持 jpg \ png \ gif 格式，建议尺寸大于500＊500，文件小于10M
                </dd>
            </dl>

            <div class="editPerson-content-btn">
                <div class="editPerson-content-btn-save" @click="saveUserInfo">保存</div>
                <div class="editPerson-content-btn-cancel" @click="editCancel">取消</div>
            </div>

            <!-- tag -->
            <div v-if="showTag">
                <div class="edit-tags-box t">
                    <div class="edit-tags-box-title f14 fb">选择分类标签<button type="button" @click="closeTag" aria-label="Close" class="el-dialog__headerbtn"><i class="el-dialog__close el-icon el-icon-close"></i></button></div>
                    <div class="edit-tags-box-content">
                        <div v-if="hasSelectTag.length > 0" class="edit-tags-class clearfix already-choose" style="display: block;margin-top: 20px">
                            <h4>已选</h4>
                            <ul>
                                <li v-for="(item, index) in hasSelectTag" class="pr">
                                    <a href="javascript:void(0)" class="t">{{item}}</a>
                                    <span class="deleteTag" @click="deleteTag(index)"></span>
                                </li>
                                <li class="f12 tag-ts">
                                    还可以选择{{3 - hasSelectTag.length}}个
                                </li>
                            </ul>
                        </div>
                        <div v-else style="height: 18px;"></div>
                        <div v-for="(item,index) in allTag" class="edit-tags-class edit-tags-basic clearfix" style="display: block;">
                            <h4>{{index}}</h4>
                            <ul>
                                <li v-for="secendItem in item">
                                    <a href="javascript:void(0)" class="t" @click="selectTag(secendItem)"  :class="_isSelectTag(secendItem)">{{secendItem}}</a> 
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="edit-tags-box-bottom">
                        <div class="edit-tags-box-bottom-save" @click="saveTags">保存</div>
                    </div>
                </div>
            </div>

            <!-- 头像弹出框 -->
            <div class="edit-img-box" v-show="showImg">
                <div class="edit-tags-box-title f14 fb">更改头像<button type="button" @click="closeImg" aria-label="Close" class="el-dialog__headerbtn"><i class="el-dialog__close el-icon el-icon-close"></i></button></div>
                <div class="edit-tags-box-content edit-img-box-content">
                    <div class="edit-img-btn pr">
                        <a href="javascript:void(0)" class="upload-btn f14">选择图片<input type="file" value="" accept="image/gif,image/png,image/jpeg,image/jpg,image/bmp"
                            @change="change" name="file" class="select-pic pa"></a>
                        <span class="f12 c9 edit-img-span">支持 jpg \ png \ gif 格式，文件小于10M, <i class="cut-control-tip">不能小于100*100</i></span>
                    </div>
                    <div class="pop-cut-img">
                        <div class="pop-cut-img-box pr fl">
                            <img id="txImage" class="pa" :src="url" alt="Picture">
                        </div>
                        <h4 class="upload-preview-text f12">预览</h4>
                        <div class="upload-img-box upload-img-box-content" id="viewDivbig">
                            <!-- <img class="upload-img" :src="url"> -->
                        </div>
                        <div class="upload-img-box-small upload-img-box-content">
                        </div>
                        <h4 class="upload-img-small f10">小尺寸封面</h4>
                    </div>
                </div>
                <div class="edit-tags-box-bottom">
                    <div class="edit-tags-box-bottom-save" @click="crop">保存</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { AreaSelect } from "vue-area-linkage";
    import AreaData from "area-data";
    import { pca, pcaa } from "area-data";
    import commonFuns from '../../components/commonFuns/common.js';
    import Cropper from 'cropperjs'

    import {
        mapGetters
    } from 'vuex'

    export default {
        data() {
            return {
                pca: pca,
                pcaa: pcaa,
                isEmpty: true,
                showTag: false,
                showImg: false,
                username: '',
                personSex: '男',
                areaSelect: [],
                selectMonth: '',
                selectYear: '',
                selectDate: '',
                personDesc: '',
                hasSelectTag: [],
                finalSelectTag: [],
                userPic: '',
                url: '',
                picValue: '',
                headerImage: '',
                usernameNem: '',
                descNem: 140,
                allTag:{
                    '语种': ["华语","欧美","粤语","日语","韩语","纯音乐","小语种"],
                    '风格': ["流行","摇滚","民谣","电子","影视原声","ACG","轻音乐","新世纪","爵士","古典","乡村","说唱","世界音乐","古风","儿歌","朋克","布鲁斯","RnB/Soul","金属","雷鬼","英伦","民族","后摇","拉丁"]      
                },
                dataPickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now() - 8.64e6
                    }
                },
                imgData: {}

            }
        },
        components: {
            AreaSelect
            
        },
        computed: mapGetters({
            loginUserInfo: 'loginUserInfo'
        }),
        mounted() {
            console.log(this.loginUserInfo)
            this.init()
            // document.body.addEventListener('click', (event) => {
            //     if(document.querySelector('.area-selectable-list-wrap').style.display == '') {
            //         document.querySelector('.area-selectable-list-wrap').style.display = 'none'
            //         area-selectable-list-wrap
            //     }
            // })
        },
        methods: {
            init() {
                this.$store.dispatch('getLoginUserInfo')
                this.username = this.loginUserInfo.username
                this.personSex = this.loginUserInfo.sex
                let province = ''
                if(this.loginUserInfo.province){
                    if(this.loginUserInfo.province == '北京' || this.loginUserInfo.province == '上海' ||this.loginUserInfo.province == '深圳') {
                        province = this.loginUserInfo.province + '市'
                    }else{
                        province = this.loginUserInfo.province
                    }
                }
                this.areaSelect.push(province)
                this.areaSelect.push(this.loginUserInfo.city)
                //获取头像
                this.headerImage = this.loginUserInfo.userpic

                // 获取当前时间
                let date = new Date(this.loginUserInfo.bth_info * 1000)
                this.selectDate = date
                
                // 获取标签
                let tempTag = this.loginUserInfo.tag?this.loginUserInfo.tag.split(','):[]
                console.log(this.loginUserInfo.tag)
                this.finalSelectTag = tempTag
                this.hasSelectTag = tempTag
                
                // 获取详情
                this.personDesc = this.loginUserInfo.desc

                this.usernameNem = 24 - this.loginUserInfo.username.length

                var self = this;
                var image = document.getElementById('txImage');
                this.cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 0,
                    background: false,
                    zoomable: false,
                    preview: ".upload-img-box-content",
                    ready: function () {
                        self.croppable = true;
                    },
                    crop(event) {
                        let x = parseInt(event.detail.x)
                        let y = parseInt(event.detail.y)
                        let h = parseInt(event.detail.height)
                        let w = parseInt(event.detail.width)

                        self.imgData.x = x<0 ? 0 : x
                        self.imgData.y = y<0 ? 0 : y
                        self.imgData.h = h<0 ? 0 : h
                        self.imgData.w = w<0 ? 0 : w
                    },
                });
            },
            openTag() {
                this.showTag = true
            },
            closeTag() {
                this.showTag = false
            },
            editCancel() {
                this.$router.back()
            },
            selectTag(secendItem) {
                console.log(typeof(this.hasSelectTag))
                if(this.hasSelectTag.length < 3) {
                    if(!this.hasSelectTag.includes(secendItem)){
                        this.hasSelectTag.push(secendItem)
                    }
                }else{
                    this.commonFuns.createTips('最多选择3个标签', 'error')
                }
            },
            deleteTag(index) {
                this.hasSelectTag.splice(index, 1)
            },
            saveTags() {
                this.finalSelectTag = this.hasSelectTag
                this.showTag = false
            },
            openImg() {
                this.showImg = true
            },
            closeImg() {
                this.showImg = false
            },
            _isSelectTag(secendItem) {
                return this.hasSelectTag.includes(secendItem)?'isSelectTag':''
            },
            change(e) {
                let files = e.target.files || e.dataTransfer.files;
                if (!files.length) return;
                this.panel = true;
                this.picValue = files[0];

                this.url = this.getObjectURL(this.picValue);
                //每次替换图片要重新得到新的url  
                if (this.cropper) {
                    this.cropper.replace(this.url);
                }
                this.showImg = true;
            },
            getObjectURL(file) {
                var url = null;
                if (window.createObjectURL != undefined) { // basic  
                    url = window.createObjectURL(file);
                } else if (window.URL != undefined) { // mozilla(firefox)  
                    url = window.URL.createObjectURL(file);
                } else if (window.webkitURL != undefined) { // webkit or chrome  
                    url = window.webkitURL.createObjectURL(file);
                }
                return url;
            },
            crop() {
                this.panel = false;
                var croppedCanvas;
                var roundedCanvas;

                if (!this.croppable) {
                    return;
                }
                // Crop  
                croppedCanvas = this.cropper.getCroppedCanvas();
                // Round  
                roundedCanvas = this.getRoundedCanvas(croppedCanvas);

                this.headerImage = roundedCanvas.toDataURL();
                // this.postImg()  
                this.showImg = false
            },
            postImg() {
                document.getElementById('saveLocalImg').setAttribute("href", this.headerImage)
                document.getElementById('saveLocalImg').setAttribute("download", "order-1111111111.png")
                document.getElementById('saveLocalImg').click();
            },
            getRoundedCanvas(sourceCanvas) {

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var width = sourceCanvas.width;
                var height = sourceCanvas.height;

                canvas.width = width;
                canvas.height = height;

                context.imageSmoothingEnabled = true;
                context.drawImage(sourceCanvas, 0, 0, width, height);
                context.globalCompositeOperation = 'destination-in';
                context.beginPath();
                // context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);  
                context.fill();

                return canvas;
            },
            saveUserInfo() {
                if (this.username.length > 24 || this.username.length < 2){
                    this.commonFuns.createTips('昵称需在2-24个字之间, 可以包含英文字母、中文、-、_、数字', 'error')
                    return
                }
                if (this.personDesc.length > 140){
                    this.commonFuns.createTips('介绍信息不能超过140字', 'error')
                    return
                }
                let me = this
                if (this.picValue) {
                    let xhr = new XMLHttpRequest()
                    let formdata = new FormData()
                    formdata.append('up-img', this.picValue)
                    xhr.open("POST", 'http://upload.qianqian.com/uploadfile?appid=ugcdiy&restype=jpg')
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                                let res = JSON.parse(xhr.responseText);
                                console.log(res)
                                if (res.code == 0) {
                                    if (res.url) {
                                        me.userPic = res.url.replace(/http\:\/\/bj.bcebos.com\/ugcx/,
                                            'http://musicugc.qianqian.com').split('?')[0]
                                        me.userPic += '@c_1,x_' + me.imgData.x + ',y_' + me.imgData.y + ',w_' + me.imgData.w + ',h_' + me.imgData.h
                                        let date = new Date(me.selectDate)
                
                                        let userTag = me.finalSelectTag.join()
                                        let paramsJson = {
                                            'bth_info': me.selectDate? date.getTime()/1000 : '',
                                            'sex': me.personSex,
                                            'detail': me.personDesc,
                                            'tag': userTag,
                                            'nickname': me.username,
                                            'userpic': me.userPic,
                                            'province': me.areaSelect[0]?me.areaSelect[0].replace(/市/,''):'',
                                            'city': me.areaSelect[1]?me.areaSelect[1]:''
                                        };
                                        me.$store.dispatch('modifyUserBaseInfo', paramsJson);
                                        me.$router.back()
                                    }
                                }
                            }
                        } else {
                            //console.log(xhr.status);
                        }
                    }
                    xhr.send(formdata);
                } else {
                    let date = new Date(me.selectDate)
                
                    let userTag = me.finalSelectTag.join()
                    let paramsJson = {
                        'bth_info': me.selectDate? date.getTime()/1000 : '',
                        'sex': me.personSex,
                        'detail': me.personDesc,
                        'tag': userTag,
                        'nickname': me.username,
                        'userpic': me.userPic,
                        'province': me.areaSelect[0]?me.areaSelect[0].replace(/市/,''):'',
                        'city': me.areaSelect[1]?me.areaSelect[1]:''
                    };
                    me.$store.dispatch('modifyUserBaseInfo', paramsJson).then((res)=>{
                        me.$router.back()
                    },(res)=>{
                        
                    })
                    // me.$store.dispatch('getLoginUserInfo')
                    //me.$router.back()
                }
            }
        },
        watch: {
            username() {
                let max_usernameNem = 24
                this.isEmpty = this.username == ''?true:false
                this.usernameNem = max_usernameNem - this.$refs.usercount.value.length
            }
        }
    }
</script>
<style>
    .el-date-table td.current:not(.disabled), .el-date-table td.end-date, .el-date-table td.start-date {
        background-color: #e13228!important;
        color: #fff;
    }
    .el-date-table td.today:before {
        content: " ";
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-top: .5em solid #e13228;
        border-left: .5em solid transparent;
    }
    .el-dialog__headerbtn {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 12px;
        height: 12px;
    }
    .area-select.medium {
        width: 132px !important;
        margin-left: 0 !important;
        margin-right: 10px;
    }
    .area-selectable-list .area-select-option.selected {
        color: #e13228 !important;
        font-weight: 400;   
    }
    .area-select .area-selected-trigger {
        color: #999999 !important;
        font-size: 12px !important;
    }
    .el-date-editor.el-input {
        width: 132px !important;
        margin-left: 0 !important;
        margin-right: 10px !important;
    }
    .el-input__inner {
        border: 1px solid #e1e1e1 !important;
        color: #999999 !important;
        height: 26px !important;
        font-size: 12px !important;
    }
    .el-input__icon {
        color: #999999 !important; 
    }
    input::-webkit-input-placeholder {
        /* placeholder颜色  */
        color: #999999 !important;
        /* placeholder字体大小  */
        font-size: 12px !important;
    }
    textarea::-webkit-input-placeholder {
        /* placeholder颜色  */
        color: #999999 !important;
        /* placeholder字体大小  */
        font-size: 14px !important;
    }
    .area-select {
        height: 26px !important;
    }
    .area-select .area-selected-trigger {
        padding: 3px 10px !important;
    }
    .c3 {
        color: #333333;
    }
    .c9 {
        color: #999999;
    }
    .cr {
        color: #e13228;
    }
    .f12 {
        font-size: 12px;
    }
    .f14 {
        font-size: 14px;
    }
    .fb {
        font-weight: bold;
    }
    .pa {
        position: absolute;
    }
    .pr {
        position: relative;
    }
    .t {
        transition: all .2s;
        -webkit-transition: all .2s;
        -moz-transition: all .2s;
        -ms-transition: all .2s;
        -o-transition: all .2s;
    }
    .new_width {
        width: 110px;
        margin-left: -6px;
    }
    .clearfix {
        zoom: 1;
    }
    input::-webkit-input-placeholder {
        /* placeholder颜色  */
        color: #999999;
        /* placeholder字体大小  */
        font-size: 12px;
    }
    textarea::-webkit-input-placeholder {
        /* placeholder颜色  */
        color: #999999;
        /* placeholder字体大小  */
        font-size: 14px;
    }
    .distance {
        margin-right: 10px;
    }
    .editPerson {
        padding: 0 17px;
        height: 100%;
    }
    .editPerson-title-wrap {
        height: 46px;
        width: 100%;
        border-bottom: 1px solid #e8e8e8;
    }
    .nick-text {
        right: 9px;
        top: 5px;
    }
    .desc-text {
        left: 2px;
        bottom: -14px;
    }
    .editPerson-title {
        font-size: 20px;
        color: #333333;
        margin-top: 14px;
        display:inline-block;
    }
    .editPerson-content-name {
        margin-top: 30px;
    }
    .editPerson-content-name-title {
        padding-right: 10px;
        float: left;
        margin-top: 2px;
        position: relative;
        width: 80px;
        text-align: right;
    }
    .editPerson-content-name-box {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 6px;
        width: 413px;
        /* overflow: hidden; */
    }
    .editPerson-content-name-input {
        width: 413px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        padding: 0 40px 0 20px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }

    .editPerson-content-sex {
        margin-top: 25px;
    }
    .editPerson-content-sex-title {
        padding-right: 10px;
        float: left;
        /* margin-top: -1px; */
        position: relative;
        width: 80px;
        text-align: right;
    }
    .editPerson-content-sex-box {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 6px;
        width: 475px;
        overflow: hidden;
    }
    .editPerson-content-sex-input {
        width: 413px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        padding: 0 40px 0 20px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }

    .editPerson-content-age {
        margin-top: 25px;
    }
    .editPerson-content-age-title {
        padding-right: 10px;
        float: left;
        margin-top: 4px;
        position: relative;
        width: 80px;
        text-align: right;
    }
    .editPerson-content-age-box {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 6px;
        width: 475px;
        overflow: hidden;
    }
    .editPerson-content-age-input {
        width: 413px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        padding: 0 40px 0 20px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }

    .editPerson-content-position {
        margin-top: 25px;
    }
    .editPerson-content-position-title {
        padding-right: 10px;
        float: left;
        margin-top: 4px;
        position: relative;
        width: 80px;
        text-align: right;
    }
    .editPerson-content-position-box {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 6px;
        width: 475px;
        /* overflow: hidden; */
    }
    .editPerson-content-position-box .area-selectable-list-wrap {
        height: 260px;
    }
    .editPerson-content-position-input {
        width: 413px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        padding: 0 40px 0 20px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }

    .editPerson-content-tips {
        padding: 5px 0;
        display: block;
        height: 20px;
        position: absolute;
    }
    /* 歌单名称为空时输入框样式 */
    .red-border {
        border: 1px solid #f23e25 !important;
    }

    .editPerson-content-tag {
        margin-top: 25px;
    } 
    .editPerson-content-tag-title {
        padding-right: 10px;
        float: left;
        width: 80px;
        text-align: right;
        margin-top: 1px;
    }
    .editPerson-content-tag-add {
        display: inline-block;
        width: 78px;
        height: 22px;
        text-align: center;
        line-height: 20px;
        border: 1px solid #333333;
        border-radius: 10px;
        margin-left: 8px;
        cursor: pointer;
    }

    .editPerson-content-detail {
        margin-top: 28px;
    }
    .editPerson-content-detail-title {
        padding-right: 10px;
        float: left;
        width: 80px;
        margin-top: 4px;
        text-align: right;
    }
    .editPerson-content-detail-content {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 1px;
        width: 475px;
        /* overflow: hidden; */
    }
    .edit-desc {
        padding: 2px 10px 0;
        width: 413px;
        line-height: 36px;
        font-size: 14px;
        color: #333;
        height: 100px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }
    .editPerson-content-btn {
        margin-top: 25px;
        text-align: center;
    }
    .editPerson-content-btn-save {
        /* margin: 0 auto 100px; */
        color: #ffffff;
        height: 30px;
        line-height: 30px;
        text-align: center;
        display: block;
        width: 100px;
        border-radius: 15px;
        background: #e13228;
        border: 1px solid #e13228;
        display: inline-block;
        cursor: pointer;
    }
    .editPerson-content-btn-cancel {
        color: #333333;
        height: 30px;
        line-height: 30px;
        text-align: center;
        display: block;
        width: 100px;
        border-radius: 15px;
        border: 1px solid #e5e5e5;
        display: inline-block;
        margin-left: 14px;
        cursor: pointer;
    }
    .editPerson-content-img {
        width: 90px;
        top: 78px;
        right: 100px;
    }
    .editPerson-content-img dt {
        display: block;
    }
    .editPerson-content-img-btn {
        color: #333;
        cursor: pointer;
    }
    .editPerson-content-img-btn-preview {
        height: 90px;
        width: 90px;
        border-radius: 50%;
        display: block;
        border: 1px solid #e5e5e5;
        cursor: default;
    }
    .editPerson-content-img-btn-bg {
        color: #e13228;
        display: block;
        height: 28px;
        line-height: 28px;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 10px;
        border: 1px solid #e13228;
        width: 90px;
        border-radius: 15px;
        position: relative;
    }
    .editPerson-content-img-btn-bg input {
        position: absolute;
        font-size: 100px;
        right: 0;
        top: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
        font-size: 0; 
        /* 若无font-size: 0，在input-file下cursor: pointer;无效*/
        cursor: pointer;
    
    }

    .edit-tags-box {
        height: 400px;
        width: 434px;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -217px;
        margin-top: -200px;
        background: #ffffff;
        border-radius: 4px;
        box-shadow: 0 0 5px 5px rgba(0,0,0,0.2);
    }
    .edit-tags-box-title {
        color: #515151;
        height: 38px;
        background: #f9f9f9;
        width: 100%;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        line-height: 38px;
        padding-left: 20px;
    }
    .edit-tags-box-content {
        height: 300px;
        border-bottom: 1px solid #e5e5e5;
        overflow-y: scroll;
    }
    .edit-tags-box-bottom {
        height: 60px;
        line-height: 60px;
        text-align: center;
    }
    .edit-tags-box-bottom-save {
        color: #ffffff;
        height: 30px;
        line-height: 30px;
        text-align: center;
        display: block;
        width: 100px;
        border-radius: 15px;
        background: #e13228;
        border: 1px solid #e13228;
        display: inline-block;
        cursor: pointer;
    }
    .clearfix:before, .clearfix:after {
        content: "";
        display: block;
        height: 0;
    }
    .edit-tags-class ul {
        float: left;
        width: 360px;
        margin-bottom: 6px;
    }
    .edit-tags-class h4 {
        float: left;
        padding: 3px 9px;
        font-size: 14px;
        width: 58px;
        text-align: right;
    }
    .edit-tags-box li {
        float: left;
    }
    .edit-tags-basic li a {
        color: #333;
        border-radius: 15px;
        font-size: 14px;
        width: 80px;
        height: 20px;
        border: 1px solid #e5e5e5;
        display: block;
        margin: 0 0 12px 8px;
        text-align: center;

    }
    .already-choose li a {
        border-radius: 15px;
        font-size: 14px;
        height: 20px;
        padding: 0 25px;
        display: block;
        margin: 0 0 12px 8px;
        text-align: center;
        color: #fff;
        background: #e31228;
        border: 1px solid #e13228;
        cursor: default;
    }
    .deleteTag {
        position: absolute;
        top: 8px;
        right: 10px;
        color: #ffffff;
        cursor: pointer;
        background: url('~static/images/user/tagCancel.svg') no-repeat;
        width: 7px;
        height: 7px;
    }
    .tag-ts {
        height: 22px;
        line-height: 22px;
        margin-left: 10px;
        margin-left: 8px;
        color: #515151;
        margin-bottom: 12px;
    }
    .edit-tags-basic li:hover a {
        border: 1px solid #e13228;
        color: #e13228;
    }
    .clearfix:before, .clearfix:after {
        content: "";
        display: block;
        height: 0;
    }
    .input-radio {
        cursor: pointer;
        width: 20px;
    }
    .edit-img-box {
        height: 398px;
        width: 434px;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -217px;
        margin-top: -200px;
        background: #ffffff;
        border-radius: 4px;
        box-shadow: 0 0 5px 5px rgba(0,0,0,0.2);        
    }
    .edit-img-btn {
        padding: 20px 0 15px;
    }
    .select-pic {
        cursor: pointer;
        left: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        width: 100%;
        height: 100%;
    }
    .upload-btn {
        width: 122px;
        height: 35px;
        line-height: 38px;
        text-align: center;
        display: inline-block;
        color: #515151;
        margin-right: 12px;
        border: 1px solid #e5e5e5;
        border-radius: 20px;
        cursor: pointer;
    }
    .edit-img-box-content {
        padding: 0 25px;
    }
    .edit-img-span {
        width: 230px;
        display: inline-block;
        position: relative;
        top: 5px;
    }
    .pop-cut-img-box {
        width: 203px;
        height: 203px;
        margin-right: 28px;
        background-color: #666;
    }
    .pop-upload h4 {
        padding-bottom: 5px;
    }
    .upload-img-box {
        float: left;
        width: 100px;
        height: 100px;
        position: relative;
        overflow: hidden;
        background: #666;
    }
    .upload-img-box-small {
        margin-top: 34px;
        float: left;
        width: 50px;
        height: 50px;
        position: relative;
        overflow: hidden;
        background: #666;
    }
    .upload-img-small {
        margin-top: 165px;
        padding-left: 290px;
        color: #8f8f8f;
    }
    .isSelectTag {
        border: 1px solid #e13228 !important;
        color: #e13228 !important;
    }

    .text-alarm {
        border: 1px solid #e13228;
    }

    .color-alarm {
        color: #e13228;
    }

    #demo #button {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 80px;
        height: 40px;
        border: none;
        border-radius: 5px;
        background: white;
    }

    .cropper-container {
        font-size: 0;
        line-height: 0;
        position: relative;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        /* direction: ltr;   */
        -ms-touch-action: none;
        /* touch-action: none */
    }

    .cropper-container img {
        /* Avoid margin top issue (Occur only when margin-top <= -height) */
        display: block;
        min-width: 0 !important;
        max-width: none !important;
        min-height: 0 !important;
        max-height: none !important;
        width: 100%;
        height: 100%;
        /* image-orientation: 0deg   */
    }

    .cropper-wrap-box,
    .cropper-canvas,
    .cropper-drag-box,
    .cropper-crop-box,
    .cropper-modal {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    .cropper-wrap-box {
        overflow: hidden;
    }

    .cropper-drag-box {
        opacity: 0;
        background-color: #fff;
    }

    .cropper-modal {
        opacity: .5;
        background-color: #000;
    }

    .cropper-view-box {
        display: block;
        overflow: hidden;
        width: 100%;
        height: 100%;
        outline: 1px solid #39f;
        outline-color: rgba(51, 153, 255, 0.75);
    }

    .cropper-dashed {
        position: absolute;
        display: block;
        opacity: .5;
        border: 0 dashed #eee
    }

    .cropper-dashed.dashed-h {
        top: 33.33333%;
        left: 0;
        width: 100%;
        height: 33.33333%;
        border-top-width: 1px;
        border-bottom-width: 1px
    }

    .cropper-dashed.dashed-v {
        top: 0;
        left: 33.33333%;
        width: 33.33333%;
        height: 100%;
        border-right-width: 1px;
        border-left-width: 1px
    }

    .cropper-center {
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        width: 0;
        height: 0;
        opacity: .75
    }

    .cropper-center:before,
    .cropper-center:after {
        position: absolute;
        display: block;
        content: ' ';
        background-color: #eee
    }

    .cropper-center:before {
        top: 0;
        left: -3px;
        width: 7px;
        height: 1px
    }

    .cropper-center:after {
        top: -3px;
        left: 0;
        width: 1px;
        height: 7px
    }

    .cropper-face,
    .cropper-line,
    .cropper-point {
        position: absolute;
        display: block;
        width: 100%;
        height: 100%;
        opacity: .1;
    }

    .cropper-face {
        top: 0;
        left: 0;
        background-color: #fff;
    }

    .cropper-line {
        background-color: #39f
    }

    .cropper-line.line-e {
        top: 0;
        right: -3px;
        width: 5px;
        cursor: e-resize
    }

    .cropper-line.line-n {
        top: -3px;
        left: 0;
        height: 5px;
        cursor: n-resize
    }

    .cropper-line.line-w {
        top: 0;
        left: -3px;
        width: 5px;
        cursor: w-resize
    }

    .cropper-line.line-s {
        bottom: -3px;
        left: 0;
        height: 5px;
        cursor: s-resize
    }

    .cropper-point {
        width: 5px;
        height: 5px;

        opacity: .75;
        background-color: #39f
    }

    .cropper-point.point-e {
        top: 50%;
        right: -3px;
        margin-top: -3px;
        cursor: e-resize
    }

    .cropper-point.point-n {
        top: -3px;
        left: 50%;
        margin-left: -3px;
        cursor: n-resize
    }

    .cropper-point.point-w {
        top: 50%;
        left: -3px;
        margin-top: -3px;
        cursor: w-resize
    }

    .cropper-point.point-s {
        bottom: -3px;
        left: 50%;
        margin-left: -3px;
        cursor: s-resize
    }

    .cropper-point.point-ne {
        top: -3px;
        right: -3px;
        cursor: ne-resize
    }

    .cropper-point.point-nw {
        top: -3px;
        left: -3px;
        cursor: nw-resize
    }

    .cropper-point.point-sw {
        bottom: -3px;
        left: -3px;
        cursor: sw-resize
    }

    .cropper-point.point-se {
        right: -3px;
        bottom: -3px;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        opacity: 1
    }

    @media (min-width: 768px) {
        .cropper-point.point-se {
            width: 15px;
            height: 15px
        }
    }

    @media (min-width: 992px) {
        .cropper-point.point-se {
            width: 10px;
            height: 10px
        }
    }

    @media (min-width: 1200px) {
        .cropper-point.point-se {
            width: 5px;
            height: 5px;
            opacity: .75
        }
    }

    .cropper-point.point-se:before {
        position: absolute;
        right: -50%;
        bottom: -50%;
        display: block;
        width: 200%;
        height: 200%;
        content: ' ';
        opacity: 0;
        background-color: #39f
    }

    .cropper-invisible {
        opacity: 0;
    }

    .cropper-hide {
        position: absolute;
        display: block;
        width: 0;
        height: 0;
    }

    .cropper-hidden {
        display: none !important;
    }

    .cropper-move {
        cursor: move;
    }

    .cropper-crop {
        cursor: crosshair;
    }

    .cropper-disabled .cropper-drag-box,
    .cropper-disabled .cropper-face,
    .cropper-disabled .cropper-line,
    .cropper-disabled .cropper-point {
        cursor: not-allowed;
    }
</style>