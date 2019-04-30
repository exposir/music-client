<template>
<div class="button-collect-wrapper">
    <play-all-btn v-if="isShow.playall" :data="allSongs" :btnTxt="btnTxt.playall" :listid="listid"></play-all-btn>
    <import-file-btn v-if="isShow.import" :btnTxt="btnTxt.import"></import-file-btn>
    <!--<download-all-btn v-if="isShow.downall" :data="allSongs"></download-all-btn>-->
    <mass-op-btn v-if="isShow.massop" :data="allSongs"></mass-op-btn>
    <favour-btn v-if="isShow.favour" :data="favourData.data" :showdata="favourData.showdata"></favour-btn>
    <more-btn v-if="isShow.more" :data="moredata"></more-btn>
    <play-btn v-if="isShow.play" :data="allSongs"></play-btn>
    <add-to-btn v-if="isShow.addto" :data="allSongs" :listid="listid"></add-to-btn>
    <delete-btn v-if="isShow.delete&&isShow.massexit" :data="allSongs" :listid="listid" :gedaninfo="moredata"></delete-btn>
    <download-btn v-if="isShow.download&&listid!='local_songlist'" :data="allSongs"></download-btn>
    <mass-exit-btn v-if="isShow.massexit" :data="allSongs"></mass-exit-btn>
</div>
</template>
<script>
    import favourBtn from './favourBtn.vue'
    import playAllBtn from './play-all-btn.vue'
    import downloadAllBtn from './download-all-btn.vue'
    import moreBtn from './more-btn.vue'
    import massOpBtn from './mass-op-btn.vue'
    import playBtn from './play-btn.vue'
    import addToBtn from './add-to-btn.vue'
    import downloadBtn from './download-btn.vue'
    import massExitBtn from './mass-exit-btn.vue'
    import importFileBtn from './import-file-btn.vue'
    import deleteBtn from './delete-btn.vue'
    export default {
        props: {
            allSongs: Array,
            listid: String,
            favourData: Object,
            moredata: {
                type: Object,
                default: function() {
                    return {
                        'gedanInfo': {},
                        'gedanType': 'online'
                    }
                }
            },
            btnTxt: {
                type: Object,
                default: function() {
                    return {
                        playall: '播放全部',
                        import: '导入歌曲'
                    }
                }
            },
            isShow: {
                type: Object,
                default: {
                    'playall': true,
                    'massop': true,
                    'favour': true,
                    'more': true,
                    'play': true,
                    'addto': true,
                    'massexit': true,
                    'download': true,
                    'import': false,
                    'delete':false,
                }
            },
        },
        components: {
            favourBtn,
            playAllBtn,
            downloadAllBtn,
            moreBtn,
            massOpBtn,
            playBtn,
            addToBtn,
            massExitBtn,
            downloadBtn,
            importFileBtn,
            deleteBtn
        }
    }
</script>
<style>
    .button-collect-wrapper {
        display: flex;
        flex-flow: row nowrap;
    }

    .button-collect-wrapper .bd-btn {
        margin-right: 10px;
    }
</style>