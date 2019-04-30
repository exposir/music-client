<template>
    <div class="new-rec-bangdan">
        <div class="rec-wrapper">
            <div class="rec-title">
                <div class="rec-a"><span class="play-all" @click="playWholeSongList({'songArray':data})"><p class="left-margin">播放全部</p></span></div>
                <div class="rec-a">
                    <span class="download-all" @click="showDownload()" @click.stop>
                        <p class="left-margin">下载全部</p>
                    </span>
                    <ul class="import-con">
                        <li v-if="isHaveDonglownloadType(0)" @click="downloadSelectSongs(0)">无损品质
                            <i class="download-vip-icon"></i>
                        </li>
                        <li v-if="isHaveDonglownloadType(1)" @click="downloadSelectSongs(1)">高品质</li>
                        <li v-if="isHaveDonglownloadType(2)" @click="downloadSelectSongs(2)">标准品质</li>
                    </ul>
                </div>
                
                <div class="selectBtn">
                    <el-pagination small layout="prev, next" :total="30" @current-change="onChangePage"></el-pagination>
                    <span class="left-btn"></span><span class="select-title">{{rec_page}}/3</span><span class="right-btn"></span>
                </div>
            </div>
            <div class="slide-content">
                <swiper :options="swiperOption">
                    <swiper-slide>
                        <dailyItem :data="recomDailyList"></dailyItem>
                    </swiper-slide>
                    <swiper-slide>
                        <dailyItem :data="recomDailyList_2"></dailyItem>
                    </swiper-slide>
                    <swiper-slide>
                        <dailyItem :data="recomDailyList_3"></dailyItem>
                    </swiper-slide>    
                    <div class="swiper-button-prev" slot="button-prev"></div>
                    <div class="swiper-button-next" slot="button-next"></div>
                </swiper>
            </div>
        </div>
    </div>
</template>
<script>
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import dailyItem from 'components/public/daily-item.vue'
import {
    mapGetters,
    mapActions
} from 'vuex'

    export default {
        components: {
            dailyItem,
            swiper,
            swiperSlide
        },
        computed: mapGetters({
            loginStatus: 'loginStatus',
            recomDailyList: 'recomDailyList',
            recomDailyList_2: 'recomDailyList_2',
            recomDailyList_3: 'recomDailyList_3'
        }),
        props: {
            titleData: Object,
            data: Array
        },
        data() {
            return {
                select_index_array: [],
                favorstate: '',
                rec_page: 1,
                swiperOption: {
                    effect : 'coverflow',
                    pagination: {
                        el: '.swiper-pagination'
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev'
                    }
                }
            }
        },
        created() {
            this.$store.dispatch('getRecommendDaily',{ 'page_size':30,'page_no':1 })
        },
        methods: {
            playWholeSongList(paramsJson) {
                if (this.domAction.hasClass(event.currentTarget, 'disabled')) {
                    return false
                }
                this.$store.dispatch('playWholeSongList', paramsJson)
                eventBus.$emit('isShowAddMusicIcon', true)
            },
            isHaveDonglownloadType(download_type) {
                if (this.data.length <= 0) {
                    return false;
                }

                if (this.data.length > 1) {
                    return true;
                }

                let param = {
                    sq: [],
                    hq: [],
                    normal: []
                };
                this.commonFuns.getSongBitrates(this.data[0], param);

                if (download_type === 0) {
                    return param.sq.length > 0;
                } else if (download_type === 1) {
                    return param.hq.length > 0;
                } else {
                    return param.normal.length > 0;
                }
            },
            onChangePage(page) {
                this.select_index_array = []
                this.rec_page = page
                this.$store.dispatch('getRecommendDaily',{ 'page_size':10,'page_no':page })
            },
            downloadSelectSongs(download_type) {
                if (!this.loginStatus) {
                    if (download_type == 0) {
                    this.$store.dispatch("TpassLogin");
                    return;
                    }
                }

                let download_array = [];
                for (let i = 0; i < this.data.length; i++) {
                    let song = this.data[i];
                    if (this.commonFuns.isSongCanDownload(song)) {
                    download_array.push(song);
                    }
                }
                // console.log(download_array)
                for (let i = 0; i < download_array.length; i++) {
                    let songInfo = download_array[i];
                    let param = {
                    sq: [],
                    hq: [],
                    normal: []
                    };
                    let empty = [];
                    this.commonFuns.getSongBitrates(songInfo, param);
                    let sq = param.sq.concat(empty);
                    let hq = param.hq.concat(empty);
                    let normal = param.normal.concat(empty);

                    let timestamp = Date.parse(new Date());
                    let dt = normal[0];
                    if (download_type === 0) {
                    if (sq.length > 0) {
                        dt = sq[0];
                    } else if (hq.length > 0) {
                        dt = hq[0];
                    }
                    } else if (download_type === 1) {
                    if (hq.length > 0) {
                        dt = hq[0];
                    }
                    }
                    let songid = this.commonFuns.getSongId(songInfo);

                    let me = this;
                    if (download_array.length === 1) {
                    downloadingService.getDownloadUrl(
                        {
                        dt: dt,
                        timestamp: timestamp,
                        songid: songid
                        },
                        function(jsonData) {
                        let error_code = jsonData.error_code;
                        if (error_code == 22000) {
                            me.$store.dispatch("addDownloadingItem", {
                            dt: dt,
                            song_info: jsonData.songinfo
                            });
                            me.commonFuns.createTips("已添加到下载队列", "success");
                        } else {
                            if (error_code == 22469) {
                            //单点售卖歌曲、专辑
                            if (jsonData.hasOwnProperty("result")) {
                                me.$store.dispatch(
                                "showSaleSongMessageBox",
                                jsonData.result
                                );
                            }
                            } else if (error_code == 22467) {
                            //全球付费
                            me.$store.dispatch("showOpenVipMessageBox", songInfo);
                            } else {
                            console.log(
                                "song.download return failed, code is: " + error_code
                            );
                            }
                        }
                        },
                        function() {}
                    );
                    } else {
                    me.$store.dispatch("addDownloadingItem", {
                        dt: dt,
                        song_info: songInfo
                    });
                    }
                }

                if (download_array.length > 1) {
                    this.commonFuns.createTips("已添加到下载队列", "success");
                }
            }
        }
    }
