<template>   
  <div class="main_table_wrap" oncontextmenu="return false" onselectstart="return false">
    <song-list  v-if="songList.length>0" :data="songList" :detail="{'classname':'','type':'search'}" :fields="{'album_title':true,'singer':true,'hot':false}" :highlight="highlight" :keyword="keyword"></song-list>
    <div class="no-content-tips-box" v-else>
      没有找到相关内容，试试别的关键词吧
    </div>   
    <div class="pagination-box" v-if="totalnum > 20">
        <el-pagination small layout="prev, pager, next" :total="totalnum" :page-size="20" @current-change="onChangePage"></el-pagination>
    </div>
  </div>  
</template>
<script>
    import songList from 'components/public/song-list.vue'

    export default {
        name: "search-song-list",
        props: {
            songList: Array,
            keyword: String,
            totalnum: Number,
            loadding: Boolean,
            highlight: Function
        },
        components: {
            songList
        },
        methods: {
            onChangePage(page) {
                eventBus.$emit('isMass', false);
                this.$nextTick(function() {
                    this.$store.dispatch('getSearchResult', {
                        "query": this.keyword,
                        "page_no": page,
                        "page_size": 20
                    })
                    document.querySelector('.show').scrollTop = 0
                })
            },
            playSong(song) {
                let songArr = []
                songArr.push(song)
                this.$store.dispatch('addSongsToCurrentPlayinglist', {
                    "songArray": songArr,
                    "playIndex": 0,
                    "isPlay": true,
                    "isReset": false
                })
            },
            selected(index) {
                this.selectedIndex = index
            }
        }
    }
</script>
<style>
    .main_table_wrap {
        padding: 0 17px;
    }
</style>