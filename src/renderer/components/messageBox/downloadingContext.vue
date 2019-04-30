<template>
    <div v-cloak class="context-menu-wrapper" :style="{'left':positionX+'px','top':positionY+'px'}" :class="{'opacity':!isShowContext}">
        <ul>
            <li @click="startDownload()">开始下载</li>
            <li @click="pauseDownload()">暂停下载</li>
            <li @click="deleteDownload()">删除任务</li>
        </ul>
    </div>
</template>
<script>
    import Popup from 'utils/popup'
    import * as download_status from '../../download/downloadError.js'
    import {
        mapGetters,
        mapActions
    } from 'vuex'

    export default {
        name: "downloadingContextMenu",
        mixins: [Popup],
        computed: {
            ...mapGetters({
                downloading_list: 'downloadingItems',
                selectLines: 'ListSelectedLines'
            }),
            clientY() {
                return this.positionData.clientY
            },
            clientX() {
                return this.positionData.clientX
            },
            boxHeight() {
                let boxDom = document.querySelector('.context-menu-wrapper')
                console.log(boxDom)
                let boxHeight = parseFloat(this.domAction.getStyle(boxDom, 'height'))
                if (!boxDom) {
                    let me = this
                    let count = 0
                    let interval = setInterval(function() {
                        count++
                        boxDom = document.querySelector('.context-menu-wrapper')
                        console.log(boxDom)
                        if (boxDom) {
                            me.isShowContext = true
                            boxHeight = parseFloat(me.domAction.getStyle(boxDom, 'height'))

                            me.boxData.height = boxHeight
                            console.log('boxHeight:' + boxHeight)
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
                let boxDom = document.querySelector('.context-menu-wrapper')
                let boxWidth = parseFloat(this.domAction.getStyle(boxDom, 'width'))
                if (!boxDom) {
                    let me = this
                    let count = 0
                    let interval = setInterval(function() {
                        count++
                        boxDom = document.querySelector('.context-menu-wrapper')
                        if (boxDom) {
                            me.isShowContext = true
                            boxWidth = parseFloat(me.domAction.getStyle(boxDom, 'width'))
                            me.boxData.width = boxWidth
                            console.log('boxWidth:' + boxWidth)
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
                    boxWidth = this.boxWidth ? this.boxWidth : 74,
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
                    boxHeight = this.boxHeight ? this.boxHeight : 120,
                    clientHeight = this.clientHeight,
                    miniBarHeight = this.miniBarHeight

                if (clientY + boxHeight > clientHeight - miniBarHeight) {
                    let positionY = clientY - boxHeight
                    return positionY > 0 ? positionY : '0'
                } else {
                    return clientY
                }
            }
        },
        props: {
            modal: {
                default: false
            },
            closeOnClickModal: {
                default: false
            }
        },
        data() {
            return {
                positionData: {
                    'clientX': 0,
                    'clientY': 0
                },
                isShowContext: false,
                isComputedLeftStyle: false,
                boxData: {
                    width: 0,
                    height: 0
                }
            }
        },
        mounted() {
            if (document.querySelector('.context-menu-wrapper')) {
                this.isShowContext = true
            }
            document.body.addEventListener('click', this.clickEventListener);
            document.body.addEventListener('contextmenu', this.contextmenuEventListener);
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.clickEventListener);
            document.body.removeEventListener('contextmenu', this.contextmenuEventListener);
        },
        methods: {
            clickEventListener(event) {
                if (document.getElementsByClassName('context-menu-wrapper').length > 0) {
                    document.body.removeChild(document.getElementsByClassName('context-menu-wrapper')[0])
                }
            },
            contextmenuEventListener(event) {
                let len = document.getElementsByClassName('context-menu-wrapper').length
                if (len > 0) {
                    for (let i = 0; i < len - 1; i++) {
                        document.body.removeChild(document.getElementsByClassName('context-menu-wrapper')[i])
                    }
                }
            },
            startDownload() {
                for (let i = 0; i < this.selectLines.length; i++) {
                    let index = this.selectLines[i];
                    let downloading_item = this.downloading_list[index];

                    if (downloading_item.status === download_status.DOWNLOAD_RESULT_DOWNLOADING) {
                        continue;
                    }

                    this.$store.dispatch('startDownloadById', downloading_item.identifier);
                }
            },
            pauseDownload() {
                for (let i = 0; i < this.selectLines.length; i++) {
                    let index = this.selectLines[i];
                    let downloading_item = this.downloading_list[index];

                    if (downloading_item.status != download_status.DOWNLOAD_RESULT_DOWNLOADING &&
                        downloading_item.status != download_status.DOWNLOAD_RESULT_WAITING) {
                        continue;
                    }

                    this.$store.dispatch('stopDownloadById', downloading_item.identifier);
                }
            },
            deleteDownload() {
                this.$store.dispatch('deleteDownloadingItems', this.selectLines);
                this.$store.dispatch('emptyLinesSelected');
            }
        }

    }
</script>

<style scoped>
    .context-menu-wrapper {
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
    
    .context-menu-wrapper ul {
        display: flex;
        flex-flow: column wrap;
    }
    
    .v-modal {
        background: transparent;
    }
    
    .context-menu-wrapper li {
        height: 40px;
        line-height: 40px;
        padding: 0 13px 0 13px;
        white-space: nowrap;
        text-overflow: ellipsis;
        border-bottom: solid 1px #f2f2f2;
        cursor: pointer;
        position: relative;
    }
    
    .context-menu-wrapper li:hover {
        background-color: #f2f2f2;
    }
    
    .opacity {
        opacity: 0;
    }
</style>