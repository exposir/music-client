<template>
<div class="radioIndex">
    <div class="radio_menu">
        <ul class="tagsBox">
            <li v-for="category in radioCategory">
                <div class="tags_name">
                    <a class="tags" @click.stop="moveToCategoryCell(category.id)" :class="{current_category:category.id == current_category_id}">{{category.title}}</a>
                </div>
            </li>
        </ul>
    </div>
    <div class="radio_list">
        <div v-for="category in radioCategory">
            <section-title v-bind:data="{'title':category.title}" :id="getId(category.id)" class="radio_category_title"></section-title>
            <ul class="sceneBox">
                <li v-for="item in radioAllScene[category.id]" :class="{current_scene:item.id == current_scene_id}">
                    <div class="scene_name" v-bind:title="item.title">
                        
                        <img class="background" v-lazy="item.pc_background">
                        <div class="icon">
                            <img v-lazy="item.icon">
                        </div>
                        <span class="title">{{item.title}}</span>
                        <div class="pause_btn" v-show="item.id == current_scene_id" @click="pause"></div>
                        <div class="play_btn" @click="playWholeRadio(item.id, item.title, item.category_id)"></div>
                    </div>
                </li>
            </ul>
        </div>
    </div>

</div>
</template>
<script>
    import reportService from 'service/reportService'
    import scrollBar from '../scrollBar/scrollBar.js'
    import sectionTitle from 'components/public/section-title.vue'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
import { setTimeout } from 'timers';
    export default {
        name: 'radioIndex',
        components: {
            sectionTitle,
        },
        data() {
            return {
               current_category_id: -1,
               current_scene_id: -1,
               offset: 0,
               categorys_offset: [],
               categorys_id: [],
               isManualRolling: true, //标识是否是手动滚动：手动滚动触发handleScroll事件
               totalHeight: 0
            }
        },
        computed: {
            ...mapGetters({
                currentPlayingState:'currentPlayingState',
                radioCategory: 'radioCategory',
                radioAllScene: 'radioAllScene',
                sceneSong: 'sceneSong',
                currentPlayIndex: 'currentPlayIndex',
                currentPlaysList: 'currentPlaysList',
                playingRadioInfo: 'playing_radio_info',
                playingRadioInfo: 'displayInfo'     //先取出local的电台信息，作为判断是否播放电台的依据
            })
        },
        created() {
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0 
            }
            this.$store.dispatch('getRadioCategory', {
                from: 'qianqianmini'
            })
            this.$store.dispatch('getRadioAllScene', {
                from: 'qianqianmini'
            })
        },
        watch:{
            //
            radioAllScene(now, before){
                this.getCategoryOffset()
                setTimeout(()=>{
                    this.offset = this.categorys_offset[0]
                    this.current_category_id = this.categorys_id[0]
                },0)
                
                
            },
            //监听播放状态，显示/隐藏播放icon
            currentPlayingState(now,before){
                if(this.playingRadioInfo && this.playingRadioInfo.type == 'radio'){
                    if(now == 1){          //暂停-》播放
                        this.setCurrentRadio()
                    }else{                 //播放-》暂停
                        this.current_scene_id = -1
                    }
                    
                }
            },
        },
        mounted() {
            //从其他页返回电台页时，如果有电台正在播放，则定位到所播放场景cell
            if(this.currentPlayingState == 1){     //播放状态
                this.setCurrentRadio()
            }else{
                this.current_scene_id = -1
                this.current_category_id = this.categorys_id[0]
            }

            //监听滚动事件
            setTimeout(()=>{
                document.querySelector('.scrollBarBody').addEventListener('scroll', this.handleScroll)
            },0)
            
        },
        beforeDestroy() {
            document.querySelector('.scrollBarBody').removeEventListener('scroll', this.handleScroll)
        },
        methods: {
            //获取每个类型cell的顶部距离
            getCategoryOffset(){
                this.$nextTick(function(){
                    let categorys = document.querySelectorAll('.radio_category_title'),
                        categorys_offset = [],
                        categorys_id = []
                    categorys.forEach((value, index)=>{
                        categorys_id.push(value.getAttribute('id').split('_')[1])
                        categorys_offset.push(value.offsetTop)
                    })
                    this.categorys_id = categorys_id
                    this.categorys_offset = categorys_offset

                    this.totalHeight = document.querySelector('.radio_list').scrollHeight
                })
            },
            getId(id){
                return "category_" + id
            },
            //根据滑动的距离，判断当前位置将对应的类别名高亮
            handleScroll(){
                let scrollOffset = document.querySelector('.scrollBarBody').scrollTop + this.offset + 190
                if(scrollOffset >= this.totalHeight - 250){     
                    this.current_category_id = this.categorys_id.slice(-1)
                    return
                }
                this.categorys_offset.forEach((value, index)=>{
                    if(scrollOffset >= value){
                        this.current_category_id = this.categorys_id[index]
                        return 
                    }else{
                        
                    }
                })
                
            },
            //使当前播放的类型高亮，并滑动到对应的cell
            setCurrentRadio(){
                if(this.playingRadioInfo){
                    this.current_category_id = this.playingRadioInfo.category_id || -1;
                    //this.moveToCategoryCell(this.current_category_id)
                    this.current_scene_id = this.playingRadioInfo.scene_id || -1;
                }else{
                    this.current_category_id = -1;
                    this.current_scene_id = -1;
                }
            },
            //根据场景category_id，并滚动到相应分类cell
            moveToCategoryCell(id) {
                this.current_category_id = id
                let current = this.$el.querySelector("#category_"+id)
                if( current ){
                    this.isManualRolling = false
                    document.querySelector(".scrollBarBody").scrollTop = current.offsetTop - this.offset
                }
                this.commonFuns.crmStatistics('radio','daohangClick','click')
            },
            //播放电台
            playWholeRadio(scene_id, scene_title, category_id) {
                this.current_scene_id = scene_id
                if( this.playingRadioInfo && this.playingRadioInfo.scene_id == scene_id ){      //预播放的电台与正播放的电台一致时，不再请求新数据，直接播放
                    this.$store.dispatch('play')
                }else{
                    this.$store.dispatch('playWholeRadio', {
                        scene_id: scene_id, 
                        scene_title: scene_title + '电台',
                        category_id: category_id
                    })
                }
                this.commonFuns.crmStatistics('radio','radiopPlay')
            },
            //暂停
            pause(){
                this.$store.dispatch('pause')
                this.current_scene_id = -1
            }

        }
    }
