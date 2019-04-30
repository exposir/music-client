<template>
  <div class="search_result">
    <!-- banner begin -->
    <div class="search_banner">
      <span v-if="search_type == 'song' && searchdata.song_info">搜索<b class="qword">{{keyword}}</b>，为你找到相关歌曲&nbsp;<b v-if="search_num.song_total>0 && search_num.song_total<1000">{{search_num.song_total}}</b><b v-else-if="search_num.song_total>1000">1000+</b>&nbsp;首</span>
      <span v-if="search_type == 'singer' && searchdata.artist_info">搜索<b class="qword">{{keyword}}</b>，为你找到相关歌手&nbsp;<b v-if="search_num.singer_total>0 && search_num.singer_total<1000">{{search_num.singer_total}}</b><b v-else-if="search_num.singer_total>1000">1000+</b>&nbsp;位</span>
      <span v-if="search_type == 'album' && searchdata.album_info">搜索<b class="qword">{{keyword}}</b>，为你找到相关专辑&nbsp;<b v-if="search_num.album_total>0 && search_num.album_total<1000">{{search_num.album_total}}</b><b v-else-if="search_num.album_total>1000">1000+</b>&nbsp;张</span>
      <span v-if="search_type == 'gedan' && searchdata.playlist_info">搜索<b class="qword">{{keyword}}</b>，为你找到相关歌单&nbsp;<b v-if="search_num.gedan_total>0 && search_num.gedan_total<1000">{{search_num.gedan_total}}</b><b v-else-if="search_num.gedan_total>1000">1000+</b>&nbsp;个</span>
    </div>
    <!-- banner end -->
    <!-- tab begin -->
    <div class="search_tab info_tab">
      <ul>
        <li :class="{visited:search_type == 'song',link_disabled:search_num.song_total===0}">
          <a v-if="search_num.song_total>0 && search_num.song_total<1000" @click="changeTab('song')">歌曲({{search_num.song_total}})</a>
          <a v-else-if="search_num.song_total>1000" @click="changeTab('song')">歌曲(1000+)</a>
          <a v-else="search_num.song_total===0">歌曲（0）</a>
        </li>
        <li :class="{visited:search_type == 'singer',link_disabled:search_num.singer_total===0}">
          <a v-if="search_num.singer_total>0 && search_num.singer_total<1000" @click="changeTab('singer')">歌手({{search_num.singer_total}})</a>
          <a v-else-if="search_num.singer_total>1000" @click="changeTab('singer')">歌手(1000+)</a>
          <a v-else="search_num.singer_total===0">歌手（0）</a>
        </li>
        <li :class="{visited:search_type == 'album',link_disabled:search_num.album_total===0}">
          <a v-if="search_num.album_total>0 && search_num.album_total<1000" @click="changeTab('album')">专辑({{search_num.album_total}})</a>
          <a v-else-if="search_num.album_total>1000" @click="changeTab('album')">专辑(1000+)</a>
          <a v-else="search_num.album_total===0">专辑（0）</a>
        </li>
        <li :class="{visited:search_type == 'gedan',link_disabled:search_num.gedan_total===0}">
          <a v-if="search_num.gedan_total>0 && search_num.gedan_total<1000" @click="changeTab('gedan')">歌单({{search_num.gedan_total}})</a>
          <a v-else-if="search_num.gedan_total>1000" @click="changeTab('gedan')">歌单(1000+)</a>
          <a v-else="search_num.gedan_total===0">歌单（0）</a>
        </li>

      </ul>
    </div>
    <!-- tab end -->
    <!-- songlist begin -->
    <search-song-list v-if="search_type == 'song' && searchdata.song_info" v-bind:songList="searchdata.song_info.song_list" v-bind:keyword="keyword" v-bind:totalnum="searchdata.song_info.total" v-bind:loadding="loadding" v-bind:highlight="highlight"></search-song-list>
    <!-- songlist end -->
    <!-- album list begin -->
    <album-list v-if="search_type == 'album' && searchdata.album_info" v-bind:albumList="searchdata.album_info.album_list" v-bind:keyword="keyword" v-bind:totalnum="searchdata.album_info.total" v-bind:loadding="loadding" v-bind:highlight="highlight"></album-list>
    <!-- album list end -->
    <gedan-list v-if="search_type == 'gedan' && searchdata.playlist_info" v-bind:gedanList="searchdata.playlist_info.play_list" :keyword="keyword" :totalnum="searchdata.playlist_info.total" v-bind:loadding="loadding" v-bind:highlight="highlight"></gedan-list>
    <singer-list v-if="search_type == 'singer' && searchdata.artist_info" v-bind:singerList="searchdata.artist_info.artist_list" :keyword="keyword" :totalnum="searchdata.artist_info.total" v-bind:loadding="loadding" v-bind:highlight="highlight"></singer-list>

  </div>
</template>
<script>
    import './css/search.css'
    import './css/table.css'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import searchSongList from 'components/search/searchSongList'
    import albumList from 'components/search/albumList'
    import gedanList from 'components/search/gedanList'
    import singerList from 'components/search/singerList'
    export default {
        name: "search-list",
        data() {
            return {
                search_type: 'song'
            }
        },
        computed: mapGetters({
            keyword: "keyword",
            searchdata: 'search_list',
            search_num: 'search_num',
            loadding: 'loadding'
        }),
        created() {
            let search_type = this.$route.params.type
            this.search_type = search_type
            this.getSearchResult()
        },
        components: {
            searchSongList,
            albumList,
            gedanList,
            singerList
        },
        watch: {
            '$route': function() {
                let search_type = this.$route.params.type
                this.search_type = search_type
            }
        },
        methods: {
            changeTab(type) {
                this.search_type = type
                this.$nextTick(() => {
                    this.$store.dispatch('getSearchResult', {
                        "query": this.keyword,
                        "page_no": 1,
                        "page_size": 20
                    })

                    this.$router.push({
                        path: '/search/' + type + '/' + encodeURIComponent(this.keyword) + '/1/'
                    })
                })
            },
            getSearchResult() {
                this.$store.dispatch('getKeyWord')
                this.$store.dispatch('getSearchResult', {
                    "query": this.keyword,
                    "page_no": 1,
                    "page_size": 20
                })
                this.$store.dispatch('getSearchNum', {
                    "query": this.keyword,
                    "page_no": 1,
                    "page_size": 20
                })
            },
            playSong(song) {
                let songArr = []
                songArr.push(song)
                this.$store.dispatch('addSongsToCurrentPlayinglist', {
                    "songArray": songArr,
                    "playIndex": 1,
                    "isPlay": true,
                    "isReset": false
                })
            },
            highlight(value, keyword) {
                let regExp = new RegExp(keyword, "g");
                let content = value.replace(regExp, '<em class="highlight">' + keyword + '</em>')
                return content
            }
        }
    }
</script>