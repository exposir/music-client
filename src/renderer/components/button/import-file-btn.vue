<template>
    <div class="add-btn-wrap">
        <span @click="isShowMenu=!isShowMenu">
            <button-item :btnTxt="'导入歌曲'" :icon="'import-icon'"></button-item>
        </span>
        <ul class="menu-list" v-show="isShowMenu">
            <li @click="importmusicfiles">导入本地歌曲</li>
            <li @click="scandirectory">导入本地文件夹</li>
        </ul>
    </div>
</template>
<script>
    import importfile from '../../fileimport/fileimport.js'
    import constant from '../../constant.js'
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import commonFuns from '../../components/commonFuns/common.js'
    import buttonItem from 'components/button/button-item.vue'
    const fs = require('fs');

    export default {
        name: "import-file-btn",
        data() {
            return {
                isShowMenu: false
            }
        },
        components: {
            buttonItem
        },
        created() {
            let me = this
            document.body.addEventListener('click', this.clickEventListener);
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.clickEventListener)
        },
        methods: {
            clickEventListener(event) {
                if (!event.target.classList.contains('import-icon')) {
                    this.isShowMenu = false
                }
            },
            scanfoldercallback(songs) {
                if (songs.length > 0) {
                    let songArray = songs;
                    let isReset = false;
                    this.$store.dispatch('addSongsToLocalSonglist', {
                        songArray,
                        isReset
                    });
                }
            },
            scanSongsCallback(song_array) {
                if (song_array.length > 0) {
                    let songArray = song_array;
                    let isReset = false;
                    this.$store.dispatch('addSongsToLocalSonglist', {
                        songArray,
                        isReset
                    });
                }
            },
            importmusicfiles() {
                this.isShowMenu = false;
                let param = {};
                param.exts = [];
                this.$store.dispatch('getSupportTypes', param)
                importfile.importsongfiles(this.scanSongsCallback, param.exts);
            },
            scandirectory() {
                this.isShowMenu = false;
                let param = {};
                param.exts = [];
                this.$store.dispatch('getSupportTypes', param)
                importfile.importdirectorysongfiles(this.scanfoldercallback, param.exts);
            }
        }
    }
</script>
<style scoped>
    .add-btn-wrap {
        position: relative;
    }
    
    .menu-list {
        position: absolute;
        display: flex;
        flex-flow: column wrap;
        justify-content: flex-start;
        align-items: center;
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, .3);
        z-index: 200;
        background: #fff;
        width: 110px;
        margin-top: 4px;
        margin-left: -10px;
    }
    
    .menu-list li {
        width: 100%;
        height: 38px;
        line-height: 38px;
        padding: 0 13px;
        border-bottom: solid 1px #f2f2f2;
        cursor: pointer;
    }
    
    .menu-list li:hover {
        background-color: #e13228;
        color: #ffffff;
    }
</style>