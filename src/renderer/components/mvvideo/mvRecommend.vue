<template>
    <div id="mvRecommend">
        <div class="recom-banner">
            <mvSlide></mvSlide>
        </div>
        <!--推荐MV-->
        <div class="mv-release">
            <section-title v-bind:data="{'title':'推荐MV','link':'/mvList'}"></section-title>
            <ul class="mvRecomm-list">
                <li v-for="(val,index) in mvRecommend.recommList.result">
                    <mv-item :data="val" :fields="{'pic':true,'title':true,'author':true}"></mv-item>
                </li>
            </ul>
        </div>
        <!--音乐大人物-->
        <div class="mv-release">
            <section-title v-bind:data="{'title':'音乐大人物','link':'/mvBigman'}"></section-title>
            <ul class="mvRecomm-list">
                <li v-for="(val,index) in mvRecommend.recommBigman.result">
                    <mv-item :data="val" :fields="{'pic':true,'title':true,'author':true}"></mv-item>
                </li>
            </ul>
        </div>
        <!--直播回放-->
        <div class="mv-release">
            <section-title v-bind:data="{'title':'直播回放','link':'/mvReplay'}"></section-title>
            <ul class="mvRecomm-list">
                <li v-for="(val,index) in mvRecommend.recommReplay.result">
                    <mv-item :data="val" :fields="{'pic':true,'title':true,'author':true}"></mv-item>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    import mvSlide from 'components/mvvideo/mvSlide.vue'
    import sectionTitle from 'components/public/section-title.vue'
    import mvItem from 'components/public/mv-item.vue'
    import { mapGetters,mapState } from 'vuex'
    
    export default {
        components: {
            mvSlide,
            sectionTitle,
            mvItem
        },
        computed: {
            ...mapGetters({
                mvRecommend: 'mvRecommend'
            })
        },
        created() {
            this.$store.dispatch('getMVRecommendFocus')
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0
            }
        }
    }
</script>
<style scoped>
    .section-title-box {
        margin: 21px 0 16px !important;
    }
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
        height: 280px;
        overflow: hidden;
        justify-content: space-between;
    }

    .mvRecomm-list li {
        width: 20%;
    }
</style>