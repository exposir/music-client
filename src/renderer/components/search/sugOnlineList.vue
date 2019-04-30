<template>
 <li v-if="((songList && songList.length>0) || (artistList && artistList.length > 0) || (albumList && albumList.length > 0))">
    <span class="sug-title">在线音乐</span>
    <div class="sug-res-box">
        <div class="sug-section" v-if="songList && songList.length > 0">
            <div class="sug-detail-label">歌曲</div>
            <ul class="sug-res-list">
            <li v-for="(song,index) in songList"  class="sug-li-songlist" @click="selectClick($event)">
                <router-link class="song-name-box" :to="'/search/song/'+encodeURIComponent(song.songname)+'/1'">{{song.songname}}-{{song.artistname}}</router-link>
                <i class="play-icon" @click.stop="playSong(song)" title="播放"></i>
            </li>
            </ul>
        </div>
        <div class="sug-section" v-if="artistList && artistList.length > 0">
            <div class="sug-detail-label">歌手</div>
            <ul class="sug-res-list">
            <li v-for="(artist,index) in artistList"  @click="setSearchKeyword($event)">
                <router-link  :to="'/music/public/singer/0/'+artist.artistid">{{artist.artistname}}</router-link>
            </li>
            </ul>
        </div>
        <div class="sug-section" v-if="albumList && albumList.length > 0">
            <div class="sug-detail-label">专辑</div>
            <ul class="sug-res-list">
            <li v-for="(album,index) in albumList"  @click="setSearchKeyword($event)">
                <router-link  :to="'/music/public/album/'+album.albumid"> {{album.artistname}}-{{album.albumname}}</router-link>
            </li>
            </ul>
        </div>
    </div>
</li>
</template>
<script>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import playIcon from 'components/icons/playIcon'
    export default {
        name: 'sug-online-list',
        props: {
            query: String
        },
        watch: {
            query: function(newVal, oldVal) {
                if (newVal.trim().length > 0) {
                    this.$store.dispatch('getSugOnlineList', {
                        "query": newVal
                    })
                }
            }
        },
        computed: {
            ...mapGetters({
                sug_online_list: "sug_online_list"
            }),
            songList() {
                return this.sug_online_list.songList
            },
            artistList() {
                return this.sug_online_list.artistList
            },
            albumList() {
                return this.sug_online_list.albumList
            },
            total() {
                let songLength = this.songList ? this.songList.length : 0
                let artistLength = this.artistList ? this.artistList.length : 0
                let albumLength = this.albumList ? this.albumList.length : 0
                let total = songLength + artistLength + albumLength
                return total
            }

        },
        created() {
            if (this.query.trim().length > 0) {
                this.$store.dispatch('getSugOnlineList', {
                    "query": this.query,
                    "limit": 4
                })
            }
        },
        components: {
            playIcon
        },
        methods: {
            selectClick(event) {
                this.$parent.selectClickToSearch(event)
            },
            setSearchKeyword(event) {
                let selectedVal = event.target.innerText
                this.$parent.$data.keyword = selectedVal
            },
            playSong(song) {
                let songItem = {
                    "song_id": song.songid,
                    "title": song.songname,
                    "author": song.artistname
                }
                this.$store.dispatch('playSingleSong', songItem)
            }
        }
    }
</script>