<template>
    <div>
        <div class="mv-release">
            <ul class="mvRecomm-list">
                <li v-for="(data,index) in mvBigMan.mvBigManList">
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
                            {{data.artist}}
                        </p> 
                    </div>
                </li>
            </ul>
            <div class="pagination-box" v-if="mvBigMan.total > size">
                <el-pagination small layout="prev, pager, next" :total="mvBigMan.total" :page-size="size" :current-page="currentpage" @current-change="onChangePage"></el-pagination>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters,mapActions } from 'vuex'
    import mvService from '../../service/mvService'
    import playMv from '../../utils/mv/playMv.js'   

    export default {
        name: 'mvBigman',
        data(){
            return{
                size: 30,
                currentpage: 1
            }
        },
        computed: {
            ...mapGetters({
                mvBigMan: 'mvBigMan'
            })
        },
        created() {
            this.$store.dispatch('getBigManList', {
                        "size": this.size,
                        "offset": 0,
                        "mid": 4
                    })
        },
        methods: {
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
                    let offset = (page - 1) * this.size
                    this.$store.dispatch('getBigManList', {
                        "size": this.size,
                        "offset": offset,
                        "mid": 4
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
            }
        }
    }
</script>
<style scoped>
    .recom-banner {
        margin: 0 auto;
        padding-bottom: 12px;
        overflow: hidden;
    }

    .mv-release {
        padding: 0 17px;
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