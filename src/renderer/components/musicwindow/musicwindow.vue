<template>
    <div class="mu-window mainMusicWrapper">
        <div class="main-menu-box">
            <ul class="cf mu-tab fixedTab">
                <li><router-link to="/recommend">推荐<span></span></router-link></li>
                <li><router-link to="/bangdanIndex">榜单<span></span></router-link></li>
                <li><router-link to="/gedanIndex/全部/1" :class="{'isShow':isGedan}">歌单<span></span></router-link></li>
                <li><router-link to="/radioIndex" @click.native="commonFuns.crmStatistics('musicwindow','radio')">电台<span></span></router-link></li>
                <li><router-link to="/singerIndex" :class="{'isShow':isSinger}">歌手<span></span></router-link></li>
                <li><router-link to="/newSongIndex/0" :class="{'isShow':isRecAlbum}" @click.native="commonFuns.crmStatistics('musicwindow','album')">新碟上架<span></span></router-link></li>
            </ul>
        </div>
        <div class="main-wrapper scrollBarBody">
            <div class="mu-con">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script>
    import reportService from 'service/reportService'
    import scrollBar from '../scrollBar/scrollBar.js'
    export default {
        name: 'mu-window',
        data() {
            return {
                isSinger: false,
                isGedan: false,
                isRecAlbum: false,
            }
        },
        created() {
            reportService.clickReport({
                'type': 'click',
                'page': 'functionlist',
                'pos': 'musicwindow'
            });
            this.isSinger = false; 
            this.isGedan = false;
            this.isRecAlbum = false;
            let paths = this.$route.path;
            if (paths.indexOf('singerIndex') > -1 || paths.indexOf('singerlist') > -1) {
                this.isSinger = true;
            }
            if (paths.indexOf('gedanIndex') > -1) {
                this.isGedan = true;
            }
            if (paths.indexOf('newSongIndex') > -1) {
                this.isRecAlbum = true;
            }
        },
        mounted() {
            let mainMusicWrapperDom = document.querySelector('.mainMusicWrapper')
            if (mainMusicWrapperDom) {
                let mainMusicWrapperHeight = this.domAction.getStyle(mainMusicWrapperDom, 'height')

                let mainHeaderDom = mainMusicWrapperDom.querySelector('.main-menu-box')
                let mainHeaderDomTotalHeight = this.domAction.getStyle(mainHeaderDom, 'height')


                let mainWrapperHeight = parseFloat(mainMusicWrapperHeight) - parseFloat(mainHeaderDomTotalHeight) 

                let scrollBarBodyDom = document.querySelector('.scrollBarBody')
                this.domAction.setStyle(scrollBarBodyDom, 'height', mainWrapperHeight + 'px')
            }
        },
        watch: {
            '$route' (to, from) {
                this.isSinger = false;
                this.isGedan = false;
                this.isRecAlbum = false;
                if (to.path === '/singerIndex') {
                    this.$router.push('/singerlist');
                }
                if (to.path.indexOf('singerIndex') > -1 || to.path.indexOf('singerlist') > -1) {
                    this.isSinger = true;
                }

                if (to.path.indexOf('gedanIndex') > -1) {
                    this.isGedan = true;
                }
                if (to.path.indexOf('newSongIndex') > -1) {
                    this.isRecAlbum = true;
                } 
            }
        }
    }
</script>
<style>
    .mu-window {
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
    
    .mu-tab {
        display: flex;
        /* width: 340px; */
        height: 100%;
        justify-content: center;
        align-items: center;
    }
    
    .mu-tab li {
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
    
    .mu-con {
        /*width: 764px;
        margin: 0 auto;*/
        /*padding: 16px 17px 0 17px;*/
    }
    
    .mu-tab li a {
        display: inline-block;
        /* width: 68px; */
        /*transition:color .1s;*/
    }
    
    .mu-tab li:hover a,
    .mu-tab li a.isShow {
        color: #e13228;
        height: 33px;
        /* background: url('~static/images/nav_line.svg') no-repeat left bottom; */
        /*border-bottom: solid 4px #22c5bd;*/
    }


    .favour-tab li a span.isShowSpan {
        background: #e13228
    }
    .mu-tab li:hover span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        border-radius: 4px;
        background: #e13228;
    }
    
    .mu-tab li a.router-link-active {
        color: #e13228;
        height: 33px;
        /* background: url('~static/images/nav_line.svg') no-repeat left bottom; */
    }

    .mu-tab li a.router-link-active span,
    .mu-tab li a.isShow span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }
</style>