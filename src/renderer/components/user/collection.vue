<template>
    <div class="favour-window mainMusicWrapper">
        <div class="main-menu-box">
            <ul v-if="loginStatus" class="cf favour-tab fixedTab">
                <li><router-link to="/favourCollectionSong">单曲({{userFavoriteSongListNum}})<span style=""></span></router-link></li>
                <li><router-link to="/favourGedan">歌单({{userFavoriteDiyListNum}})<span></span></router-link></li>
                <li><router-link to="/favourSinger">歌手({{userFavoriteSingerListNum}})<span></span></router-link></li>
                <li><router-link to="/favourAlbum">专辑({{userFavoriteAlbumListNum}})<span></span></router-link></li>
            </ul>
        </div>
        <div class="favour-con">
            <router-view></router-view>
        </div>
    </div>
</template>
<script scoped>
    import reportService from 'service/reportService'
    import scrollBar from '../scrollBar/scrollBar.js'

    import {
        mapGetters
    } from 'vuex'

    export default {
        name: 'favour-window',
        data() {
            return {
                isSinger: false,
                isGedan: false
            }
        },
        computed: {
            ...mapGetters({
                userFavoriteSongList: 'userFavoriteSongList',
                userFavoriteSingerList: 'userFavoriteSingerList',
                userFavoriteAlbumList: 'userFavoriteAlbumList',
                userFavoriteDiyList: 'userFavoriteDiyList',
                loginStatus: 'loginStatus'
            }),
            userFavoriteSingerListNum() {
                if (this.userFavoriteSingerList.listinfo && Array.isArray(this.userFavoriteSingerList.listinfo) && this.loginStatus) {
                    return this.userFavoriteSingerList.listinfo.length
                } else {
                    return '0'
                }
            },
            userFavoriteSongListNum() {
                let total = this.userFavoriteSongList.total
                if (typeof total != "undefined" && this.loginStatus) {
                    return this.userFavoriteSongList.total
                } else {
                    return 0
                }
            },
            userFavoriteDiyListNum() {
                if (
                    this.userFavoriteDiyList.listinfo &&
                    Array.isArray(this.userFavoriteDiyList.listinfo) && this.loginStatus
                ) {
                    return this.userFavoriteDiyList.listinfo.length;
                } else {
                    return "0";
                }
            },
            userFavoriteAlbumListNum() {
                if (this.userFavoriteAlbumList.listinfo && Array.isArray(this.userFavoriteAlbumList.listinfo) && this.loginStatus) {
                    return this.userFavoriteAlbumList.listinfo.length
                } else {
                    return '0'
                }
            }
        },
        created() {
            reportService.clickReport({
                'type': 'click',
                'page': 'functionlist',
                'pos': 'collection'
            });
            this.isSinger = false;
            this.isGedan = false;
            let paths = this.$route.path;
            if (paths.indexOf('singerIndex') > -1 || paths.indexOf('singerlist') > -1) {
                this.isSinger = true;
            }
            if (paths.indexOf('gedanIndex') > -1) {
                this.isGedan = true;
            }
        },
        mounted() {
            
        },
        watch: {
            '$route' (to, from) {
                this.isSinger = false;
                this.isGedan = false;
                if (to.path === '/singerIndex') {
                    this.$router.push('/singerlist');
                }
                if (to.path.indexOf('singerIndex') > -1 || to.path.indexOf('singerlist') > -1) {
                    this.isSinger = true;
                }

                if (to.path.indexOf('gedanIndex') > -1) {
                    this.isGedan = true;
                }
            }
        }
    }
</script>
<style scoped>
    
    .favour-window {
        height: 100%;
        position: relative;
    }
    
    .main-menu-box {
        display: flex;
        width: 100%;
        height: 34px;
        justify-content: center;
        align-items: center;
    }
    
    .favour-tab {
        display: flex;
        /* width: 340px; */
        height: 100%;
        justify-content: center;
        align-items: center;
    }
    
    .favour-tab li {
        font-size: 14px;
        height: 34px;
        line-height: 34px;
        color: #515151;
        /* width: 68px; */
        background: #fff;
        text-align: center;
        margin-left: 34px;
        margin-right: 34px;
        position: relative;
    }
    
    .main-wrapper {
        box-sizing: border-box;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    
    .favour-con {
        /*width: 764px;
        margin: 0 auto;*/
        /*padding: 16px 17px 0 17px;*/
        /* height: 100%; */
        height: calc(100% - 34px);
        overflow: hidden;
    }
    
    .favour-tab li a {
        display: inline-block;
        /* width: 68px; */
        /*transition:color .1s;*/
    }
    
    .favour-tab li:hover a,
    .favour-tab li a.isShow {
        color: #e13228;
        height: 34px;
        /* background: url('~static/images/nav_line.svg') no-repeat left bottom;
        background-size: 100% 4px; */
    }
    .favour-tab li a.isShow span,
    .favour-tab li:hover span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }

    .favour-tab li a.router-link-active {
        color: #e13228;
        height: 34px;
    }
    .favour-tab li a.router-link-active span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }

</style>