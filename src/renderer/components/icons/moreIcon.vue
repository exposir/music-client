<template>
    <i class="more-icon" :class="{songList:type==='songlist',miniList:type==='minilist'}" @click="handleAction(data,$event)" title="更多">
    </i>
</template>
<script>
import MessageBox from 'components/messageBox/main.js'
export default {
    name: 'more-icon',
    props: {
        data: {
            type: Object,
            default: function () {
                return {
                    'songArray': [],
                    'type': '',
                    'list_id': '',
                    'selectindex': 0
                }
            }
        },
        type: {
            type: String,
            default: ''
        }
    },
    created() {

    },
    methods: {
        handleAction(data, event) {
            let songArray = data.songArray,
                type = data.type,
                list_id = data.list_id,
                index = data.selectindex;
            let clientX = event.clientX
            let clientY = event.clientY

            if (type == 'minibar') {
                let isHasSong = false;
                if (songArray.length > 0) {
                    let song = songArray[0];
                    let songid = this.commonFuns.getSongId(song);
                    if (songid && songid.length > 0) {
                        isHasSong = true;
                    }
                }

                if (!isHasSong) {
                    return;
                }
            }

            let positionData = {
                'clientX': clientX,
                'clientY': clientY
            }

            if(type == 'minimode') {
                positionData = {
                    'clientX': 30,
                    'clientY': 52
                }
            }


            if (document.querySelector('.oncontext-menu-wrapper')) {
                document.body.removeChild(document.querySelector('.oncontext-menu-wrapper'))
            }
            let select_index_array = [];
            select_index_array.push(index)
            // console.log('more icon index is: ' + index)
            MessageBox.context(songArray, select_index_array, type, list_id, positionData, {
                modal: false
            })
        }
    }
}
</script>
<style scoped>
.more-icon {
    display: inline-block;
    width: 18px;
    height: 20px;
    background: url('~static/images/miniBar/icon_12.svg') no-repeat;
    cursor: pointer;
}

.more-icon:hover {
    background: url('~static/images/miniBar/icon_12_2.svg') no-repeat;
}

.songList.more-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~static/images/listIcon/icon4.svg') no-repeat;
    cursor: pointer;
}

.songList.more-icon:hover {
    background: url('~static/images/listIcon/icon4_1.svg') no-repeat;
}
.miniList.more-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: url('~static/images/miniBar/mini_more.svg') no-repeat;
    cursor: pointer;
}

.miniList.more-icon:hover {
    background: url('~static/images/miniBar/mini_more.svg') no-repeat;
}
</style>