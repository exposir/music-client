<template>
<div>
    <album-list :data="albumList" :fields="{'pic':true,'title':true,'time':true}"></album-list>
 <!--翻页-->
     <div class="page-box" v-if="total>pageSize">
        <el-pagination small layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="onChangePage">
        </el-pagination>
    </div>
</div>
</template>
<script>
    import albumList from 'components/public/album-list.vue'
    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'singer-album-list',
        data() {
            return {
                pageSize: 10
            }
        },
        props: {
            artistid: String,
            tinguid: String
        },
        computed: {
            ...mapGetters({
                albumdata: 'singerAlbumdata'
            }),
            albumList() {
                return this.albumdata.albumlist
            },
            total() {
                return parseFloat(this.albumdata.albumnums)
            }
        },
        created() {
            this.fetchData()
        },
        components: {
            albumList
        },
        methods: {
            fetchData(page) {
                let offset = page ? (page - 1) * this.pageSize : 0
                this.$store.dispatch('getSingerAlbumList', {
                    'artistid': this.artistid,
                    'tinguid': this.tinguid,
                    'order': 1,
                    'limits': this.pageSize,
                    'offset': offset
                })
            },
            onChangePage(page) {
                this.$nextTick(() => {
                    document.querySelector('.show').scrollTop = 0
                    this.fetchData(page)
                })
            },
            playWholeAlbum(albumid) {
                this.$store.dispatch('playWholeAlbum', albumid)
            }
        }
    }
</script>
<style scoped>
    .singer-album-list {
        margin-top: 16px;
    }
    
    .singer-album-list a:hover {
        color: #499bd4;
    }
</style>