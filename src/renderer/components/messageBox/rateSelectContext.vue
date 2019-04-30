<template>
    <div v-cloak class="rateSelectContext" :style="{'left':positionX+'px','top':positionY+'px'}" :class="{'opacity':!isShowContext}">
        <ul>
            <li @click="downloadSong(0)" v-if="isHaveDonglownloadType(0)">无损品质
                <i class="download-vip-icon"></i>
            </li>
            <li @click="downloadSong(1)" v-if="isHaveDonglownloadType(1)">高品质</li>
            <li @click="downloadSong(2)" v-if="isHaveDonglownloadType(2)">标准品质</li>
    
        </ul>
    </div>
</template>

<script>
import Popup from 'utils/popup'
import downloadingService from '../../service/downloadSongService.js'
import {
    mapGetters,
    mapActions
} from 'vuex'

const {
        shell
    } = require('electron');

export default {
    name: 'downloadmenu',
    mixins: [Popup],
    props: {
        modal: {
            default: true
        },
        closeOnClickModal: {
            default: true
        }
    },
    computed: {
        ...mapGetters({
            loginStatus: 'loginStatus',
            userInfo: 'loginUserInfo'
        }),
        clientY() {
            return this.positionData.clientY
        },
        clientX() {
            return this.positionData.clientX
        },
        boxHeight() {
            let boxDom = document.querySelector('.rateSelectContext')

            let boxHeight = parseFloat(this.domAction.getStyle(boxDom, 'height'))
            if (!boxDom) {
                let me = this
                let count = 0
                let interval = setInterval(function () {
                    count++
                    boxDom = document.querySelector('.rateSelectContext')
                    if (boxDom) {
                        me.isShowContext = true
                        boxHeight = parseFloat(me.domAction.getStyle(boxDom, 'height'))

                        me.boxData.height = boxHeight
                        // console.log('boxHeight:' + boxHeight)
                        clearInterval(interval)


                    } else {
                        if (count > 10) {
                            clearInterval(interval)
                        }
                    }
                }, 300)
            } else {
                return boxHeight
            }
        },
        boxWidth() {
            let boxDom = document.querySelector('.rateSelectContext')
            let boxWidth = parseFloat(this.domAction.getStyle(boxDom, 'width'))
            if (!boxDom) {
                let me = this
                let count = 0
                let interval = setInterval(function () {
                    count++
                    boxDom = document.querySelector('.rateSelectContext')
                    if (boxDom) {
                        me.isShowContext = true
                        boxWidth = parseFloat(me.domAction.getStyle(boxDom, 'width'))
                        me.boxData.width = boxWidth
                        // console.log('boxHeight:' + boxWidth)
                        clearInterval(interval)


                    } else {
                        if (count > 10) {
                            clearInterval(interval)
                        }
                    }
                }, 300)
            } else {
                return boxWidth
            }
        },
        miniBarHeight() {
            let minibarBox = document.getElementById('minibar')
            let miniBarHeight = parseFloat(this.domAction.getStyle(minibarBox, 'height'))
            return miniBarHeight
        },
        clientHeight() {
            //主区域
            let mainContentBox = document.getElementById('app')
            let clientHeight = parseFloat(this.domAction.getStyle(mainContentBox, 'height'))
            return clientHeight
        },
        clientWidth() {
            //主区域
            let mainContentBox = document.getElementById('app')
            let clientHeight = parseFloat(this.domAction.getStyle(mainContentBox, 'width'))
            return clientHeight
        },
        positionX() {
            let clientX = this.clientX,
                boxWidth = this.boxWidth ? this.boxWidth : this.boxData.width,
                clientWidth = this.clientWidth
            let scrollBarWidth = 8
            if (clientX + boxWidth > clientWidth - scrollBarWidth) {
                this.isComputedLeftStyle = true
                let positionX = clientX - boxWidth
                return positionX > 0 ? positionX : '0'
            } else {
                return clientX
            }
        },
        positionY() {
            let clientY = this.clientY,
                boxHeight = this.boxHeight ? this.boxHeight : this.boxData.height,
                clientHeight = this.clientHeight,
                miniBarHeight = this.miniBarHeight,
                positionY = 0
            // console.log(clientY + '-' + boxHeight + '-' + clientHeight + '-' + miniBarHeight)
            // console.log(clientY + boxHeight > clientHeight - miniBarHeight)
            if (clientY + boxHeight > clientHeight - miniBarHeight) {
                positionY = clientY - boxHeight
                // console.log('positionY' + positionY)
                return positionY > 0 ? positionY : '0'
            } else {
                return clientY
            }


        }
    },
    data() {
        return {
            songArray: [],
            positionData: {
                'clientX': 0,
                'clientY': 0
            },
            isComputedLeftStyle: false,
            boxData: {
                width: 0,
                height: 0
            },
            isShowContext: false
        }
    },
    created() {
        if (document.querySelector('.rateSelectContext')) {
            this.isShowContext = true
        }
        document.body.addEventListener('click', this.clickEventListener);
    },
    beforeDestroy() {
        document.body.removeEventListener('click', this.clickEventListener);
    },
    methods: {
        clickEventListener(event) {
            if (!event.target.classList.contains('download-btn') && !event.target.classList.contains('download-icon') && document.getElementsByClassName('rateSelectContext').length > 0) {
                document.body.removeChild(document.getElementsByClassName('rateSelectContext')[0])
            }
        },
        //download_type 0:SQ  1:高品质 2:标准品质
        downloadSong(download_type) {
            if (!this.loginStatus) {
                if (download_type == 0) {
                    this.$store.dispatch('TpassLogin');
                    return;
                }
            }

            if (download_type == 0) {
                if (this.userInfo && this.userInfo.flag != 200) {
                    let song = this.songArray[0];
                    this.$store.dispatch('showOpenVipMessageBox');
                    return;
                }
            }


            console.log('current download song count is: ' + this.songArray.length)
            for (let i = 0; i < this.songArray.length; i++) {
                let songInfo = this.songArray[i];
                let param = {
                    'sq': [],
                    'hq': [],
                    'normal': []
                };
                let empty = [];
                this.commonFuns.getSongBitrates(songInfo, param);
                let sq = param.sq.concat(empty);
                let hq = param.hq.concat(empty);
                let normal = param.normal.concat(empty);
                if (sq.length <= 0 && hq.length <= 0 && normal.length <= 0) {
                    continue;
                }
                // console.log(normal)

                let timestamp = Date.parse(new Date());
                let dt = normal[0];
                if (normal.length <= 0) {
                    dt = hq[0];
                    if (hq.length <= 0) {
                        dt = sq[0];
                    }
                }
                if (download_type === 0) {
                    if (sq.length > 0) {
                        dt = sq[0]
                    } else if (hq.length > 0) {
                        dt = hq[0];
                    }
                } else if (download_type === 1) {
                    if (hq.length > 0) {
                        dt = hq[0]
                    }
                }
                let songid = this.commonFuns.getSongId(songInfo);

                if (this.songArray.length === 1) {
                    let me = this;
                    let request_data = {
                        'dt': dt,
                        'timestamp': timestamp,
                        'songid': songid
                    };
                    if (songInfo.hasOwnProperty('listid')) {
                        let listid = songInfo.listid;
                        if (listid == 'favorite_songlist') {
                            request_data.res = 2;
                        }
                    }
                    // console.log(request_data)
                    downloadingService.getDownloadUrl(request_data, function (jsonData) {
                        // console.log(JSON.stringify(jsonData))
                        let error_code = jsonData.error_code;
                        if (error_code === 22000) {
                            me.$store.dispatch('addDownloadingItem', {
                                'dt': dt,
                                'song_info': jsonData.songinfo
                            })
                            me.commonFuns.createTips('已添加到下载队列', 'success');
                        } else {
                            // console.log('song.download failed: ' + JSON.stringify(jsonData.result))
                            if (error_code == 22469) {
                                //单点售卖歌曲、专辑
                                if (jsonData.hasOwnProperty('result')) {
                                    me.$store.dispatch('showSaleSongMessageBox', jsonData.result);
                                }
                            } else if (error_code == 22467) {
                                //全球付费
                                me.$store.dispatch('showOpenVipMessageBox')
                            } else {
                                console.log('song.download return failed, code is: ' + error_code);
                            }
                        }
                    }, function () {

                    });
                } else {
                    if (this.commonFuns.isSongCanDownload(songInfo)) {
                        this.$store.dispatch('addDownloadingItem', {
                            'dt': dt,
                            'song_info': songInfo
                        });
                    }
                }

                if (document.querySelector('.v-modal')) {
                    document.body.removeChild(document.querySelector('.v-modal'))
                }
            }

            if (this.songArray.length > 1) {
                this.commonFuns.createTips('已添加到下载队列', 'success');
            }
        },

        isHaveDonglownloadType(download_type) {
            if (this.songArray.length != 1) {
                if (download_type == 0) {
                    if (this.commonFuns.isSongArrayHasLossless(this.songArray)) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }

            let param = {
                'sq': [],
                'hq': [],
                'normal': []
            };
            this.commonFuns.getSongBitrates(this.songArray[0], param);

            if (download_type === 0) {
                return param.sq.length > 0;
            } else if (download_type === 1) {
                return param.hq.length > 0;
            } else {
                return param.normal.length > 0;
            }
        }
    }
}
</script>
<style scoped>
.rateSelectContext {
    display: block;
    width: auto;
    height: auto;
    position: absolute;
    z-index: 300000;
    top: 0;
    left: 0;
    background: #fff;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
}

.rateSelectContext ul {
    display: flex;
    flex-flow: column wrap;
}

.v-modal {
    background: transparent;
}

.rateSelectContext li {
    height: 40px;
    line-height: 40px;
    padding: 0 13px 0 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-bottom: solid 1px #f2f2f2;
    cursor: pointer;
    position: relative;
}

.rateSelectContext li:hover {
    background-color: #f2f2f2;
}

.download-vip-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url('~static/images/icon_vip2.svg') no-repeat;
    vertical-align: -5px;
    margin-left: 5px;
}

.opacity {
    opacity: 0;
}
</style>