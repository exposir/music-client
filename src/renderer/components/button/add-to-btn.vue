<template>
        <div>
            <button-item :btnTxt="btnTxt" :icon="'download-icon'" :handleAction="addSong"></button-item>
        </div>
    </template>
<script>
    import buttonItem from './button-item.vue'
    import commonFuns from '../../components/commonFuns/common.js'
    import { mapGetters } from 'vuex';
    export default {
        name: 'add-to-btn',
        computed:mapGetters({
           massOpSelectLines: "massOpSelectLines"
        }),
        props: {
            data: Array,
            listid: String,
            btnTxt: {
                default: '添加到'
            }
        },
        components: {
            buttonItem
        },
        created(){
        },
        methods: {
            addSong() {
                let songArray_select = this.commonFuns.getSelectSongArray(this.massOpSelectLines, this.data);
                // console.log(songArray_select)
                let positionData = this.commonFuns.calculateAttr();
                // let songArray = [];
                // for (let i = 0; i < songArray_select.length; i++) {
                //     let songInfo = songArray_select[i];
                //     if (this.commonFuns.isSongCanDownload(songInfo)) {
                //         songArray.push(songInfo);
                //     }
                // }
                let listid = this.listid;
                if (songArray_select.length > 0) {
                    this.MessageBox.addToSong(songArray_select, listid, positionData);
                } else {
                    this.commonFuns.createTips('暂无可添加歌曲', 'error')
                }
            }
        }
    }
</script>
<style scoped>
    .download-icon::before {
        background: url('~static/images/buttonIcon/icon_add.svg') no-repeat;
    }
</style>