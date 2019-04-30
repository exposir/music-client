<template>
    <div class="singerlist">
        <singer-list v-if="isShowImg"  v-bind:data="imglist" :from="singerIndexlist" :fields="{'pic':true,'title':true}"></singer-list>
         <ul class="txt-list">
            <li v-for="(val,index) in singerdata.artist">
                <router-link @click.native="commonFuns.crmStatistics('singer','singerName')"  :to="'/music/public/singer/'+val.artist_id+'/0'">{{val.name}}</router-link>
            </li>
        </ul>

        <div class="pagination-box" v-if="total > firstPageSize">
            <el-pagination small layout="prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentpage"  @current-change="onChangePage"></el-pagination>
        </div>
    </div>
</template>
<script scoped>
    import singerList from 'components/public/singer-list.vue'
    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'singer-index-list',
        data() {
            return {
                isShowImg: true,
                area: 0,
                sex: 0,
                abc: 0,
                firstPageSize: 90,
                pageSize: 100,
                isShoeName: true,
                imgarr: [],
                txtarr:[],
                singerIndexlist: 'singerIndexlist',
                currentpage: 1
                
            }
        },
        computed: {
            ...mapGetters({
                singerdata: 'singerList'
            }),
            imglist() {
                this.getimgLenght()
                
                return this.imgarr
            },
            txtlist() {
                // console.log(this.txtarr)
                return this.txtarr
            },
            total() {
                return parseFloat(this.singerdata.nums)
            }
        },
        created: function() {
            let _self = this
            window.onresize = function () {
                _self.getMainH()
                _self.getimgLenght()
            }
            this.loading();
        },
        components: {
            singerList
        },
        methods: {
            getMainH() {
                let mainMusicWrapperDom = document.querySelector('.mainMusicWrapper')
                if (mainMusicWrapperDom) {
                    let mainMusicWrapperHeight = this.domAction.getStyle(mainMusicWrapperDom, 'height')
                    let mainHeaderDom = mainMusicWrapperDom.querySelector('.main-menu-box')
                    let mainHeaderDomTotalHeight = this.domAction.getStyle(mainHeaderDom, 'height')

                    let mainWrapperHeight = parseFloat(mainMusicWrapperHeight) - parseFloat(mainHeaderDomTotalHeight)

                    let scrollBarBodyDom = document.querySelector('.scrollBarBody')
                    this.domAction.setStyle(scrollBarBodyDom, 'height', mainWrapperHeight + 'px')                    
                }
            },
            getimgLenght() {
                if (document.body.clientWidth >= 1200){
                    this.imgarr = this.singerdata.singerImgListBig
                    this.txtarr = this.singerdata.singerTxtListBig
                }else {
                    this.imgarr = this.singerdata.singerImgList
                    this.txtarr = this.singerdata.singerTxtListBig
                }
            },
            loading() {
                this.area = typeof this.$route.query.area != 'undefined' ? this.$route.query.area : this.area
                this.sex = typeof this.$route.query.sex != 'undefined' ? this.$route.query.sex : this.sex
                this.abc = typeof this.$route.query.abc != 'undefined' ? this.$route.query.abc : this.abc
                this.$store.dispatch('getSingerList', {
                    limit: this.firstPageSize,
                    area: this.area,
                    sex: this.sex,
                    abc: this.abc,
                    offset: 0
                })

                this.isShowImg = true
                this.paginationInit()
            
            },
            onChangePage(page) {
                this.paginationInit(page)
                this.$nextTick(() => {
                    document.querySelector('.scrollBarBody').scrollTop = 0
                    let offset = (page - 2) * this.pageSize + this.firstPageSize
                    this.$store.dispatch('getSingerList', {
                        limit: this.pageSize,
                        area: this.area,
                        sex: this.sex,
                        abc: this.abc,
                        offset: offset
                    })
                    if (page > 1) {
                        this.isShowImg = false
                    } else {
                        this.isShowImg = true
                    }
                })
            },
            paginationInit(page = 1) {
                this.currentpage = page

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
        },
        watch: {
            '$route' (to, from) {
                this.loading();
            }
        }
    }
</script>
<style scoped>
    .singerlist {
        padding: 26px 30px 0 30px;
    }
    
    .page-box {
        margin: 15px auto;
        width: 300px;
    }
    
    .txt-list {
        width: 742px;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        margin-top: 20px;
        transition: width .3s;
        -webkit-transition: width .3s;
    }
    
    .txt-list li {
        width: 126px;
        height: 42px;
        line-height: 42px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .txt-list a:hover {
        color: #e13228;
    }
    
    @media screen and (min-width: 1200px) {
        .txt-list {
            width: 880px;
        }
    }
</style>