<template>
<div class="gedanIndex">
<!--tag start-->
<div class="gd_menu">
    <div class="gd_menu_sign"  @click.stop="isShowAllChannel=!isShowAllChannel">
        <span>{{current_channel_name}}</span>
        <a class="all_btn"></a>
    </div>
    <dl class="gd_menu_default" id="gd_menu_default">
        <dt>热门标签：</dt>     
        <dd  v-for="channel in channelList.hot" :class="{visited:channel == current_channel_name}">
            <a @click.stop="setChannelname(channel)">{{channel}}</a>
        </dd>
    </dl>       
    <div class="classy">
        <a class="veryhot" :class="{current:order_type == 1}" @click="setOrdertype(1)">最热</a> | <a class="verynew" :class="{current:order_type == 0}" @click="setOrdertype(0)">最新</a>
    </div>
    <!--gedan cate layer start-->
    <transition  v-on:enter="enter" v-on:leave="leave" > 
        <div class="gedan-cate-float-layer" v-show="isShowAllChannel">  
            <div class="triangle-up"></div>
            <div class="gd_menu_list">
                <h3 class="title"><a class="all_btn" @click.stop="setChannelname('全部')">全部</a>
                    <a class="close-btn" @click.stop="isShowAllChannel=false"></a>
                </h3>
                <ul class="tagsBox" id="tagBox">
                    <li v-for="channel in channelList.tags">
                        <div class="tags_name">
                            <a class="tags">{{channel.first}}</a>
                        </div>
                        <div class="tags_con">
                            <a v-for="c_channel in channel.second" @click.stop="setChannelname(c_channel)" :class="{visited:c_channel == current_channel_name}">{{c_channel}}</a>
                        </div>
                    </li>
                    
                </ul>
            </div>
        </div>
    </transition>
    <!--gedan cate layer end-->
</div>
 <!--tag end-->
 <div class="">
    <gedan-list :data="gedandata.diyInfo" :fields="{'pic':true,'title':true,'listen_num':true}"></gedan-list>
    <div class="pagination-box" v-if="gedandata.nums > size">
        <el-pagination small layout="prev, pager, next" :total="gedandata.nums" :page-size="size" :current-page.sync="currentpage" @current-change="onChangePage"  @click.native="commonFuns.crmStatistics('gedan','page')"></el-pagination>
    </div>
</div>
</div>
</template>
<script>
    import reportService from 'service/reportService'
    import gedanList from 'components/public/gedan-list.vue'
    import scrollBar from '../scrollBar/scrollBar.js'
    import Velocity from 'velocity-animate'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    export default {
        name: 'gedanIndex',
        data() {
            return {
                size: 30,
                isShowAllChannel: false,
                current_channel_name: "全部",
                order_type: 1,
                currentpage: 1
            }
        },
        computed: mapGetters({
            gedandata: 'gedanList',
            channelList: 'channelList',
            totalpage: 'gedanList_pagenum'
        }),
        created() {
            this.order_type = this.$route.params.ordertype
            this.current_channel_name = this.$route.params.channelname
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0
            }
            this.$store.dispatch('getChannelList')
            this.$store.dispatch('getGedanlist', {
                "channelname": encodeURIComponent(this.current_channel_name),
                "size": this.size,
                "offset": 0,
                "order_type": this.order_type
            })
            reportService.clickReport({
                'type': 'click',
                'page': 'musicwindow',
                'pos': 'gedan'
            })

            document.addEventListener('click', this.clickEventListener);
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.clickEventListener);
        },
        components: {
            gedanList
        },
        watch: {
            '$route': function(to, from) {
                let channelName = this.$route.params.channelname
                let ordertype = this.$route.params.ordertype
                this.current_channel_name = channelName
                this.order_type = ordertype
                this.$store.dispatch('getGedanlist', {
                    "channelname": encodeURIComponent(this.current_channel_name),
                    "size": this.size,
                    "offset": 0,
                    "order_type": this.order_type
                })

            }
        },
        methods: {
            clickEventListener(event) {
                if (this.isShowAllChannel) {
                    if (!event.target.classList.contains('layer_box_wrapper')) {
                        this.isShowAllChannel = false;
                    }
                }
            },
            setOrdertype(order_type) { //最新、最热
                this.isShowAllChannel = false
                this.order_type = order_type
                this.currentpage = 1
                this.$store.dispatch('getGedanlist', {
                    "channelname": encodeURIComponent(this.current_channel_name),
                    "size": this.size,
                    "offset": 0,
                    "order_type": this.order_type
                })
                this.$router.push({
                    path: '/gedanIndex/' + encodeURIComponent(this.current_channel_name) + '/' + this.order_type
                })
                this.paginationInit()
                if(order_type == 0){
                    this.commonFuns.crmStatistics('gedan','new','click')
                }
            },
            setChannelname(name) {
                this.isShowAllChannel = false
                this.current_channel_name = name
                this.currentpage = 1
                this.commonFuns.crmStatistics('gedan','hot','click')
                this.$store.dispatch('getGedanlist', {
                    "channelname": encodeURIComponent(this.current_channel_name),
                    "size": this.size,
                    "offset": 0,
                    "order_type": this.order_type
                })
                this.$router.push({
                    path: '/gedanIndex/' + encodeURIComponent(this.current_channel_name) + '/' + this.order_type
                })
                this.paginationInit()
            },
            onChangePage(page) {
                this.paginationInit(page)
                this.$nextTick(() => {
                    document.querySelector('.scrollBarBody').scrollTop = 0
                    let offset = (page - 1) * this.size
                    this.$store.dispatch('getGedanlist', {
                        "channelname": encodeURIComponent(this.current_channel_name),
                        "size": this.size,
                        "offset": offset,
                        "order_type": this.order_type
                    })
                })
            },
            paginationInit(page = 1) {
                let paginationDom = document.querySelector('.pagination-box')
                if (paginationDom) {
                    let numbersDom = paginationDom.querySelectorAll('.number')
                    numbersDom.forEach((value, index) => {
                        let valueIndex = parseFloat(value.innerHTML)
                        if (valueIndex === page) {
                            value.classList.add('active')
                        } else {
                            value.classList.remove('active')
                        }
                    })
                }
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
        }
    }
