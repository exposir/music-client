<template>
    <div class="my-wrapper">
        <div class="top-box fixedTab new-top-box">
            <section-title :data="{'title':'播放历史','nums':historysonglist.length+'首'}"></section-title>
            <button-collect v-if="currentPageHistorySonglist.length>0" :allSongs="currentPageHistorySonglist" :listid="'history'" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':false,'delete':true,'more':false,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}"></button-collect>
        </div>
    
        <user-song-list v-if="currentPageHistorySonglist.length>0" :data="currentPageHistorySonglist" :allDataSize="historysonglist.length" :type="'history'" :playingInex="playingIndex" :list_id="'history'" :activeSongId="active_song_id"></user-song-list>
    
        <empty v-else :content="'还没有试听过歌曲'" :btnText="'去发现音乐看看'" :linkUrl="'/muwindow'"></empty>
    </div>
</template>
<script>
    import userSongList from 'components/user/user-song-list.vue'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import reportService from '../../service/reportService'
    import empty from '../empty/empty'
    import commonFuns from '../../components/commonFuns/common.js'
    import sectionTitle from 'components/public/section-title.vue'
    import scrollBar from '../scrollBar/scrollBar.js'
    import buttonCollect from 'components/button/button-collect.vue'

    const fs = require('fs');

    export default {
        name: 'muaudition',
        computed: {
            ...mapGetters({
                historysonglist: 'historySonglist',
                currentPageHistorySonglist: 'currentPageHistorySonglist',
                playingIndex: 'historyPlayingIndex'
            }),
        },
        created() {
            reportService.clickReport({
                'type': 'click',
                'page': 'functionlist',
                'pos': 'history'
            });
            this.setActiveSong();
            this.$store.dispatch('getCurrentPageHistoryData', 0)
            // console.log(this.currentPageHistorySonglist)
            eventBus.$on('isMass', this.massOpChanged);
        },
        mounted() {
            
        },
        beforeDestroy() {
            eventBus.$off('isMass', this.massOpChanged);
            this.$store.dispatch('emptyLinesSelected');
        },
        data() {
            return {
                active_song_id: "",
                isMass: false,
                isNotMass: true
            }
        },
        components: {
            empty,
            userSongList,
            sectionTitle,
            buttonCollect
        },
        methods: {
            setActiveSong() {
                let song_id = this.$route.params.songid
                this.active_song_id = song_id
            },
            massOpChanged(val) {
                this.isMass = val
                this.isNotMass = !val
            }
        }
    }
</script>
<style scoped>
    .section-title-box {
        margin: 21px 0 16px !important;
    }

    .my-wrapper {
        height: 100%;
        overflow: hidden;
        padding: 0 17px;
        
    }
    
    .top-box {
        /* display: flex;
        justify-content: space-between;
        align-items: center; 
        flex-direction: column;
        height: 60px;  */
        padding: 7px 0 13px;
    }

</style>