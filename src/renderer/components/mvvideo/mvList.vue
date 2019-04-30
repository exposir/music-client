<template>
    <div class="mv-release">
        <div class="mv_menu">
            <dl class="mv_menu_default" id="mv_menu_default">
                <dt :class="{visited:'全部' == current_channel_name}"><a @click.stop="setAllname('全部')">全部</a></dt>     
                <dd :class="{visited:'内地' == current_channel_name}"><a @click.stop="setChannelname('内地')">内地</a></dd>
                <dd :class="{visited:'港台' == current_channel_name}"><a @click.stop="setChannelname('港台')">港台</a></dd>
                <dd :class="{visited:'欧美' == current_channel_name}"><a @click.stop="setChannelname('欧美')">欧美</a></dd>
                <dd :class="{visited:'日本' == current_channel_name}"><a @click.stop="setChannelname('日本')">日本</a></dd>
                <dd :class="{visited:'韩国' == current_channel_name}"><a @click.stop="setChannelname('韩国')">韩国</a></dd>
                <dd :class="{visited:'现场版' == current_channel_name}"><a @click.stop="setVersionname('现场版')">现场</a></dd>
            </dl> 
            <div class="classy">
                <a class="veryhot" :class="{current:order_type == 0}" @click="setOrdertype(0)">最热</a> | <a class="verynew" :class="{current:order_type == 1}" @click="setOrdertype(1)">最新</a>
            </div>
            <div class="trangle"></div>
        </div>
        <ul class="mvRecomm-list">
            <li v-for="(data,index) in mvList.mvSearchList">
                <div class="mv-item-box">
                    <div class="img-border">
                        <img v-if="data.thumbnail" v-lazy="data.thumbnail" alt="">
                        <img v-else src="static/images/default_pic.svg" class="default-pic">
                        <div class="mask" @click="playmv(data.mv_id)">
                        </div>
                        <div class="img-play" @click="playmv(data.mv_id)"></div>
                    </div>
                    <p class="title-top" :title="data.title" @click="playmv(data.mv_id)">
                        {{data.title}}
                    </p>
                    <p class="title-bottom" :title="data.artist">
                        <router-link :to="'/music/public/singer/'+data.all_artist_id+'/0'">{{data.artist}}</router-link>
                    </p> 
                </div>
            </li>
        </ul>
        <div class="pagination-box" v-if="mvList.total > size">
            <el-pagination small layout="prev, pager, next" :total="mvList.total" :page-size="size" :current-page.sync="currentpage" @current-change="onChangePage"></el-pagination>
        </div>
    </div>
</template>
<script>
    import { mapGetters,mapActions } from 'vuex'
    import mvService from '../../service/mvService'
    import playMv from '../../utils/mv/playMv.js'   

    export default {
        name: 'mvList',
        data(){
            return{
                size: 30,
                currentpage: 1,
                current_channel_name: "全部",
                order_type: 0
            }
        },
        computed: {
            ...mapGetters({
                mvList: 'mvList'
            })
        },
        created() {
            this.$store.dispatch('getSearchList', {
                        "provider": "11,12",
                        "order": 0,
                        "page_size": this.size,
                        "page_num": 1
                    })
        },
        methods: {
            setOrdertype(order_type) { //最新、最热
                this.order_type = order_type
                this.currentpage = 1
                this.$store.dispatch('getSearchList', {
                    "provider": "11,12",
                    "order": this.order_type,
                    "page_size": this.size,
                    "page_num": 1,
                    "area": (this.current_channel_name == '全部' || this.current_channel_name == '现场版')?'':this.current_channel_name,
                    "mv_versions": this.current_channel_name == '现场版'?'现场版':''
                })
                this.paginationInit()
            },
            setChannelname(name) {
                this.current_channel_name = name
                this.currentpage = 1
                this.$store.dispatch('getSearchList', {
                    "area": this.current_channel_name == '全部'?'':this.current_channel_name,
                    "provider": "11,12",
                    "order": this.order_type,
                    "page_size": this.size,
                    "page_num": 1
                })
                this.paginationInit()
            },
            setAllname(name) {
                this.current_channel_name = name
                this.currentpage = 1
                this.$store.dispatch('getSearchList', {
                    "provider": "11,12",
                    "order": this.order_type,
                    "page_size": this.size,
                    "page_num": 1
                })
                this.paginationInit()
            },
            setVersionname(name) {
                this.current_channel_name = name
                this.currentpage = 1
                this.$store.dispatch('getSearchList', {
                    "mv_versions": this.current_channel_name,
                    "provider": "11,12",
                    "order": this.order_type,
                    "page_size": this.size,
                    "page_num": 1
                })
                this.paginationInit()
            },
            playmv(mv_id) {
                let data =  {'mv_id':mv_id}
                let _self = this;
                mvService.getMvPlayUrl(data, res => {
                    if (res.error_code == 22000) {
                        playMv.playMv(res.result ? res.result : {})
                    }
                }, function(err) {
                    console.log(err)
                })  
            },
            onChangePage(page) {
                this.paginationInit(page)
                this.$nextTick(() => {
                    document.querySelector('.scrollBarBody').scrollTop = 0
                    if (this.current_channel_name == '现场版') {
                        this.$store.dispatch('getSearchList', {
                            "provider": "11,12",
                            "order": this.order_type,
                            "page_size": this.size,
                            "page_num": page,
                            "mv_versions": this.current_channel_name
                        })
                    } else {
                        this.$store.dispatch('getSearchList', {
                            "provider": "11,12",
                            "order": this.order_type,
                            "page_size": this.size,
                            "page_num": page,
                            "area": this.current_channel_name == '全部' ? '':this.current_channel_name
                        })
                    }

                })
            },
            paginationInit(page = 1) {
                let paginationDom = document.querySelector('.pagination-box')
                if (paginationDom) {
                    let numbersDom = paginationDom.querySelectorAll('.number')
                    // numbersDom.forEach((value, index) => {
                    //     let valueIndex = parseFloat(value.innerHTML)
                    //     if (valueIndex === page) {
                    //         value.classList.add('active')
                    //     } else {
                    //         value.classList.remove('active')
                    //     }
                    // })
                }
            }
        }
    }
