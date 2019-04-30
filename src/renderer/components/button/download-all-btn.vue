<template>
    <div>
        <button-item :btnTxt="'下载全部'" :icon="'download-icon'" :handleAction="downloadAllSong"></button-item>
    </div>
</template>
<script>
import buttonItem from './button-item.vue'
import commonFuns from '../../components/commonFuns/common.js'
export default {
    name: 'download-all-btn',
    props: {
        data: Array
    },
    components: {
        buttonItem
    },
    methods: {
        downloadAllSong() {
            let clientX = event.clientX
            let clientY = event.clientY
            let positionData = {
                'clientX': clientX,
                'clientY': clientY
            }
            let songArray = [];
            for (let i = 0; i < this.data.length; i++) {
                let songInfo = this.data[i];
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