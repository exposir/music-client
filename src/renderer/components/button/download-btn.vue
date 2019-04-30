<template>
        <div>
            <button-item :btnTxt="'下载'" :icon="'download-icon'" :handleAction="downloadSong"></button-item>
        </div>
    </template>
<script>
    import buttonItem from './button-item.vue'
    import commonFuns from '../../components/commonFuns/common.js'
    import { mapGetters } from 'vuex';
    export default {
        name: 'download-btn',
        computed:mapGetters({
           massOpSelectLines: "massOpSelectLines"
        }),
        props: {
            data: Array
        },
        components: {
            buttonItem
        },
        methods: {
            downloadSong() {
                let positionData = this.commonFuns.calculateAttr('download');
                let songArray = [];
                // console.log(this.massOpSelectLines)
                // console.log(this.data);
                let songArray_select = this.commonFuns.getSelectSongArray(this.massOpSelectLines, this.data);
                for (let i = 0; i < songArray_select.length; i++) {
                    let songInfo = songArray_select[i];
                    // console.log(songInfo)
                    if (this.commonFuns.isSongCanDownload(songInfo)) {
                        songArray.push(songInfo);
                    }
                }

                if (songArray.length > 0) {
                    this.MessageBox.download(songArray, positionData);
                } else {
                    this.commonFuns.createTips('暂无可下载歌曲', 'error')
                }

            }
        }
    }
</script>