</script>
<style scoped>
    .el-pagination .btn-next, .el-pagination .btn-prev {
        background-color: transparent !important;
        border: 0 !important;
    }
    .el-pagination .btn-prev {
        margin-left: -12px;
    }
    .el-pagination .btn-next {
        margin-left: 36px;
    }
    .el-pagination button.disabled {
        background-color: transparent !important;
    }
    .el-pagination button {
        border: 0 !important;
    }
    .el-pagination {
        border: 0 !important;
    }

 .swiper-slide {
    width: 100% !important;
}   
.new-rec-bangdan {
    width: 100%;
}
.rec-wrapper {
    width: 100%;
    height: 367px;
    background: rgba(229,228,228,0.15);
}
.rec-title {
    width: 100%;
    height: 61px;
    display: flex;
    align-items:center;
    position: relative;
}
.rec-title .rec-a {
    height: 20px;
    width: 75px;
    margin-left: 15px;
    display: flex;
    align-items: center;
}
.rec-title div span:hover {
    cursor: pointer;
}
.rec-title div .play-all {
    background: url('~static/images/btn_play.svg') no-repeat;
    background-size: 16px 16px;
}
.rec-title div .download-all {
    background: url('~static/images/btn_download.svg') no-repeat;
}
.rec-title div span .left-margin {
    margin-left: 24px;
    font-size: 12px;
}
.rec-title .selectBtn {
    position: absolute;
    top: 17px;
    right: 16px;
    width: 66px;
    height: 14px;
}
.rec-title .selectBtn .left-btn {
    width: 6px;
    height: 10px;
    margin-top: 9px;
    background: url('~static/images/left_btn.png') no-repeat;
}
.rec-title .selectBtn .left-btn:hover {
    background: url('~static/images/left_select_btn.png') no-repeat;
}
.rec-title .selectBtn .select-title {
    width: 54px;
    height: 10px;
    font-size: 14px;
    color: #999999;
    display: block;
    text-align: center;
    position: absolute;
    top: 3px;
    left: 9px;
}
.rec-title .selectBtn .right-btn {
    width: 6px;
    margin-top: 9px;
    height: 10px;
    background: url('~static/images/right_btn.png') no-repeat;
}
.rec-title .selectBtn .right-btn:hover {
    background: url('~static/images/right_select_btn.png') no-repeat;
}
.import-con {
  position: absolute;
  width: 120px;
  height: 110px;
  box-shadow: 0px 0px 20px 2px #d2d2d2;
  border: 1px solid #f2f2f2;
  background: #fff;
  left: 82px;
  top: 46px;
  display: none;
  z-index: 10;
}

.import-con li {
  height: 37px;
  padding-left: 13px;
  line-height: 37px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}

.slide-content {
    height: 300px;
    width: 100%;
    /* background: red; */
}
.swiper-button-next {
    width: 6px;
    height: 10px;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L27%2C22L5%2C44l-2.1-2.1L22.8%2C22L2.9%2C2.1L5%2C0L27%2C22L27%2C22z'%20fill%3D'%23e13228'%2F%3E%3C%2Fsvg%3E");
    background-size: 6px 10px;
}
.swiper-button-prev {
    width: 6px;
    height: 10px;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l2.1%2C2.1L4.2%2C22l19.9%2C19.9L22%2C44L0%2C22L0%2C22L0%2C22z'%20fill%3D'%23e13228'%2F%3E%3C%2Fsvg%3E");
    background-size: 6px 10px;
}
</style>