<template>
    <div class="favour-window mainMusicWrapper">
        <div class="main-menu-box">
            <ul class="cf favour-tab fixedTab">
                <li><router-link to="/my/local/0">本地音乐{{localsonglist.length}}<span style=""></span></router-link></li>
                <li><router-link to="/my/downloaded/0">已下载歌曲{{downloadedSongList.length}}<span></span></router-link></li>
                <li><router-link to="/my/downloading/">正在下载{{downloading_list.length}}<span></span></router-link></li> 
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
            }
        },
        computed: {
            ...mapGetters({
                downloading_list: 'downloadingItems',
                downloadedSongList: 'downloadedSonglist',
                localsonglist: 'localSonglist',
            })
        },
        created() {
            // reportService.clickReport({
            //     'type': 'click',
            //     'page': 'functionlist',
            //     'pos': 'local'
            // });
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
        height: 100%;
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