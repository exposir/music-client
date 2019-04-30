<template>
    <div class="fav-singer-box my-wrapper">
        <!-- <section-title :data="{ 'title': '收藏的歌手','nums':userFavoriteSingerListNum}" style="margin: 16px 0"></section-title> -->
        <empty v-if="!loginStatus" :content="'登录查看收藏的歌手，享受多端同步'" :btnText="'登录'" :callbackFun="login"></empty>
        <div v-else-if="userFavoriteSingerList.listnum > 0" class="singerlist" id="favour-singer-list">
              <singer-list :data="userFavoriteSingerList.listinfo" :from="favourSinger" :fields="{'pic':true,'title':true}"></singer-list>
        </div>
        <div v-else class="is-empty">
            <img src="static/images/user/favour_blank.png" alt="">
            <div>暂无收藏的歌手</div>
        </div>
    </div>
</template>
<script scoped>
    import sectionTitle from 'components/public/section-title.vue'
    import singerList from 'components/public/singer-list.vue'
    import empty from 'components/empty/empty'
    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'favour-singer',
        data() {
            return {
                favourSinger: 'favourSinger'
            }
        },
        computed: {
            ...mapGetters({
                userFavoriteSingerList: 'userFavoriteSingerList',
                loginStatus: 'loginStatus'
            }),
            userFavoriteSingerListNum() {
                if (this.userFavoriteSingerList.listinfo && Array.isArray(this.userFavoriteSingerList.listinfo)) {
                    return this.userFavoriteSingerList.listinfo.length
                } else {
                    return '0'
                }
            }
        },
        created: function() {
            let me = this
            this.$store.dispatch('getUserDiyList', {
                "source": 2,
                "type": 0,
                "offset": 0
            })
            window.onresize = function () {
                me.changeScroll();
            }
        },
        mounted: function() {   
            this.changeScroll()
        },
        components: {
            singerList,
            sectionTitle,
            empty
        },
        methods: {
            login() {
                if (window.navigator.onLine == true) {　
                    this.$store.dispatch('TpassLogin')
                } else {　
                    this.commonFuns.createTips("网络似乎没连好，请检查连接", 'warning');
                }
            },
            changeScroll() {
                let myWrapperDom = document.querySelector('.favour-con')
                let _mainHeight = parseFloat(this.domAction.getStyle(myWrapperDom, 'height'))
                let sectionTitleDom = document.querySelector('.my-wrapper')
                let _marginTop = parseFloat(this.domAction.getStyle(sectionTitleDom, 'margin-top'))
                let singerlistDom = document.querySelector('.my-wrapper')
                let _height = parseFloat(_mainHeight - _marginTop)

                this.domAction.setStyle(singerlistDom, 'height', _height + 'px')
            }
        }
    }
</script>
<style scoped>
    .fav-singer-box {
        margin-top: 30px;
    }
    .my-wrapper {
        overflow-x: hidden;
        overflow-y: auto;
    }
    
    .section-title-box {
        padding: 0 17px;
    }
    
    .singerlist {
        overflow-y: auto;
        overflow-x:hidden;
    }
    
    .singerlist .img-list {
        width: auto;
        padding: 0 17px;
        margin-top: 0;
        justify-content: flex-start;
    }
    #favour-singer-list.singerlist .img-list{
        margin-right: -28px;
        overflow-x:hidden;
    }
    .is-empty {
        width: 100%;
        height: 100%;
    }
    .is-empty img {
        position: absolute;
        top: 40%;
        left: 50%;
        margin-top: -70px;
        margin-left: -80px;
    }
    .is-empty div {
        position: absolute;
        top: 60%;
        left: 50%;
        margin-left: -42px;
        font-size: 14px;
        color: #333333;
    }
</style>