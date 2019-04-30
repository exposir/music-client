<template>
    <div class="bangdanIndex">
        <ul class="bangdan">
            <li v-for="(val,index) in bangdanIndexList" class="bangdan-list" :title="val.name" :class="{hiden: !val.name}">
                <div class="bd-box">
                    <div class="bd-imgborder">
                        <router-link :to="'/music/public/bangdan/'+val.type"  @click.native="buriedPoint(val.type)">
                            <img v-lazy="val.pic_s192" alt="">
                            <div class="mask"></div>
                        </router-link>
                         <span class="play" @click.stop="playWholeBangdan(val.type)"></span>
                    </div>
                    <router-link :to="'/music/public/bangdan/'+val.type"  @click.native="buriedPoint(val.type)">
                    <ul class="bangdan-list-con">
                        <li v-for="(val2,index2) in val.content" class="bd-content">
                            <span class="num">{{index2+1}}</span>
                            <span class="songtitle">{{val2.title}} - <span class="author">{{val2.author}}</span></span>
                        </li>
                    </ul>
                    </router-link>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    import {
        mapGetters
    } from 'vuex'
    import reportService from 'service/reportService'
    export default {
        name: 'bangdanIndex',
        computed: {
            ...mapGetters({
                bangdanIndexList: 'bangdanList'
            })
        },
        created: function() {
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0
            }
            this.$store.dispatch('getBangdanList')
            reportService.clickReport({
                'type': 'click',
                'page': 'musicwindow',
                'pos': 'bangdan'
            });
        },
        watch: {
            bangdanIndexList(now, before){
                //奇数个时在末尾补充一个，避免最后一个单列一行时样式错误
                if ( now.length % 2 ) {
                    now.push({})
                }
                
            }
        },
        methods: {
            playWholeBangdan(bangdan_id) {
                this.$store.dispatch('playWholeBangdan', bangdan_id)
                eventBus.$emit('isShowAddMusicIcon', true)

                 if(bangdan_id == 1){
                this.commonFuns.crmStatistics('bangdan','xingePlay')
            }else if(bangdan_id == 2){
                this.commonFuns.crmStatistics('bangdan','regePlay')
            }else if(bangdan_id == 21){
                this.commonFuns.crmStatistics('bangdan','oumeiPlay')
            }else if(bangdan_id == 200){
                this.commonFuns.crmStatistics('bangdan','yuanchuangPlay')
            }else if(bangdan_id == 20){
                this.commonFuns.crmStatistics('bangdan','huayuPlay')
            }else if(bangdan_id == 22){
                this.commonFuns.crmStatistics('bangdan','laogePlay')
            }else if(bangdan_id == 25){
                this.commonFuns.crmStatistics('bangdan','wangluoPlay')
            }else if(bangdan_id == 24){
                this.commonFuns.crmStatistics('bangdan','yingshiPlay')
            }else if(bangdan_id == 23){
                this.commonFuns.crmStatistics('bangdan','qinggePlay')
            }
            },
            buriedPoint(bangdan_id){
                   if(bangdan_id == 1){
                this.commonFuns.crmStatistics('bangdan','xingeClick','click')
            }else if(bangdan_id == 2){
                this.commonFuns.crmStatistics('bangdan','regeClick','click')
            }else if(bangdan_id == 21){
                this.commonFuns.crmStatistics('bangdan','oumeiClick','click')
            }else if(bangdan_id == 200){
                this.commonFuns.crmStatistics('bangdan','yuanchuangClick','click')
            }else if(bangdan_id == 20){
                this.commonFuns.crmStatistics('bangdan','huayuClick','click')
            }else if(bangdan_id == 22){
                this.commonFuns.crmStatistics('bangdan','laogeClick','click')
            }else if(bangdan_id == 25){
                this.commonFuns.crmStatistics('bangdan','wangluoClick','click')
            }else if(bangdan_id == 24){
                this.commonFuns.crmStatistics('bangdan','yingshiClick','click')
            }else if(bangdan_id == 23){
                this.commonFuns.crmStatistics('bangdan','qinggeClick','click')
            }
            }
        }
    }
</script>
<style scoped>
    .bangdanIndex {
        padding: 16px;
    }
    
    .bangdanIndex .bangdan {
        display: flex;
        flex-flow: row wrap;
        align-content: flex-start;
        justify-content: space-between;
    }
    
    .bangdan-list {
        flex: 1 1 356px;
        margin-right: 18px;
        height: 146px;
        border: 1px solid #f2f2f2;
        border-radius: 5px;
        cursor: pointer;
        margin-bottom: 28px;
        transition: all .5s;
        position: relative;
    }
    .bangdan-list.hiden {
        visibility: hidden;
    }
    
    .bangdan-list:hover {
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, .2);
    }
    
    .bd-imgborder {
        width: 144px;
        height: 144px;
        position: relative;
    }
    
    .bd-imgborder img {
        width: 144px;
        height: 144px;
        border-radius: 5px;
    }
    
    .mask {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    
    .bangdan-list:hover .mask {
        background: rgba(0, 0, 0, 0.5);
        transition: all .5s;
    }
    
    .bangdan-list .play {
        position: absolute;
        width: 36px;
        height: 36px;
        background: url('~static/images/miniBar/icon_stop_1.svg') no-repeat;
        left: 50%;
        top: 50%;
        margin-left: -18px;
        margin-top: -18px;
        z-index: 10;
        display: none;
    }
    
    .bangdan-list:hover .play {
        display: block;
    }
    
    .bangdan-list-con {
        width: 100%;
        height: 100%;
        overflow: hidden;
        padding-top: 16px;
    }
    /*.bangdan-list-con li {
        padding-left: 4px;
        height: 35px;
        border-bottom: 1px solid #f2f2f2;
        line-height: 36px;
        padding-right: 22px;
    }*/
    /*.bangdan-list-con li:hover {
        background: #f2f2f2;
    }*/
    
    .bangdan-list-con li:last-child {
        border-bottom: none;
    }
    
    .bangdan-list-con .num {
        width: 30px;
        text-align: center;
    }
    /*.bangdan-list-con .franking {
        color: #499bd4;
    }*/
    
    .bangdan-list-con .songtitle {
        width: 120px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .bangdan-list-con .author {
        width: 57px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        color: #a7a7a7;
    }
    
    .bd-box {
        display: flex;
    }
    
    .bd-content {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-start;
        width: 210px;
        height: 28px;
        align-items: center;
    }
</style>