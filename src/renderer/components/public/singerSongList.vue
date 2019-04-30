<template>
<div class="singer-song-wrapper">
    <song-list :data="songList" :detail="{'classname':'','type':'online'}" :fields="{'hot':true,'album_title':true,'singer':false}"></song-list>
    <div class="page-box" v-if="total>pageSize&&isSee">
        <el-pagination small layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="onChangePage">
        </el-pagination>
    </div>
</div>
</template>
<script>
    import songList from 'components/public/song-list.vue'
    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'singer-song-list',
        data() {
            return {
                pageSize: 20,
                isSee:false
            }
        },
        props: {
            artistid: String,
            tinguid: String
        },
        computed: {
            ...mapGetters({
                songdata: 'singerSongdata'
            }),
            songList() {
                return this.songdata.songlist
            },
            total() {
                return parseFloat(this.songdata.songnums)
            }
        },
        created() {
            this.fetchData()
                // if(!isExist){
                //     this.$router.replace({path: '/404/' })
                // }
        },
        updated:function(){
            setTimeout(() => {
                 this.$data.isSee = true;
            }, 100);
          
        },
        components: {
            songList
        },
        methods: {
            fetchData(page) {
                let offset = page ? (page - 1) * this.pageSize : 0
                this.$store.dispatch('getSingerSonglist', {
                    'artistid': this.artistid,
                    'tinguid': this.tinguid,
                    'limits': this.pageSize,
                    'offset': offset
                })
            },
            onChangePage(page) {
                document.querySelector('.song-list-wrapper').querySelectorAll('.active').forEach((item, index) => {
                    this.domAction.removeClass(item, 'active')
                })
                this.$nextTick(() => {
                    document.querySelector('.show').scrollTop = 0
                    this.fetchData(page)
                })
                // eventBus.$emit('isMass', false);
            },
            playWholeSongList(paramsJson) {
                this.$store.dispatch('playWholeSongList', paramsJson)
            }
        }
    }
</script>
<style scoped>
    .singer-song-wrapper {
        padding: 0 17px;
    }
    
    .el-pagination {
        margin: 15px auto;
        padding: 0;
    }
</style>