<template>
<li v-if="local_songlist && local_songlist.length>0">
    <span class="sug-title">我的音乐</span>
    <div class="sug-section">
    <div class="sug-detail-label">歌曲</div>
    <ul class="sug-res-list">
        <li v-for="song in local_songlist" class="sug-li-songlist" @click="setSearchKeyword($event)">
        <router-link v-if="song.listid==local_songlist_id" :to="'/my/local/'+song.song_id" class="song-name-box">{{song.title}}-{{song.author}}</router-link>
        <router-link v-if="song.listid==history_list_id" :to="'/my/history/'+song.song_id" class="song-name-box">{{song.title}}-{{song.author}}</router-link>
         <router-link v-if="song.listid==downloaded_songlist_id" :to="'/my/downloaded/'+song.song_id" class="song-name-box">{{song.title}}-{{song.author}}</router-link>
       <i class="play-icon" @click.stop="playlocalmusic(song)"></i>
    
        </li>
    </ul>
    </div>
</li>
</template>
<style scoped>

</style>
<script>
    import constant from "../../constant.js"
    import dataBase from '../../dataoperation/websql/sqlstorage'

    import {
        mapGetters
    } from 'vuex'
    export default {
        name: "sug-local-song",
        props: {
            query: String
        },
        data() {
            return {
                local_songlist_id: constant.local_songlist_id,
                history_list_id: constant.history_list_id,
                downloaded_songlist_id: constant.downloaded_songlist_id
            }
        },
        computed: {
            ...mapGetters({
                local_songlist: 'sug_local_list'
            })
        },
        watch: {
            query: function(newVal, oldVal) {
                if (newVal.trim().length > 0) {
                    this.$store.dispatch('getSugLocalSongList', {
                        "query": newVal
                    })
                }
            }
        },
        created() {
            if (this.query.trim().length > 0) {
                this.$store.dispatch('getSugLocalSongList', {
                    "query": this.query
                })
            }
        },

        methods: {
            setSearchKeyword(event) {
                let selectedVal = event.target.innerText
                this.$parent.$data.keyword = selectedVal
                document.getElementById('searchInput').value = selectedVal
                eventBus.$emit('isShowSug', false)

            },
            playlocalmusic(song) {
                this.$store.dispatch('playSingleSong', song)
            }
        }
    }
</script>