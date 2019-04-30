<template>
    <div class="favour-gedan scrollBarBody">
        <empty v-if="!loginStatus" :content="'登录查看收藏的歌单，享受多端同步'" :btnText="'登录'" :callbackFun="login"></empty>
        <gedan-list v-else-if="userFavoriteDiyList.listnum > 0" :data="userFavoriteDiyList.listinfo" :fields="{'pic':true,'title':true,'listen_num':true, 'suffix':'/online/favour'}"></gedan-list>
        <div v-else class="is-empty">
            <img src="static/images/user/favour_blank.png" alt="">
            <div>暂无收藏的歌单</div>
        </div>
    </div>
</template>
<script scoped>
    import gedanList from 'components/public/gedan-list.vue'
    import empty from 'components/empty/empty'

    import {
        mapGetters,
        mapActions
    } from 'vuex'   

    export default {
        name: 'favour-gedan',
        components: {
            gedanList,
            empty
        },
        computed: {
            ...mapGetters({
                userFavoriteDiyList: 'userFavoriteDiyList',
                loginStatus: 'loginStatus'
            })
        },
        created() {
            let me = this
            window.onresize = function () {
                me.changeScroll();
            }
        },
        mounted() {
            this.changeScroll()
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
                let mainMusicWrapperDom = document.querySelector('.mainMusicWrapper')
                if (mainMusicWrapperDom) {
                    let mainMusicWrapperHeight = this.domAction.getStyle(mainMusicWrapperDom, 'height')

                    let mainHeaderDom = mainMusicWrapperDom.querySelector('.main-menu-box')
                    let mainHeaderDomTotalHeight = this.domAction.getStyle(mainHeaderDom, 'height')


                    let mainWrapperHeight = parseFloat(mainMusicWrapperHeight) - parseFloat(mainHeaderDomTotalHeight)

                    let scrollBarBodyDom = document.querySelector('.scrollBarBody')
                    this.domAction.setStyle(scrollBarBodyDom, 'height', mainWrapperHeight + 'px')
                }
            }
        }
    }
</script>
<style scoped>
    .favour-gedan {
        padding: 0 17px;
        overflow-y: scroll;
    }
    .favour-gedan ul {
        margin-top: 30px;
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