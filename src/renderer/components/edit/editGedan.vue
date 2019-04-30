<template>
    <div class="editGedan">
        <div class="editGedan-title-wrap">
            <span class="editGedan-title fb" id="sss">编辑歌单信息</span>
        </div>
        <div class="editGedan-content-wrap">
            <div class="editGedan-content-name">
                <h3 class="editGedan-content-name-title f14 c3 fb">歌单名称：</h3>
                <div class="editGedan-content-name-box pr">
                    <input type="text" class="editGedan-content-name-input t" placeholder="输入歌单名称" v-model="gedanTitle" :class="{'text-alarm':gedanTitle.length > 30}"><br>
                    <span v-if="isEmpty" class="editGedan-content-tips c9">歌单名称不能为空</span>
                    <span v-if="gedanTitle.length > 30" class="editGedan-content-tips c9 color-alarm">最多输入30个字</span>
                    <span v-else class="nick-text pa t c9">{{30 - gedanTitle.length}}</span>
                </div>
            </div>

            <div class="editGedan-content-tag">
                <h3 class="editGedan-content-tag-title f14 c3 fb">标签：</h3>
                <span v-for="item in finalSelectTag" class="f14 cr distance">{{item}}</span>
                <div class="editGedan-content-tag-add f12 c3" @click="openTag">添加标签</div>
            </div>

            <div class="editGedan-content-detail">
                <h3 class="editGedan-content-detail-title f14 c3 fb">简介：</h3>
                <div class="editGedan-content-detail-content pr">
                    <textarea name="" id="" cols="30" rows="10" class="edit-desc" placeholder="为你的歌单加一点介绍吧" v-model="gedanDesc" :class="{'text-alarm':gedanDesc.length > 500}"></textarea>
                    <span v-if="gedanDesc.length > 500" class="desc-text pa t c9 color-alarm">最多输入500个字</span>
                    <span v-else class="desc-text pa t c9">{{500 - gedanDesc.length}}</span>
                </div>
            </div>

            <dl class="editGedan-content-img pa">
                <dt>
                    <div class="editGedan-content-img-btn" @click="change">
                        <img v-if="headerImage" :src="headerImage" alt="" class="editGedan-content-img-btn-preview">
                        <img v-else class="editGedan-content-img-btn-preview" src="static/images/edit/editGedan-default.png"
                            alt="">
                        <!-- <span class="f14 t editGedan-content-img-btn-bg">更改封面</span> -->
                        <a class="f14 t editGedan-content-img-btn-bg">更改封面<input type="file" class="" accept="image/gif,image/png,image/jpeg,image/jpg,image/bmp"
                                @change="change" value="更改封面" id="change"></a>
                    </div>
                </dt>
                <dd class="c9 f12">
                    支持 jpg \ png \ gif 格式，建议尺寸大于500＊500，文件小于10M
                </dd>
            </dl>

            <div class="editGedan-content-btn">
                <div class="editGedan-content-btn-save" @click.stop="saveGedan">保存</div>
                <div class="editGedan-content-btn-cancel" @click="editCancel">取消</div>
            </div>

            <a id="saveLocalImg"></a>

            <!-- tag -->
            <div v-if="showTag">
                <div class="edit-tags-box t">
                    <div class="edit-tags-box-title f14 fb">选择分类标签<button type="button" @click="closeTag" aria-label="Close"
                            class="el-dialog__headerbtn"><i class="el-dialog__close el-icon el-icon-close"></i></button></div>
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
                                    <a href="javascript:void(0)" class="t" @click="selectTag(secendItem)" :class="_isSelectTag(secendItem)">{{secendItem}}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="edit-tags-box-bottom">
                        <div class="edit-tags-box-bottom-save" @click="saveTags">保存</div>
                    </div>
                </div>
            </div>

            <!-- 封面弹出框 -->
            <div class="edit-img-box" v-show="showImg">
                <div class="edit-tags-box-title f14 fb">更改封面<button type="button" @click="closeImg" aria-label="Close"
                        class="el-dialog__headerbtn"><i class="el-dialog__close el-icon el-icon-close"></i></button></div>
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
                        <div class="upload-img-box" id="viewDivbig">
                            <!-- <img class="upload-img" :src="url"> -->
                        </div>
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
    import {
        mapGetters,
        mapActions
    } from "vuex";
    import Cropper from 'cropperjs'

    export default {
        data() {
            return {
                isEmpty: false,
                showTag: false,
                showImg: false,
                gedanID: '',
                gedanTitle: '',
                gedanDesc: '',
                gedanPic: '',
                url: '',
                picValue: '',
                headerImage: '',
                hasSelectTag: [],
                finalSelectTag: [],
                imgData: {},
                allTag: {
                    '语种': ["华语", "欧美", "粤语", "日语", "韩语", "纯音乐", "小语种"],
                    '风格': ["流行", "摇滚", "民谣", "电子", "影视原声", "ACG", "轻音乐", "新世纪", "爵士", "古典", "乡村", "说唱", "世界音乐", "古风",
                        "儿歌", "朋克", "布鲁斯", "RnB/Soul", "金属", "雷鬼", "英伦", "民族", "后摇", "拉丁"
                    ],
                    '情感': ["快乐", "美好", "安静", "伤感", "寂寞", "思念", "孤独", "怀旧", "悲伤", "感动", "治愈", "放松", "清新", "浪漫", "兴奋",
                        "性感", "励志"
                    ],
                    '场景': ["运动", "驾驶", "学习", "工作", "清晨", "夜晚", "午后", "游戏", "旅行", "散步", "酒吧", "夜店", "咖啡厅", "地铁", "校园",
                        "婚礼", "约会", "休息"
                    ],
                    '主题': ["经典", "翻唱", "榜单", "现场", "KTV", "DJ", "网络歌曲", "器乐"]
                }
            }
        },
        computed: {
            ...mapGetters({
                gedanInfo: 'gedanInfo'
            })
        },
        methods: {
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
                if (this.hasSelectTag.length < 3) {
                    if (!this.hasSelectTag.includes(secendItem)) {
                        this.hasSelectTag.push(secendItem)
                    }
                } else {
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
                return this.hasSelectTag.includes(secendItem) ? 'isSelectTag' : ''
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
            saveGedan() {
                //图片上传  
                let me = this
                if (this.gedanTitle.length > 30 || this.gedanTitle.length < 1){
                    this.commonFuns.createTips('歌单名不符合要求', 'error')
                    return
                }
                if (this.gedanDesc.length > 500){
                    this.commonFuns.createTips('歌单简介不符合要求', 'error')
                    return
                }
                if (this.picValue) {
                    let xhr = new XMLHttpRequest()
                    let formdata = new FormData()
                    formdata.append('up-img', this.picValue)
                    xhr.open("POST", 'http://upload.qianqian.com/uploadfile?appid=ugcdiy&restype=jpg')
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                                let res = JSON.parse(xhr.responseText);
                                if (res.code == 0) {
                                    if (res.url) {
                                        me.gedanPic = res.url.replace(/http\:\/\/bj.bcebos.com\/ugcx/,
                                            'http://musicugc.qianqian.com').split('?')[0]
                                        me.gedanPic += '@c_1,x_' + me.imgData.x + ',y_' + me.imgData.y + ',w_' + me.imgData.w + ',h_' + me.imgData.h
                                        let gedanTag = me.finalSelectTag.join()
                                        let paramsJson = {
                                            'list_id': me.gedanInfo.list_id,
                                            'title': me.gedanTitle,
                                            'desc': me.gedanDesc,
                                            'tag': gedanTag,
                                            'diypic': me.gedanPic,
                                            'isDone': false,
                                            'ret_code': 0
                                        };
                                        me.$store.dispatch('modifyListBaseInfo', paramsJson).then((res)=>{
                                            me.$router.back()
                                        },(res)=>{
                                            
                                        });
                                        
                                    }
                                }
                            }
                        } else {
                            //console.log(xhr.status);
                        }
                    }
                    xhr.send(formdata);
                } else {
                    let gedanTag = me.finalSelectTag.join()
                    let paramsJson = {
                        'list_id': me.gedanInfo.list_id,
                        'title': me.gedanTitle,
                        'desc': me.gedanDesc,
                        'tag': gedanTag,
                        'isDone': false,
                        'ret_code': 0
                    };
                    me.$store.dispatch('modifyListBaseInfo', paramsJson).then((res)=>{
                        me.$router.back()
                    },(res)=>{

                    });
                }
            }
        },
        mounted() {
            this.gedanTitle = this.gedanInfo.list_title
            this.gedanDesc = this.gedanInfo.list_desc
            this.headerImage = this.gedanInfo.list_pic ? this.gedanInfo.list_pic : ''
            let tempTag = this.gedanInfo.list_tag.split(',')
            let resultTag = []
            for (var i = 0; i < tempTag.length; i++) {
                if (tempTag[i] != '') {
                    resultTag.push(tempTag[i])
                }
            }
            this.hasSelectTag = resultTag
            this.finalSelectTag = resultTag
            var self = this;
            var image = document.getElementById('txImage');
            this.cropper = new Cropper(image, {
                aspectRatio: 1,
                viewMode: 0,
                background: false,
                zoomable: false,
                preview: ".upload-img-box",
                viewWidth: 100,
                viewHeight: 100,
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
        watch: {
            gedanTitle() {
                this.isEmpty = this.gedanTitle == '' ? true : false
            }
        }
    }
</script>
<style>
    .el-dialog__headerbtn {
        position: absolute;
        right: 10px;
        top: 10px;
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

    .f10 {
        font-size: 10px;
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

    .editGedan {
        padding: 0 17px;
        height: 100%;
    }

    .editGedan-title-wrap {
        height: 46px;
        width: 100%;
        border-bottom: 1px solid #e8e8e8;
    }

    .editGedan-title {
        font-size: 20px;
        color: #333333;
        margin-top: 14px;
        display: inline-block;
    }

    .editGedan-content-name {
        margin-top: 40px;
    }

    .editGedan-content-name-title {
        padding-right: 20px;
        float: left;
        margin-top: 4px;
        position: relative;
        text-align: right;
        width: 100px;
    }

    .editGedan-content-name-box {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 6px;
        width: 413px;
        overflow: hidden;
    }

    .editGedan-content-name-input {
        width: 413px;
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        padding: 0 22px 0 10px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }

    .editGedan-content-tips {
        padding: 5px 0;
        display: block;
        height: 20px;
    }

    /* 歌单名称为空时输入框样式 */
    .red-border {
        border: 1px solid #f23e25 !important;
    }

    .editGedan-content-tag {
        margin-top: 14px;
    }

    .editGedan-content-tag-title {
        padding-right: 20px;
        float: left;
        width: 100px;
        text-align: right;
    }

    .editGedan-content-tag-add {
        display: inline-block;
        width: 80px;
        height: 24px;
        text-align: center;
        line-height: 22px;
        border: 1px solid #333333;
        border-radius: 24px;
        margin-left: 8px;
        cursor: pointer;
    }

    .editGedan-content-detail {
        margin-top: 28px;
    }

    .editGedan-content-detail-title {
        padding-right: 20px;
        float: left;
        width: 100px;
        margin-top: 4px;
        text-align: right;
    }

    .editGedan-content-detail-content {
        display: inline-block;
        vertical-align: top;
        padding-bottom: 1px;
        width: 413px;
        /* overflow: hidden; */
    }

    .edit-desc {
        padding: 11px 20px 0;
        width: 413px;
        line-height: 36px;
        font-size: 14px;
        color: #333;
        height: 160px;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: none;
        outline: none;
        resize: none;
    }

    .editGedan-content-btn {
        margin-top: 28px;
        text-align: center;
    }

    .editGedan-content-btn-save {
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

    .editGedan-content-btn-cancel {
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

    .editGedan-content-img {
        width: 180px;
        top: 88px;
        right: 40px;
    }

    .editGedan-content-img dt {
        display: block;
    }

    .editGedan-content-img-btn {
        color: #333;
        cursor: pointer;
    }

    .editGedan-content-img-btn-preview {
        height: 180px;
        width: 180px;
        display: block;
    }

    .editGedan-content-img-btn-bg {
        background: #e13228;
        color: #ffffff;
        display: block;
        height: 41px;
        line-height: 41px;
        color: #fff;
        text-align: center;
        margin-bottom: 10px;
        cursor: pointer;
        position: relative;
    }

    .editGedan-content-img-btn-bg input {
        position: absolute;
        font-size: 100px;
        right: 0;
        top: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
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
        box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.2);
    }

    .edit-tags-box-title {
        color: #515151;
        height: 38px;
        background: #f9f9f9;
        width: 100%;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        line-height: 38px;
        padding-left: 24px;
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

    .clearfix:before,
    .clearfix:after {
        content: "";
        display: block;
        height: 0;
    }

    .edit-tags-class ul {
        float: left;
        width: 360px;
        margin-bottom: 18px;
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

    .edit-tags-basic li a{
        color: #333;
        border-radius: 15px;
        font-size: 12px;
        width: 80px;
        border: 1px solid #e5e5e5;
        display: block;
        margin: 0 0 12px 8px;
        text-align: center;
        padding: 3px 0;

    }

    .already-choose li a {
        border-radius: 20px;
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

    .clearfix:before,
    .clearfix:after {
        content: "";
        display: block;
        height: 0;
    }

    .already-choose li a {
        color: #fff;
        background: #e31228;
        border: 1px solid #e13228;
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
        box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.2);
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
        position: relative;
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

    .pop-cut-img-box img {
        width: 203px;
        height: 203px;
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

    .upload-img-box img {
        width: 100px;
        height: 100px;
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

    .nick-text {
        right: 9px;
        top: 5px;
    }
    .desc-text {
        left: 2px;
        bottom: -14px;
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

    #demo .show {
        width: 100px;
        height: 100px;
        overflow: hidden;
        position: relative;
        /* border-radius: 50%;   */
        border: 1px solid #d5d5d5;
    }

    #demo .picture {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
    }

    #demo .container {
        z-index: 99;
        position: fixed;
        padding-top: 60px;
        /* left: 0;  
            top: 0;  
            right: 0;  
            bottom: 0;   */
        background: rgba(0, 0, 0, 1);
    }

    #demo #image {
        max-width: 100%;
    }

    .cropper-view-box,
    .cropper-face {
        /* border-radius: 50%;   */
    }

    /*!  
         * Cropper.js v1.0.0-rc  
         * https://github.com/fengyuanchen/cropperjs  
         *  
         * Copyright (c) 2017 Fengyuan Chen  
         * Released under the MIT license  
         *  
         * Date: 2017-03-25T12:02:21.062Z  
         */
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

    .cropper-bg {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
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