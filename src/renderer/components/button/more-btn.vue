<template>
    <div class="more-btn-wrap">
        <span @click="isShowMenu=!isShowMenu">
            <button-item :btnTxt="'更多'" :icon="'more-icon'"></button-item>
        </span>
        <ul class="menu-list" v-show="isShowMenu">
            <li @click="editGedan" v-if="data.gedanType=='self'">编辑</li>
            <!-- <li @click="reName" v-if="data.gedanType=='self'">重命名</li> -->
            <li @click="shareGd">分享</li>
            <li @click="deleteGedan" v-if="data.gedanType=='self'">删除</li>
        </ul>
    </div>
</template>
<script>
    const {
        clipboard
    } = require('electron')
    import buttonItem from './button-item.vue'

    export default {
        name: 'more-btn',
        data() {
            return {
                isShowMenu: false
            }
        },
        props: {
            data: Object
        },
        components: {
            buttonItem
        },
        created() {
            document.body.addEventListener('click', this.clickEventListener);
        },
        beforeDestroy() {
            eventBus.$off('modifyDiyTitle')
            document.body.removeEventListener('click', this.clickEventListener);
        },
        methods: {
            clickEventListener(event) {
                if (!event.target.classList.contains('more-icon')) {
                    this.isShowMenu = false
                }
            },
            editGedan() {
                this.$router.push('/editGedan')
            },
            deleteGedan() {
                let me = this;
                this.MessageBox.tips('提示', '确认删除此歌单？', {
                    'cancelButtonText': '取消',
                    'confirmButtonText': '确定',
                    'showCancelButton': true,
                    'confirmButtonClass': 'noraml-btn',
                    'cancelButtonClass': 'cancel-big-btn',
                    'beforeClose': null,
                    'handleAction': () => {

                        let paramsJson = {
                            'list_id': me.data.gedanInfo.list_id,
                            'isDone': false
                        }
                        me.$store.dispatch('deleteSonglist', paramsJson)


                        let messageBoxDom = document.querySelectorAll('.el-message-box__wrapper')
                        messageBoxDom.forEach((itemdom, index) => {
                            document.body.removeChild(itemdom)
                        })
                        if (document.querySelector('.v-modal')) {
                            document.body.removeChild(document.querySelector('.v-modal'))
                        }


                        let count = 0
                        let interval = setInterval(function() {
                            count++

                            console.log(paramsJson)
                            if (paramsJson.isDone) {
                                me.$router.go(-1)
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
            reName() {
                let me = this;

                this.MessageBox.tips('重命名', this.data.gedanInfo.list_title, {
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
                            'list_id': me.data.gedanInfo.list_id,
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
                                    // eventBus.$emit('modifyDiyTitle', new_title)
                                    me.$store.dispatch('getGedanInfo', {
                                        "list_id": me.data.gedanInfo.list_id,
                                        "withcount": "1"
                                    })
                                    let messageBoxDom = document.querySelectorAll('.el-message-box__wrapper')
                                    messageBoxDom.forEach((itemdom, index) => {
                                        document.body.removeChild(itemdom)
                                    })
                                    if (document.querySelector('.v-modal')) {
                                        document.body.removeChild(document.querySelector('.v-modal'))
                                    }
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
            copyLink() {
                let url = 'http://music.taihe.com/songlist/' + this.data.gedanInfo.list_id
                clipboard.writeText(url)
                this.commonFuns.createTips('链接已复制', 'success')
            },
            shareGd() {
                console.log(this.data)
                let self = this 
                let datas = {}              
                if (this.data.albumInfo) {
                    let url = 'http://music.taihe.com/album/' + this.data.albumInfo.albumInfo.album_id
                    datas = {
                        isShow:true,
                        url:url,
                        pic:self.data.albumInfo.albumInfo.pic_big,
                        title:'我正在收听' + self.data.albumInfo.albumInfo.author + '的专辑' + '《' + self.data.albumInfo.albumInfo.title + '》'
                    }
                }else {
                    let url = 'http://music.taihe.com/songlist/' + this.data.gedanInfo.list_id
                    datas = {
                        isShow:true,
                        url:url,
                        pic:self.data.gedanInfo.list_pic,
                        title:'我正在收听' + self.data.gedanInfo.userinfo.username + '的歌单' + '《' + self.data.gedanInfo.list_title + '》'
                    }
                }                                
                eventBus.$emit('shareModal',datas)
            }
        }
    }
</script>
<style>
    .more-btn-wrap {
        position: relative;
    }
    
    .menu-list {
        margin-left: 8px;
        margin-top: 4px;
        position: absolute;
        display: flex;
        flex-flow: column wrap;
        justify-content: flex-start;
        align-items: center;
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, .3);
        z-index: 200;
        background: #fff;
    }
    
    .menu-list li {
        width: 100%;
        height: 38px;
        line-height: 38px;
        padding: 0 13px;
        border-bottom: solid 1px #f2f2f2;
        cursor: pointer;
    }
    
    .menu-list li:hover {
        background-color: #e13228;
        color: #ffffff;
    }
</style>