<template>  
    <div id="app" class="app" ondragstart="return false">
        <div v-show="isMiniMode">
            <miniWindow></miniWindow>
        </div>
        <div v-show="!isMiniMode">
            <Basicset></Basicset>
            <Functionlist></Functionlist>   
            <miniBar></miniBar>      
            <share-mask></share-mask>   
        </div>
    </div>
</template>
<style>
    @import url(./common/css/reset.css);
    @import url(./common/css/common.css);
    #app {
        width: 100%;
        height: 100%;
        min-width: 970px;
        position: relative;
        background: transparent;
        user-select: none;
        
    }
</style>

<script>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    export default {
        data() {
            return {
                isMiniMode: false
            }
        },
        components: {
            Basicset: () =>
                import ('./components/musicwindow/Basicset.vue'),
            miniBar: () =>
                import ('./components/miniBar/miniBar.vue'),
            Functionlist: () =>
                import ('./components/musicwindow/Functionlist.vue'),
            shareMask: () =>
                import ('./components/messageBox/shareContext.vue'),
            miniWindow: () => 
                import ('./components/miniwindow/miniwindow.vue') 
        },
        computed: {
            ...mapGetters({
                // song: 'currentPlayingSong'
            })
        },
        watch: {
            '$route': function(to, from) {
                //排除 本地音乐、播放历史、设置页面
                let isOnline = navigator.onLine
                let path = to.path
                if (!isOnline &&
                    path.indexOf('my/downloaded') < 0 &&
                    path.indexOf('my/history') < 0 &&
                    path.indexOf('my/local') < 0 &&
                    path.indexOf('setup') < 0) {
                    this.$router.push({
                        path: '/offline/'
                    })
                }
            }
        },
        created() {
            //先获取设置的值，然后再取做初始化
            this.$store.dispatch('storFocusimgs')
            if (!navigator.onLine) {
                this.$router.push({
                    path: '/offline/'
                })
            }
            eventBus.$on('isMiniMode', (val) => {
                this.isMiniMode = val
            })
        },
        mounted() {
            require('electron').ipcRenderer.send('component-ready', 'App.vue is ready')
            
            
        },
        beforeDestroy() {
            eventBus.$off('isMiniMode', false);
        },
    }
</script>
<style>
    .el-dialog__headerbtn:focus .el-dialog__close, .el-dialog__headerbtn:hover .el-dialog__close{
        color: #e13228!important;
    } 
</style>
