<template>
    <div v-cloak class="context-menu-wrapper">
        <ul>
            <li class="context" @click="downloadSong(0)" v-if="sq.length > 0">无损品质</li>
            <li class="context" @click="downloadSong(1)" v-if="hq.length > 0">高品质</li>
            <li class="context" @click="downloadSong(2)" v-if="normal.length > 0">标准品质</li>
        </ul>
    </div>
</template>

<script>
import commonFuns from '../../components/commonFuns/common.js'
export default {
    name: 'download-song',
    data() {
        return {
            sq: [],
            hq: [],
            normal: []
        }
    },
    props: {
        songInfo: Object,
    },
    methods: {
        //download_type 0:SQ  1:高品质 2:标准品质
        downloadSong(download_type) {
            if (download_type === 0 && sq.length > 0) {
                this.$store.dispatch('addDownloadingItem', { 'dt': sq[0], 'song_info': songInfo })
            } else if (download_type === 1 && hq.length > 0) {
                this.$store.dispatch('addDownloadingItem', { 'dt': hq[0], 'song_info': songInfo })
            } else {
                if (normal.length > 0) {
                    this.$store.dispatch('addDownloadingItem', { 'dt': normal[0], 'song_info': songInfo })
                } 
            }
            commonFuns.createTips("已加入下载队列");
        },

        isHaveDonglownloadType(download_type) {
            splitToDownloadArray();

            if (download_type === 0) {
                return sq.length > 0;
            } else if (download_type === 1) {
                return hq.length > 0;
            } else {
                return normal.length > 0;
            }
        },

        splitToDownloadArray() {
            if (hq.length > 0 || normal.length > 0) {
                return;
            }

            let file_bitrates = songInfo.bitrate.split(',');
            file_bitrates = file_bitrates.sort((a, b) => a - b);

            let sq = [];
            let hq = [];
            let normal = [];

            let index_sq = file_bitrates.findIndex(function (element) {
                let int_val = parseInt(element);
                return int_val > 320;
            });

            if (index_sq != -1) {
                for (let i = 0; i <= index_sq; i++) {
                    sq.push(file_bitrates[i])
                }
            }

            let index_hq = file_bitrates.findIndex(function (element) {
                let int_val = parseInt(element);
                return int_val <= 128;
            })

            if (index_hq != -1) {
                for (let i = index_sq + 1; i < index_hq; i++) {
                    hq.push(file_bitrates[i])
                }

                for (let i = index_hq; i < file_bitrates.length; i++) {
                    normal.push(file_bitrates[i]);
                }
            }
        }
    }
}
</script>