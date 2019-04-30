<template>
    <i v-if="disabled!=='disabled'" class="download-icon" :class="{songlist:type==='songlist',minibar:type==='minibar'}" @click="downloadSong(data,$event)" title="下载"></i>
    <i v-else-if="disabled==='disabled'"  class="download-icon" :class="{songlist:type==='songlist',minibar:type==='minibar',disabled:disabled==='disabled'}"  title="下载"></i>
</template>
<script>
    export default {
        name: 'download-icon',
        props: {
            data: Object,
            type: {
                type: String,
                default: ''
            },
            disabled: String
        },

        methods: {
            downloadSong(songinfoJson, event) {
                let clientX = event.clientX
                let clientY = event.clientY

                let positionData = {
                    'clientX': clientX,
                    'clientY': clientY
                }
                let songArray = [];
                songArray.push(songinfoJson);

                // console.log(songinfoJson)
                if (this.commonFuns.isSongCanDownload(songinfoJson)) {
                    this.MessageBox.download(songArray, positionData);
                } else {
                    this.commonFuns.createTips('该歌曲暂不支持下载', 'error');
                }

            }
        }
    }
</script>
<style scoped>
    .download-icon {
        display: inline-block;
        width: 18px;
        height: 20px;
        background: url('~static/images/minibar/icon_11.svg') no-repeat;
        cursor: pointer;
    }
    
    .minibar {
        position: relative;
        top: -2px;
    }
    
    .download-icon:hover {
        background: url('~static/images/minibar/icon_11_2.svg') no-repeat;
    }
    
    .songlist.download-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('~static/images/listIcon/icon3.svg') no-repeat;
        cursor: pointer;
    }
    
    .songlist.download-icon:hover {
        background: url('~static/images/listIcon/icon3_1.svg') no-repeat;
    }
    
    .songlist.disabled.download-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('~static/images/listIcon/icon3_2.svg') no-repeat;
        cursor: default;
    }
    
    .disabled.download-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('~static/images/miniBar/icon_11_4.svg') no-repeat;
        cursor: default;
    }
</style>