</script>
<style scoped>
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
        background-color: #f9f9f9;
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
    .radio_menu ul li a.current_category{
        color: #e45a54;
    }
    .radio_list {
        margin: 0px;
        width: auto;
        padding-top: 30px;
    }
    
    .radio_list ul {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        margin-right: -16px;
        margin-bottom: -16px;

    }
    .radio_list ul:after {
        content: "";
        flex: auto;
    }
    .radio_list ul li{
        width: 140px;
        height: 140px;
        margin: 0 16px 16px 0;
    }
    .radio_list ul li .scene_name{
        cursor: pointer;
        position: relative;
    }
    @media screen and (min-width: 1200px) {
        .radio_list ul  {
            display: flex;
            flex-flow: row wrap;
            justify-content: flex-start;
            margin-bottom: -24px;
        }
        .radio_list ul li{
            width: 14%;
            height: 140px;
            position: relative;
        }
        .radio_list ul li .scene_name{
            width: 140px;
            height: 140px;
            position: absolute;
            top: 0px;
            left: 0px;
            cursor: pointer;
        }
    }
    
    .radio_list ul li .scene_name .pause_btn,.play_btn{
        position: absolute;
        display: inline-block;
        width: 36px;
        height: 36px;
        top: 90px;
        right: 10px;
        z-index: 2;
    }
    .radio_list ul li .scene_name .pause_btn{
        background: url(./images/radio-pause.png) no-repeat;
        z-index: 3;
    }
    .radio_list ul li:not(.current_scene) .scene_name:hover .play_btn{
        background: url(./images/radio-play.png) no-repeat;
    }
    .radio_list ul li img.background{
        width: 100%;
        height: 100%; 
    }
    .radio_list ul li .icon{
        position: absolute;
        width: 100%;
        top: 36px;
        text-align: center;
    }
    .radio_list ul li .icon img{
        width: 56px;
        height: 56px; 
    }
    .radio_list ul li span.title{
        position: absolute;
        bottom: 26px;
        display: inline-block;
        height: 20px;
        width: 100%;
        text-align: center;
        color: #ffffff;
        font-size: 14px;
    }
</style>