<template>
    <div class="mv-window mainMvWrapper">
        <div class="main-menu-box">
            <ul class="cf mv-tab fixedTab">
                <li><router-link to="/mvRecommend">推荐<span></span></router-link></li>
                <li><router-link to="/mvBigman">音乐大人物<span></span></router-link></li>
                <li><router-link to="/mvReplay">直播回放<span></span></router-link></li>
                <li><router-link to="/mvList">MV<span></span></router-link></li>
            </ul>
        </div>
        <div class="main-wrapper scrollBarBody">
            <div class="mv-con">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        mounted() {
            let mainMvWrapperDom = document.querySelector('.mainMvWrapper')
            if (mainMvWrapperDom) {
                let mainMvWrapperHeight = this.domAction.getStyle(mainMvWrapperDom, 'height')
    
                let mainHeaderDom = mainMvWrapperDom.querySelector('.main-menu-box')
                let mainHeaderDomTotalHeight = this.domAction.getStyle(mainHeaderDom, 'height')
    
                let mainWrapperHeight = parseFloat(mainMvWrapperHeight) - parseFloat(mainHeaderDomTotalHeight) 
    
                let scrollBarBodyDom = document.querySelector('.scrollBarBody')
                this.domAction.setStyle(scrollBarBodyDom, 'height', mainWrapperHeight + 'px')
            }
        },
    }
</script>
<style scoped>
    .mv-window {
        height: 100%;
        position: relative;
    }
        
    .main-menu-box {
        display: flex;
        width: 100%;
        height: 35px;
        justify-content: center;
        align-items: center;
    }
        
    .mv-tab {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
    }
        
    .mv-tab li {
        font-size: 14px;
        height: 34px;
        line-height: 36px;
        color: #515151;
        background: #fff;
        text-align: center;
        margin-left: 34px;
        margin-right: 34px;
        position: relative;
    }
        
    .main-wrapper {
        box-sizing: border-box;
        overflow-y: scroll;
        overflow-x: hidden;
    }
        
    .mv-tab li a {
        display: inline-block;
    }
        
    .mv-tab li:hover a,
    .mv-tab li a.isShow {
        color: #e13228;
        height: 33px;
    }
        
    .mv-tab li a.router-link-active {
        color: #e13228;
        height: 33px;
    }

    .mv-tab li:hover span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        border-radius: 4px;
        background: #e13228;
    }

    .mv-tab li a.router-link-active span {
        width: 110%;
        height: 2px;
        position: absolute;
        left: -5%;
        bottom: 0;
        background: #e13228;
        border-radius: 4px;
    }
</style>