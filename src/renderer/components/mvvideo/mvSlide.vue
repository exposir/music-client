<template>
    <div id="mvSlide">
        <el-carousel :interval="5000" type="card" :height="slideh" :initial-index="0">
            <el-carousel-item v-for="(item,index) in mvRecommend.recommFocusImages.result">
                <div>
                    <img :src="item.pic_url" alt="" @click="playmv(item.con_id)">
                </div>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>
<script>
    import { mapGetters,mapState } from 'vuex'
    import mvService from '../../service/mvService'
    import playMv from '../../utils/mv/playMv.js'   
    
    export default {
        name: 'mvSlide',
        props: {
            slideh: String
        },
        computed: {
            ...mapGetters({
                mvRecommend: 'mvRecommend'
            })
        },
        created() {
            this.$store.dispatch('getMVRecommendFocus')
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
            }
        }
    }
</script>
<style>
    #mvSlide {
        width: 100%;
        height: 200px;
        position: relative;
        margin-top: 16px;
    }
    
    #mvSlide .slidebg {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        width: 100%;
        height: 160px;
        margin-top: -80px;
        background: #F9C5C5 url(../../common/images/default/bannerbg_logo.png) no-repeat 50% 50%;
        background-size: 81px auto;
    }
    
    #mvSlide .el-carousel {
        z-index: 2;
    }
    
    .banner {
        width: 100%;
        overflow: hidden;
        margin: 0 auto;
        height: 200px;
        position: relative;
    }

    .el-carousel__mask {
        opacity: .4;
        background-color: #000;
    }
    
    .el-carousel__item h3 {
        color: #475669;
        font-size: 14px;
        opacity: 0.75;
        line-height: 200px;
        margin: 0;
    }
    
    .el-carousel__item:nth-child(2n) {
        background-color: #dce7f4;
    }
    
    .el-carousel__item:nth-child(2n+1) {
        background-color: #dce7f4;
    }
    .el-carousel__item img {
        widows: 498px;
        height: 200px;
    }

    .el-carousel {
        overflow: hidden;
    }

    .el-carousel__container {
        position: relative;
        height: 200px;
    }
    
    .el-carousel__container .is-active {
        left: -58px;
        width: 498px;
        height: 200px;
        background: #dce7f4 url(../../common/images/default/bannerbg_logo.png) no-repeat 50% 50%;
        background-size: 81px auto;
    }

    .el-carousel__indicators--outside {
        position: absolute;
        left: 50%;
        bottom: 4px;
        margin-left: -55px;
    }
    
    .el-carousel__indicator {
        padding: 0;
        margin-right: 12px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
    
    .el-carousel__indicators--outside button {
        background: #ffffff;
        opacity: 0.5;
    }
    
    .el-carousel__indicator.is-active button {
        opacity: 1;
    }
    
    .el-carousel__button {
        padding: 0;
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
    
    #slide .el-carousel.el-carousel--card .el-carousel__mask {
        opacity: .4;
        background-color: #000000;
    }
    @media screen and (min-width: 1200px) {
        #slide,.banner {
            height: 220px;
        }
        #slide .slidebg {
            margin-top: -80px;
        }
        .el-carousel__item h3 {
            line-height: 220px;
        }
        .el-carousel__item img,.el-carousel__container .is-active {
            width: 547.8px;
            height: 220px;
        }
        .el-carousel__container .is-active {
            left: -25px
        }
        
    }
</style>