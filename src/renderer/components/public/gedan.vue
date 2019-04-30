<template>
    <div class="gedan-info-wrapper">
        <!--gedan info start-->
        <div class="info-box">
            <gedan-item :classname="'gedan-detail'" :data="{'pic':gedanInfo.list_pic_middle,'listen_num':gedanBaseInfo.listen_num,'listid':gedanInfo.list_id,'gedanType':gedanType}" :fields="{'pic':true,'title':false,'listen_num':true}"></gedan-item>
            <div class="info-detail">
                <h3 v-if="isSee" class="info-title">{{gedanInfo.list_title}}</h3>
                <div class="info-tags-box">
                    <p class="info-user" v-if="isSee">
                        <span class="user" v-if="gedanInfo.userinfo">{{gedanInfo.userinfo.username}}</span>
                        <span class="dtime">{{gedanInfo.lastmodify | format_time}}</span>
                    </p>
                </div>
                <div class="info-tags-box" v-if="isSee">
                    <!-- 自建歌单 -->
                    <p class="info-tags" v-if="gedanType==='self'">标签：
                        <span v-if="gedanInfo.list_tag">{{gedanInfo.list_tag.replace(/\,/g,"    ")}}</span>
                        <span v-else @click="editGedan" class="toEditGedan">添加</span>
                    </p>
                    <!-- 其他 -->
                    <p class="info-tags" v-else >标签：
                        <span v-if="gedanInfo.list_tag">{{gedanInfo.list_tag.replace(/\,/g,"    ")}}</span>
                        <span v-else>{{gedanInfo.list_tag}}</span>
                    </p>
                </div>
                <div class="detail-box"  v-if="isSee">
                    <div class="detail-txt" v-if="gedanInfo.list_desc">
                        <p class="detail"><span style="color:#333333">歌单简介：</span>{{list_desc}}</p>
                        <a v-if="isShowMorebtn" class="show-detail-more-btn" :class="{'more-close-btn':isShowMoreDetail,'more-open-btn':!isShowMoreDetail}" v-on:click.stop="isShowMoreDetail= !isShowMoreDetail"></a>
                    </div>
                    <!-- 自建歌单 -->
                    <p v-else-if="gedanType==='self'" class="detail" ><span>歌单简介：</span><span class="toEditGedan" @click="editGedan">添加歌单简介</span></p>
                    <!-- 其他 -->
                    <p v-else class="detail">暂无歌单介绍</p>
                    <transition  v-on:enter="enter" v-on:leave="leave">
                        <div class="floating-layer" v-if="isShowMoreDetail">
                            <div class="triangle-up"></div>
                            <h3 class="layer-title">歌单简介</h3>
                            {{gedanInfo.list_desc}}
                        </div>
                    </transition>
                </div>
                <div class="button-wrap">
                    <!-- 收藏歌单 -->
                    <button-collect v-if="gedanType!=='self'" :allSongs="songdata.songList" :listid="list_id" :moredata="{'gedanInfo':gedanInfo,'gedanType':gedanType}" :favourData="{'data':{'list_id': list_id,'source': 0},'showdata':{'nums':gedanBaseInfo.collect_num,'iscollect':gedanBaseInfo.iscollect,'favourClassname':favourBtnClassName,'pagetype':pagetype}}" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':this.isNotMass,'more':this.isNotMass,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}"></button-collect>
                    <!-- 自建歌单 -->
                    <button-collect v-else-if="gedanType==='self'" :allSongs="allsongdata" :listid="list_id" :moredata="{'gedanInfo':gedanInfo,'gedanType':gedanType}" :favourData="{'data':{'list_id': list_id,'source': 0},'showdata':{'nums':gedanBaseInfo.collect_num,'iscollect':gedanBaseInfo.iscollect,'favourClassname':favourBtnClassName,'pagetype':pagetype}}" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':false,'delete':true,'more':this.isNotMass,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}"></button-collect>
                </div>
            </div>
        </div>
        <!--gedan info end    -->
        <!--gedan list start    -->
   
        <song-list v-if="gedanType!=='self' && songdata.list_num>0 && isSee" :data="songdata.songList" :detail="{'classname':'','type':gedanType, 'list_id':list_id}" :fields="{'hot':false,'album_title':true,'singer':true}"></song-list>
        <song-list v-else-if="gedanType==='self' && allsongdata.length>0 && isSee" :data="allsongdata" :detail="{'classname':'','type':gedanType, 'list_id':list_id}" :fields="{'hot':false,'album_title':true,'singer':true}"></song-list>
        <!--gedan list end-->
        <empty v-show="isSee" v-else :content="'还没有添加过歌曲'" :btnText="'去发现音乐看看'" :linkUrl="'/muwindow'"></empty>
        <div class="pagination-box" v-if="gedanType!=='self' && songdata.list_num > 20">
            <el-pagination small layout="prev, pager, next" :total="songdata.list_num" :page-size="20" @current-change="onChangePage"></el-pagination>
        </div>
    </div>
