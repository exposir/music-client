<template>
    <div id="swiper">
        <swiper :options="swiperOption" v-if="foucsinfo && foucsinfo.length>=3">
            <swiper-slide v-for="(item,index) in foucsinfo">
                <div v-if="item && item.type && item.type==1">
                    <router-link :to="'/music/public/singer/'+item.code+'/0'">
                        <img :title="item.ipad_desc" :src="item.randpic" alt="">
                    </router-link>
                </div>
                <div v-if="item && item.type && item.type==2">
                    <router-link :to="'/music/public/album/'+item.code">
                        <img  :title="item.ipad_desc" :src="item.randpic" alt="">
                    </router-link>
                </div>
                <div v-if="item && item.type && item.type==7">
                    <router-link :to="'/music/public/gedan/'+item.code">
                        <img :title="item.ipad_desc" :src="item.randpic" alt="">
                    </router-link>
                </div>
                <div v-if="item && item.type && item.type==11">
                    <img @click="playVideo(item.code)" :title="item.ipad_desc" :src="item.randpic" alt="">
                </div>
                <div v-if="item && item.type && (item.type==3 || item.type==5 || item.type==6 || item.type==10 || item.type==12)">
                    <img @click="open(item.code)" :title="item.ipad_desc" :src="item.randpic" alt="">
                </div>
            </swiper-slide>
            <div class="swiper-pagination"  slot="pagination"></div>
            <div class="swiper-button-prev" slot="button-prev"></div>
            <div class="swiper-button-next" slot="button-next"></div>
        </swiper>
    </div>
</template>
<script>
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import mvService from '../../service/mvService'
import playMv from '../../utils/mv/playMv.js'

import {
    mapGetters,
    mapActions
} from 'vuex'

const {
    shell
} = require('electron');

export default {
    components: {
        swiper,
        swiperSlide
    },
    computed: {
        ...mapGetters({
            foucsinfo: 'local_focusimages'
        })
    },
    data () {
      return {
        swiperOption: {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 10,
            loop: true,
            autoplay: true,
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
        this.$store.dispatch('storFocusimgs')
    },
    methods: {
        open(url) {
            if (this.clientConfigs.get_payment_state() == '1') {
                shell.openExternal(url);
            }
        },
        playVideo (url) {
            let mv_id = url.replace('http://music.baidu.com/playmv/','').replace('http://music.taihe.com/playmv/','');
            let data = {'mv_id':mv_id}
            mvService.getMvPlayUrl(data, res => {
                if (res.error_code == 22000) {
                    playMv.playMv(res.result ? res.result : {})
                }
            }, function(err) {
                console.log(err)
            })
                
        }
    }
}
</script>
<style>
    .swiper-pagination-bullets .swiper-pagination-bullet-active {
        background: #e13228;
    }
</style>
<style scoped>
    * {
        margin: 0;
        padding: 0;
    }
    #swiper {
        margin-top: 16px;
    }
    .swiper-slide {
        width: 450px;
    }
    .swiper-slide img {
        width: 450px;
        height: 180px;
    }
    .swiper-button-next {
        background-image: url(~static/images/swiper_right.svg);
        width: 250px;
        margin-right: -110px;
        height: 200px;
        margin-top: -100px;
        background-size: 35px 35px;
        opacity: 0;
        transition: opacity .5s;
        top: 50%;
    }
    .swiper-button-prev {
        background-image: url(~static/images/swiper_left.svg);
        width: 250px;
        margin-left: -110px;
        height: 200px;
        margin-top: -100px;
        background-size: 35px 35px;
        opacity: 0;
        transition: opacity .5s;
        top: 50%;
    }
    @media screen and (min-width: 1200px) {
        .swiper-button-next {
            background-image: url(~static/images/swiper_right.svg);
            width: 530px;
            margin-right: -245px;
            height: 200px;
            margin-top: -100px;
            background-size: 35px 35px;
            opacity: 0;
            transition: opacity .5s;
            top: 50%;
        }
    }
    @media screen and (min-width: 1200px) {
        .swiper-button-prev{
            background-image: url(~static/images/swiper_left.svg);
            width: 530px;
            margin-left: -245px;
            height: 200px;
            margin-top: -100px;
            background-size: 35px 35px;
            opacity: 0;
            transition: opacity .5s;
            top: 50%;
        }
    }


    .swiper-pagination-bullets .swiper-pagination-bullet-active {
        background: #e13228;
    }
    #swiper .swiper-container:hover .swiper-button-next,
    #swiper .swiper-container:hover .swiper-button-prev {
        opacity: 1;
    }
    #swiper .swiper-container .swiper-slide:hover {
        cursor: pointer;
    }
</style>