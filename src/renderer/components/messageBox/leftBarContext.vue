<template>
    <div v-cloak class="leftBar-context-menu-wrap" :style="{'left':positionX+'px','top':positionY+'px'}" :class="{'opacity':!isShowContext}">
        <ul>
            <li @click="deleteSongList()" v-if="type === 'self'">删除歌单</li>
            <li @click="renameSongList()" v-if="type === 'self'">重命名</li>
            <li @click="cancelSongListFavorite()" v-if="type !== 'self'">取消收藏</li>
    
        </ul>
    </div>
</template>

<script>
    import Popup from 'utils/popup'
    import {
        mapGetters,
        mapActions
    } from 'vuex'

    const {
        shell
    } = require('electron');

    export default {
        name: 'songListMenu',
        mixins: [Popup],
        props: {
            modal: {
                default: false
            },
            closeOnClickModal: {
                default: false
            }
        },
        computed: {
            clientY() {
                return this.positionData.clientY
            },
            clientX() {
                return this.positionData.clientX
            },
            boxHeight() {
                let boxDom = document.querySelector('.leftBar-context-menu-wrap')

                let boxHeight = parseFloat(this.domAction.getStyle(boxDom, 'height'))
                if (!boxDom) {
                    let me = this
                    let count = 0
                    let interval = setInterval(function() {
                        count++
                        boxDom = document.querySelector('.leftBar-context-menu-wrap')

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
                let boxDom = document.querySelector('.leftBar-context-menu-wrap')
                let boxWidth = parseFloat(this.domAction.getStyle(boxDom, 'width'))
                if (!boxDom) {
                    let me = this
                    let interval = setInterval(function() {
                        boxDom = document.querySelector('.leftBar-context-menu-wrap')
                        if (boxDom) {
                            me.isShowContext = true
                            boxWidth = parseFloat(me.domAction.getStyle(boxDom, 'width'))
                            me.boxData.width = boxWidth
                            console.log('boxHeight:' + boxWidth)
                            clearInterval(interval)


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
                if (clientY + boxHeight > clientHeight - miniBarHeight) {
                    positionY = clientY - boxHeight
                    console.log('positionY' + positionY)
                    return positionY > 0 ? positionY : '0'
                } else {
                    return clientY
                }


            }
        },
        data() {
            return {
                type: {
                    default: "self"
                },
                list_id: "",
                list_title: '',
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
            if (document.querySelector('.leftBar-context-menu-wrap')) {
                this.isShowContext = true
            }
            document.body.addEventListener('click', this.clickEventListener);
            document.body.addEventListener('contextmenu', this.contextmenuEventListener);
            document.querySelector('.left-scroll-con').addEventListener("scroll", this.scrollEventListener);
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.clickEventListener);
            document.body.removeEventListener('contextmenu', this.contextmenuEventListener);
            document.querySelector('.left-scroll-con').removeEventListener("scroll", this.scrollEventListener);
        },
        methods: {
            clickEventListener(event) {
                if (document.getElementsByClassName('leftBar-context-menu-wrap').length > 0) {
                    document.body.removeChild(document.getElementsByClassName('leftBar-context-menu-wrap')[0])
                }
            },
            contextmenuEventListener(event) {
                let len = document.getElementsByClassName('leftBar-context-menu-wrap').length
                if (len > 0) {
                    for (let i = 0; i < len - 1; i++) {
                        document.body.removeChild(document.getElementsByClassName('leftBar-context-menu-wrap')[i])
                    }
                }
            },
            scrollEventListener(event) {
                if (document.getElementsByClassName('leftBar-context-menu-wrap').length > 0) {
                    document.body.removeChild(document.getElementsByClassName('leftBar-context-menu-wrap')[0])
                }
            },
            deleteSongList() {
                if (this.type !== 'self') {
                    return;
                }
                let me = this;

                this.MessageBox.tips('提示', '确认删除此歌单？', {
                    'cancelButtonText': '取消',
                    'confirmButtonText': '确定',
                    'showCancelButton': true,
                    'confirmButtonClass': 'noraml-btn',
                    'cancelButtonClass': 'cancel-big-btn',
                    'beforeClose': null,
                    'handleAction': () => {
                        let list_id = me.list_id
                        let paramsJson = {
                            'list_id': list_id,
                            'isDone': false
                        }
                        me.$store.dispatch('deleteSonglist', paramsJson)


                        let messageBoxDom = document.querySelectorAll('.el-message-box__wrapper')
                        messageBoxDom.forEach((itemdom, index) => {
                            document.body.removeChild(itemdom)
                        })

                        document.body.removeChild(document.querySelector('.v-modal'))

                        let count = 0
                        let interval = setInterval(function() {
                            count++
                            if (paramsJson.isDone) {
                                eventBus.$emit('goBack', true)
                                clearInterval(interval)
                            } else {
                                if (count > 10) {
                                    clearInterval(interval)
                                }
                            }
                        }, 500)

                    }
                })
            },
            renameSongList() {
                if (this.type !== 'self') {
                    return;
                }
                console.log(this.list_title)
                let me = this;

                this.MessageBox.tips('重命名', this.list_title, {
                    'cancelButtonText': '取消',
                    'confirmButtonText': '确定',
                    'showCancelButton': true,
                    'showInput': true,
                    'confirmButtonClass': 'noraml-btn',
                    'cancelButtonClass': 'cancel-big-btn',
                    'beforeClose': null,
                    'handleAction': () => {
                        let new_title = document.getElementById('modifyGedanNameInput').value;
                        let paramsJson = {
                            'list_id': this.list_id,
                            'title': new_title,
                            'isDone': false,
                            'ret_code': 0
                        };
                        me.$store.dispatch('modifyListBaseInfo', paramsJson);

                        let count = 0;
                        let interval = setInterval(() => {
                            count++;
                            if (paramsJson.isDone) {
                                if (paramsJson.ret_code === 22000) {
                                    me.$store.dispatch('getGedanInfo', {
                                        "list_id": this.list_id,
                                        "withcount": "1"
                                    })
                                    document.body.removeChild(document.querySelector('.el-message-box__wrapper'))
                                    document.body.removeChild(document.querySelector('.v-modal'))
                                } else if (paramsJson.ret_code === 22231) {
                                    me.commonFuns.createTips('名称中含有黄反词', 'error');
                                } else {
                                    me.commonFuns.createTips('修改名称失败', 'error')
                                }
                                clearInterval(interval)
                            } else {
                                if (count >= 10) {
                                    console.log('wait create new song list timeout!');
                                    clearInterval(interval);
                                }
                            }
                        }, 500)
                    }
                })
            },
            cancelSongListFavorite() {
                let source = 0;
                if (this.type === 'album') {
                    source = 1;
                }

                console.log('cancel favorte list, type is: ' + source)
                let param = {
                    'list_id': this.list_id,
                    'source': source
                };

                // console.log(param)
                this.$store.dispatch('deleteFavorite', {'paramsJson':param});
            }
        }
    }
</script>
<style scoped>
    .leftBar-context-menu-wrap {
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
    
    .leftBar-context-menu-wrap ul {
        display: flex;
        flex-flow: column wrap;
    }
    
    .v-modal {
        background: transparent;
    }
    
    .leftBar-context-menu-wrap li {
        height: 40px;
        line-height: 40px;
        padding: 0 13px 0 13px;
        white-space: nowrap;
        text-overflow: ellipsis;
        border-bottom: solid 1px #f2f2f2;
        cursor: pointer;
        position: relative;
    }
    
    .leftBar-context-menu-wrap li:hover {
        background-color: #f2f2f2;
    }
    
    .opacity {
        opacity: 0;
    }
</style>