</script>
<style scoped>
    .mv-release {
        padding: 0 17px;
    }
    .mv_menu {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 46px;
        font-size: 0;
        z-index: 1000;
        position: relative;
        margin: 10px 0;
        background: #f7f7f7;
    }
    .mv_menu_sign {
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
    .mv_menu a {
        font-size: 12px;
    }
    
    .mv_menu_default {
        display: flex;
    }

    .mv_menu_default dt {
        padding: 0 50px 0 20px !important;
    }
    
    .mv_menu .mv_menu_sign {
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
    
    .mv_menu .mv_menu_sign span {
        color: #333333;
        font-size: 12px;
    }
    
    .mv_menu .mv_menu_sign a {
        width: 12px;
        height: 7px;
        background: url('~static/images/leftBar/icon12.svg') no-repeat;
        margin-left: 10px;
    }

    .trangle {
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-top:8px solid #ffffff;
        border-right:8px solid #ffffff;
        border-bottom:8px solid #cccccc;
        border-left:8px solid #cccccc;
    }

    .classy {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 101px;
        height: 19px;
        font-size: 19px;
        color: #e3e3e3;
        margin-right: 26px;
    }
    
    .classy a {
        font-size: 13px;
        line-height: 19px;
    }
    
    .classy .current {
        color: #e13228;
    }
    
    .mv_menu .mv_menu_default dt {
        color: #333333;
        font-size: 12px;
        height: 38px;
        line-height: 38px;
        padding: 0 20px 0 0;
    }
    
    .mv_menu .mv_menu_default dd {
        margin-right: 3px;
    }
    
    .mv_menu .mv_menu_default dd a {
        height: 38px;
        line-height: 38px;
        padding: 0 15px 0 0;
    }
    
    .mv_menu .mv_menu_default dd a:hover {
        color: #e13228;
    }
    
    .mv_menu .mv_menu_default dd.visited a,
    .mv_menu .mv_menu_default dd.visited a:hover,
    .tagsBox .tags_con a.visited {
        color: #e13228;
    }

    .mv_menu .mv_menu_default dt.visited a,
    .mv_menu .mv_menu_default dt.visited a:hover,
    .tagsBox .tags_con a.visited {
        color: #e13228;
    }

    .mvRecomm-list {
        display: flex;
        flex-flow: row wrap;
        margin-top: 15px;
        height: auto;
        overflow: hidden;
        justify-content: flex-start;
    }

    .mvRecomm-list li {
        width: 20%;
    }
    
    @media screen and (min-width: 1200px) {
        .mvRecomm-list li {
            width: 16.5%;
        }
    }

    .mv-item-box {
        width: 140px;
        height: auto;
    }
    
    .mvinfo.mv-item-box {
        width: 160px;
        height: 160px;
    }
    
    .img-border {
        width: 100%;
        height: 78px;
        margin-bottom: 8px;
        position: relative;
        border: solid 1px #f2f2f2;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #ECECEC;
    }
    
    .mvinfo.mv-item-box .img-border {
        height: 160px;
    }
    
    .img-border img[lazy=loaded] {
        width: 100%;
        height: 100%;
    }
    
    .img-border .mask {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        z-index: 1;
        transition: opacity .5s;
    }
    
    .img-border:hover .mask {
        opacity: 1;
    }
    
    .img-border .mask a {
        width: 100%;
        height: 100%;
        display: block;
    }
    
    .img-border:hover .mask {
        display: block;
    }
    
    .img-border .img-play {
        width: 36px;
        height: 36px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -18px;
        margin-left: -18px;
        display: none;
        cursor: pointer;
        background: url('~static/images/miniBar/icon_stop.svg') no-repeat;
        z-index: 2;
    }
    
    .img-border:hover .img-play {
        display: block;
    }
    
    .title-top {
        height: 22px;
        width: 100%;
        line-height: 22px;
        color: #333333;
        /* cursor: pointer; */
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-size: 14px;
    }
    
    .title-bottom {
        width: 100%;
        cursor: default;
        color: #999999;
        height: 18px;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .title-bottom a {
        color: #999999;
        font-size: 12px;
    }
    
    .mv-item-box a:hover {
        color: #e13228;
    }
    
    .img-border img.default-pic {
        width: 100%;
        height: 100%;
    }

    .mv-release .pagination-box {
        margin: 0 auto 15px auto;
    }
</style>