</script>
<style scoped>
    .gedanIndex {
        padding: 0 17px;
    }
    
    .gd_menu {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 46px;
        font-size: 0;
        z-index: 1000;
        position: relative;
        margin: 10px 0;
    }
    
    .gd_menu a {
        font-size: 12px;
    }
    
    .gd_menu_default {
        display: flex;
    }
    
    .gd_menu .gd_menu_sign {
        position: relative;
        display: flex;
        width: 88px;
        height: 22px;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 13px;
        border: solid 1px #e3e3e3;
    }
    
    .gd_menu .gd_menu_sign span {
        color: #333333;
        font-size: 12px;
    }
    
    .gd_menu .gd_menu_sign a {
        width: 12px;
        height: 7px;
        background: url('~static/images/leftBar/icon12.svg') no-repeat;
        margin-left: 10px;
    }
    
    .classy {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 101px;
        height: 19px;
        font-size: 19px;
        color: #e3e3e3;
    }
    
    .classy a {
        font-size: 13px;
        line-height: 19px;
    }
    
    .classy .current {
        color: #e13228;
    }
    
    .gd_menu .gd_menu_default {}
    
    .gd_menu .gd_menu_default dt {
        color: #333333;
        font-size: 12px;
        height: 38px;
        line-height: 38px;
        padding: 0 20px 0 0;
    }
    
    .gd_menu .gd_menu_default dd {
        margin-right: 3px;
    }
    
    .gd_menu .gd_menu_default dd a {
        height: 38px;
        line-height: 38px;
        padding: 0 15px 0 0;
    }
    
    .gd_menu .gd_menu_default dd a:hover {
        color: #e13228;
    }
    
    .gd_menu .gd_menu_default dd.visited a,
    .gd_menu .gd_menu_default dd.visited a:hover,
    .tagsBox .tags_con a.visited {
        color: #e13228;
    }
    /*gedan cate start*/
    
    .gedan-cate-float-layer {
        position: absolute;
        width: 649px;
        left: 0;
        top: 38px;
        margin-top: 4px;
        z-index: 10;
        margin-left: -2px;
        border: solid 1px #bcbcbc;
        border-radius: 10px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, .5);
    }
    
    .gedan-cate-float-layer .gd_menu_list {
        background: #fff;
        z-index: 10;
        border-radius: 8px;
        display: flex;
        flex-flow: row wrap;
    }
    
    .gedan-cate-float-layer .gd_menu_list .title {
        display: flex;
        width: 100%;
        padding-left: 20px;
        height: 36px;
        line-height: 36px;
        overflow: hidden;
        border-bottom: 1px solid #f2f2f2;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }
    
    .gedan-cate-float-layer .trangle {
        position: absolute;
        top: 0;
        right: 0;
        width: 13px;
        height: 13px;
    }
    
    .gedan-cate-float-layer .close-btn {
        width: 12px;
        height: 12px;
        background: url(./images/icon1.png) no-repeat;
        position: absolute;
        top: 10px;
        right: 14px;
    }
    
    .gedan-cate-float-layer ul {
        position: relative;
        z-index: 1;
        overflow: hidden;
        width: 649px;
        padding-left: 20px;
        padding-bottom: 12px;
        display: flex;
        flex-flow: row wrap;
    }
    
    .gedan-cate-float-layer li {
        display: flex;
        flex-flow: row wrap;
        margin-top: 15px;
    }
    
    .gedan-cate-float-layer li a {
        position: relative;
        margin-right: 28px;
        text-align: left;
        line-height: 26px;
        color: #333333;
    }
    
    .gedan-cate-float-layer a.active {
        color: #e13228;
    }
    
    .gedan-cate-float-layer .tags_con {
        width: 560px;
        padding-left: 10px;
        border-left: solid 1px #f2f2f2;
        display: flex;
        flex-flow: row wrap;
    }
    
    .gedan-cate-float-layer .tags_con a:hover {
        color: #e13228;
    }
    
    .gedan-cate-float-layer .tags_name {}
    /*gedan cate end*/
    
    .trangle-box {
        position: absolute;
        top: -1px;
        right: -1px;
        background: #fff;
        width: 12px;
        height: 12px;
    }
    
    .trangle-box .trangle-bottomleft {
        width: 0;
        height: 0;
        border-bottom: 12px solid #f2f2f2;
        border-right: 12px solid transparent;
        position: absolute;
        right: 0;
        top: 0;
    }
    
    .trangle-box .trangle-topright {
        width: 0;
        height: 0;
        border-top: 12px solid #ffffff;
        border-left: 12px solid transparent;
        position: absolute;
        right: 0;
        top: 0;
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
        left: 51px;
    }
    
    .clearfix:after {
        content: "";
        display: block;
        height: 0;
        clear: both;
        visibility: hidden
    }
    
    .gedanIndex .gedan_list {
        margin-top: 10px;
    }
    
    .fade-enter-active {
        transition: all 0.5s cubic-bezier(0, 1, .5, 1);
    }
    
    .gedanIndex .pagination-box {
        margin: -5px auto 15px auto;
    }
</style>