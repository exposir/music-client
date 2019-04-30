<template>
<div class="radioIndex">
    <div class="radio_menu">
        <ul class="tagsBox">
            <li v-for="label in recommendAlbumLabel" :key="label">
                <div class="tags_name">
                    <a class="tags" @click.stop="selectLabel(label)" :class="{current_label:label == current_select_label}">{{label}}</a>
                </div>
            </li>
        </ul>
    </div>

    <div>
        <div v-if="is_show_recent" class="recent_recommend_content" >
        <section-title :data="{'title':'近期热门'}" v-if="recommendAlbumRecent.length>0"></section-title>
        <ul class="album-list">
            <li v-for="val in recommendAlbumRecent" :key="val.album_id">
                <rec-album-item :data="val" :fields="{'pic':true,'title':true,'author':true}"></rec-album-item>
            </li>
        </ul>
    </div>

    <div :class="{more_data_class: !is_show_recent}">
        <section-title :data="{'title':'更多推荐'}" v-if="is_show_recent && recommendAlbumMore.length>0"></section-title>
        <ul class="album-list">
            <li v-for="val in recommendAlbumMore" :key="val.album_id">
                <rec-album-item :data="val" :fields="{'pic':true,'title':true,'author':true}"></rec-album-item>
            </li>
        </ul>
    </div>

    <div class="pagination-box" v-if="recommendAlbumCount > page_size">
        <el-pagination small layout="prev, pager, next" :total="recommendAlbumCount" :page-size="page_size" :current-page.sync="current_page" @current-change="onChangePage"></el-pagination>
    </div>
    </div>

</div>
</template>
<script>
    import reportService from 'service/reportService'
    import scrollBar from '../scrollBar/scrollBar.js'
    import sectionTitle from 'components/public/section-title.vue'
    import recAlbumItem from 'components/public/rec-album-item.vue'
    import { setTimeout } from 'timers'
    import {
        mapGetters,
        mapActions
    } from 'vuex'

    export default {
        name: 'newsongindex',
        components: {
            sectionTitle,
            recAlbumItem
        },
        data() {
            return {
                page_size:48,
                current_page: 1,
                current_select_label: "推荐",
                current_select_label_index: 0,
                is_show_recent: true,
            }
        },
        computed: {
            ...mapGetters({
                recommendAlbumLabel: 'recommendAlbumLabel',
                recommendAlbumRecent: 'recommendAlbumRecent',
                recommendAlbumMore: 'recommendAlbumMore',
                recommendAlbumCount: 'recommendAlbumCount'
            })
        },
        watch: {
            '$route': function(to, from) {
                let labelIndex = this.$route.params.labelindex;
                if (labelIndex < 0 || labelIndex > this.recommendAlbumLabel.length) {
                    labelIndex = 0;
                }
                this.current_select_label = this.recommendAlbumLabel[labelIndex]
                if (this.current_select_label == this.recommendAlbumLabel[0]) {
                    console.log('route label is: ' + this.current_select_label);
                    this.is_show_recent = true;
                } else {
                    this.is_show_recent = false;
                }
                this.$store.dispatch('getCurrentPageNewSongData', {'page':0, 'label':this.current_select_label}) 
            }
        },
        created() {
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0 
            }

            let labelIndex = this.$route.params.labelindex;
            console.log(labelIndex)
            if (labelIndex < 0 || labelIndex > this.recommendAlbumLabel.length) {
                labelIndex = 0;
            }
            this.current_select_label = this.recommendAlbumLabel[labelIndex]
            this.current_select_label_index = labelIndex;

            console.log('current label is: ' + this.current_select_label)
            if (this.current_select_label != this.recommendAlbumLabel[0]) {
                this.is_show_recent = false;
            }
            
            this.$store.dispatch('getCurrentPageNewSongData', {'page':0, 'label':this.current_select_label})  
        },
        methods: {
            selectLabel(label) {
                if(label == '欧美'){
                    this.commonFuns.crmStatistics('album','oumei','click')
                }else if(label == '推荐'){
                     this.commonFuns.crmStatistics('album','recommend','click')
                }
                else if(label == '华语'){
                     this.commonFuns.crmStatistics('album','huayu','click')
                }else if(label == '日韩'){
                     this.commonFuns.crmStatistics('album','rihan','click')
                }else if(label == '付费专辑'){
                     this.commonFuns.crmStatistics('album','fufei','click')
                }
                this.current_select_label = label;
                this.current_page = 1;

                let labelIndex = 0;
                for (let i = 0; i < this.recommendAlbumLabel.length; i++) {
                    let val = this.recommendAlbumLabel[i];
                    if (val == label) {
                        labelIndex = i;
                        break;
                    }
                }
                if (labelIndex != 0) {
                    this.is_show_recent = false;
                } else {
                    this.is_show_recent = true;
                }
                this.current_select_label_index = labelIndex;

                this.$store.dispatch('clearCurrentPageNewSongData')

                this.$router.push({path: '/newSongIndex/' + labelIndex})
                this.paginationInit()
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

            onChangePage(page) {
                if (page > 1) {
                    this.is_show_recent = false;
                } else {
                    if (this.current_select_label != this.recommendAlbumLabel[0]) {
                        this.is_show_recent = false;
                    } else {
                        this.is_show_recent = true;
                    }
                }
                this.current_page = page;
                this.paginationInit(page)
                this.$nextTick(() => {
                    document.querySelector('.scrollBarBody').scrollTop = 0
                    this.$store.dispatch('getCurrentPageNewSongData', {'page':page-1, 'label':this.current_select_label})
                })
            },
        }
    }
</script>
<style scoped>
    .recent_recommend_content .section-title-box {
        margin: 65px 0 16px !important;
    }
    .radioIndex {
        padding: 0 19px 0 17px;
        width: 100%;
    }
    .radio_menu {
        position: absolute;
        width: 95%;
        height: 35px;
        padding-top: 5px;
        top: 34px;
        z-index: 3;
        background-color: #ffffff;
    }
    .radio_menu ul.tagsBox {
        background-color: #fbfbfb;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        height: 30px;
        width: 100%;
        border-radius: 2px;
    }
    .radio_menu ul li{
        margin-right: 50px;
    }
    .radio_menu ul li:last-child{
        margin-right: 0px;
    }
    .radio_menu ul li a{
        display: inline-block;
        color: #5a5a5a;
        font-size: 14px;
        line-height: 30px;
    }
    .radio_menu ul li a.current_label{
        color: #e45a54;
    }
    .album-list {
        display: flex;
        flex-flow: row wrap;
        align-content: center;
        margin-right: -16px;
	    /*justify-content: space-between;*/
    }
    .album-list li{
        /* flex: 0 0 20%; */
        width: 25%;
        display: flex;
        /*justify-content: center;*/
        align-items: flex-start;
        height: 200px;
        margin-bottom: 28px;
        transition: width .3s;
        -webkit-transition: width .3s;
    }
    .recent_recommend_content {
        padding-top: 10px
    }
    .more_data_class {
        margin-top: 60px
    }
    @media screen and (min-width: 1200px) {
        .album-list li {
            width: 20%;
        }
    }
</style>