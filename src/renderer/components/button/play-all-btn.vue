<template>
    <button-item v-if="data && data.length > 0" :btnTxt="btnTxt" :icon="'playall-icon'" :handleAction="playWholeSongList"></button-item>
    <button-item v-else :btnTxt="btnTxt" :icon="'playall-icon-none'"></button-item>
</template>
<script>
    import buttonItem from './button-item.vue'
    import constant from '../../constant.js'
    export default {
        name: 'play-all-btn',
        props: {
            data: Array,
            listid: String,
            btnTxt: {
                default: '播放全部'
            }
        },
        components: {
            buttonItem
        },
        methods: {
            playWholeSongList() {
                console.log('current play list is: ' + this.listid)
                let data = this.data;
                if (this.listid != constant.history_list_id &&
                    this.listid != constant.local_songlist_id &&
                    this.listid != constant.current_play_list_id &&
                    this.listid != constant.downloaded_songlist_id &&
                    this.listid != constant.favorite_songlist_id) {
                        for (let i = 0; i < data.length; i++) {
                            let song = data[i];
                            song.listid = this.listid;
                        }
                    }

                if (data.length > 0) {
                    this.$store.dispatch('playWholeSongList', {
                        'songArray': data
                    })
                    eventBus.$emit('isShowAddMusicIcon', true)
                }
            }
        }
    }
</script>