</template>
<script>
    import buttonCollect from 'components/button/button-collect.vue'
    import gedanItem from 'components/public/gedan-item.vue'
    import songList from 'components/public/song-list.vue'
    import empty from 'components/empty/empty'
    import Velocity from 'velocity-animate'
    // import VelocityUI from 'velocity-animate/velocity.ui.js'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import { setTimeout } from 'timers';

    export default {
        data() {
            return {
                list_id: '0',
                num: 20,
                isShowMoreDetail: false,
                needflag: true,
                isShowMorebtn: false,
                list_desc: "",
                gedanType: 'online',
                favourBtnClassName: '',
                pagetype: '',
                isMass: false,
                isNotMass: true,
                isSee:false

            }
        },
        computed: mapGetters({
            gedanInfo: 'gedanInfo',
            gedanBaseInfo: 'gedanBaseInfo',
            songdata: 'gedanSongList',
            allsongdata: 'gedan_all_songlist'
        }),
        created() {
            eventBus.$on('isMass', this.massOpChanged);
        },
        mounted() {
            this.updateGedanData();
            document.body.addEventListener('click', this.clickEventListener);
            this.updateLayout();
        },
        updated(){
            setTimeout(()=>{
                this.$data.isSee = true;
            },100)
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.clickEventListener);
            eventBus.$off('isMass', this.massOpChanged);
        },
        components: {
            buttonCollect,
            gedanItem,
            songList,
            empty
        },
        watch: {
            gedanInfo: function() {
                let str = this.gedanInfo.list_desc;
                let json = this.commonFuns.getStrByts(str, this.needflag);
                
                this.isShowMorebtn = json.needflag;
                this.list_desc = json.str;
            },
            '$route': function() {
                this.updateGedanData();
            }
        },
        methods: {
            updateLayout() {
                return;
                let myWrapperDom = document.querySelector(".gedan-info-wrapper");
                let _mainHeight = parseFloat(this.domAction.getStyle(myWrapperDom, "height"));

                let sectionTitleDom = document.querySelector(".info-box");
                let _titleHeight = parseFloat(this.domAction.getStyle(sectionTitleDom, "height"));

                let _tableTitleDom = document.querySelector(".song-list-title");
                let _tableTitleHeight = parseFloat(this.domAction.getStyle(_tableTitleDom, "height"));

                let paginationBoxTotalHeight = 0;
                if (this.gedanType != "self") {
                    let paginationBoxDom = document.querySelector(".pagination-box");
                    let paginationBoxHeight = parseFloat(this.domAction.getStyle(paginationBoxDom, "height"));
                    let paginationBoxMarginTop = parseFloat(this.domAction.getStyle(paginationBoxDom, "margin-top"));
                    let paginationBoxMarginBottom = parseFloat(this.domAction.getStyle(paginationBoxDom, "margin-bottom"));
                    paginationBoxTotalHeight = paginationBoxHeight + paginationBoxMarginTop + paginationBoxMarginBottom;
                    if (!paginationBoxTotalHeight) {
                        paginationBoxTotalHeight = 0;
                    }

                    _mainHeight -= 60;
                }

                let _height = parseFloat(_mainHeight - _titleHeight - _tableTitleHeight - paginationBoxTotalHeight);
                console.log(_mainHeight);
                console.log(_titleHeight);
                console.log(_tableTitleHeight)
                console.log(paginationBoxTotalHeight)
                let scrollBarBodyDom = document.querySelector(".scrollBarBody");
                this.domAction.setStyle(scrollBarBodyDom, "height", _height + "px");
            },
            massOpChanged(val) {
                this.isMass = val
                this.isNotMass = !val
            },
            updateGedanData() {
                let list_id = this.$route.params.id;
                let gedan_type = this.$route.params.type
                console.log('gedan changed type is: ' + gedan_type + '  listid is: ' + list_id)
                this.list_id = list_id.toString();
                this.gedanType = gedan_type
                if (gedan_type == 'self') {
                    this.favourBtnClassName = 'disabled'
                } else {
                    this.favourBtnClassName = ''
                }
                this.$store.dispatch('updateSongListInfo', {
                    'list_type': gedan_type,
                    'list_id': list_id
                });
                this.getGedanInfo(list_id);

                if (gedan_type == 'self') {
                    this.favourBtnClassName = 'disabled'
                    this.getGedanAllSongList(list_id)
                } else {
                    this.getGedanSongList(list_id)
                }

                this.$store.dispatch('emptyLinesSelected');
                this.$store.dispatch('emptyMassOperationList');
            },
            clickEventListener(event) {
                event.stopPropagation()
                if (!event.target.classList.contains('show-detail-more-btn') && !event.target.classList.contains('floating-layer')) {
                    this.isShowMoreDetail = false
                }
            },
            getGedanInfo(list_id) {
                this.$store.dispatch('getGedanInfo', {
                        "list_id": list_id,
                        "withcount": "1"
                    }) ////0：不携带统计量信息 1：携带统计量信息
            },
            getGedanSongList(list_id) {
                this.$store.dispatch('getGedanSongList', {
                    "list_id": list_id,
                    "start": 0,
                    "num": this.num
                })
            },
            getGedanAllSongList(list_id) {
                let paramsJson = {
                    'data': {
                        'list_id': list_id,
                        "start": 0,
                        "num": 100
                    }
                }
                this.$store.dispatch('getGedanAllSongList', paramsJson)
            },
            editGedan() {
                this.$router.push('/editGedan')
            },
            onChangePage(page) {
                eventBus.$emit('isMass', false);
                document.querySelector('.song-list-wrapper').querySelectorAll('.active').forEach((item, index) => {
                    this.domAction.removeClass(item, 'active')
                })
                this.$nextTick(() => {
                    //情况选择集
                    this.$store.dispatch('emptyLinesSelected');

                    document.querySelector('.show').scrollTop = 0
                    let start = (page - 1) * this.num
                    this.$store.dispatch('getGedanSongList', {
                        "list_id": this.list_id,
                        "start": start,
                        "num": this.num
                    })

                })
            },
            playWholeSongList(paramsJson) {
                this.$store.dispatch('playWholeSongList', paramsJson)
            },
            enter(el, done) {
                Velocity(el, 'slideDown', {
                    duration: 200
                }, {
                    complete: done
                })
            },
            leave(el, done) {
                Velocity(el, 'slideUp', {
                    duration: 200
                }, {
                    complete: done
                })
            }
        },
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
        }

    }
</script>
<style scoped>
    .gedan-info-wrapper {
        padding: 0 17px;
        
    }
    
    .info-box {
        height: 160px;
        display: flex;
        margin: 28px auto;
    }
    
    .img-box {
        flex: 1 1 140px;
        position: relative;
        cursor: pointer;
    }
    
    .img-box .mask {
        opacity: 0;
        transition: opacity .5s;
        z-index: 1;
    }
    
    .img-box:hover .mask {
        opacity: 1
    }
    
    .img-box img {
        width: 136px;
        height: 136px;
        border: solid 2px #f2f2f2;
    }
    
    .info-detail {
        flex: 1 1 600px;
        margin-left: 28px;
        position: relative;
    }
    
    .info-title {
        font-size: 26px;
        color: #323232;
        font-weight: 500;
        /* max-height: 60px; */
        margin-top: 5px;
        overflow: hidden;
        height: 27px;
        line-height: 27px;
    }
    
    .detail {
        flex: 0 0 94%;
        color: #333333;
        font-size: 12px;
        height: 20px;
        line-height: 20px;
        position: relative;
        overflow: hidden;
        -webkit-line-clamp: 1;
        margin-top: 10px;
        margin-bottom: 20px;
    }

    .detail.toEditGedan {
        cursor: pointer;
    }

    .toEditGedan {
        cursor: pointer;
    }

    .detail.toEditGedan:hover {
        color: #e13228;
    }

    .toEditGedan:hover {
        color: #e13228;
    }
    
    .info-tags-box {
        display: flex;
        margin-top: 12px;
        color: #333333;
    }
    
    .info-user {
        max-width: 225px;
        overflow: hidden;
        display: flex;
        flex-flow: row nowrap;
        height: 14px;
        line-height: 14px;
    }
    
    .info-user .user {
        max-width: 100px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        color: #333333;
        font-size: 14px;
    }
    /*.info-user .user::before {
        width: 16px;
        height: 16px;
        display: inline-block;
        content: "";
        background: url(../../common/images/gedanuser_icon.png) no-repeat 0 50%;
        background-size: 16px auto;
        margin-right: 5px;
        vertical-align: middle;
    }*/
    
    .info-user .dtime {
        max-width: 100px;
        margin-left: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        color: #999999;
        height: 14px;
        line-height: 14px;
    }
    
    .info-tags {
        width: 250px;
        /* margin-left: 46px; */
        color: #333333;
        font-size: 12px;
        height: 12px;
        line-height: 12px;
    }

    .info-tags span {
        color: #e13228;
        font-size: 12px;
    }

    .info-tags .toEditGedan {
        color: #333333;
        cursor: pointer;
    }

    .info-tags .toEditGedan:hover {
        color: #e13228;
    }
    
    .detail-txt {
        display: flex;
    }
    
    .more-open-btn {
        position: absolute;
        right: 20px;
        top: 18px;
        width: 10px;
        height: 5px;
        background: url('~static/images/leftBar/icon12.svg') no-repeat;
    }
    
    .more-close-btn {
        position: absolute;
        right: 20px;
        top: 18px;
        width: 10px;
        height: 5px;
        background: url('~static/images/leftBar/icon12.svg') no-repeat;
        transform: rotate(180deg);
    }
    
    .detail-box {
        position: relative;
    }
    
    .floating-layer {
        width: 100%;
        box-shadow: 1px 1px 10px 5px #cfcfcf;
        position: absolute;
        top: 35px;
        right: 0;
        z-index: 10;
        border-radius: 5px;
        color: #8c8c8c;
        line-height: 20px;
        padding: 16px;
        box-sizing: border-box;
        background: #fff;
    }
    
    .floating-layer .layer-title {
        color: #333333;
        margin-bottom: 5px;
    }
    
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .8s
    }
    
    .fade-enter,
    .fade-leave-active {
        opacity: 0
    }
    
    .button-wrap {
        position: absolute;
        bottom: 0;
    }
    
    .empty-wraper {
        margin-top: 0;
    }
    
    .triangle-up {
        width: 0;
        height: 0;
        border: solid 8px #fff;
        border-left: solid 8px transparent;
        border-right: solid 8px transparent;
        border-top: none;
        position: absolute;
        top: -8px;
        right: 16px;
    }
</style>