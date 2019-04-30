<template>
<div class="empty-wraper" v-cloak>
<!--<img src="../../common/images/empty1.png" alt="">-->
<p class="empty-tips">{{content}}</p>
<span v-if="linkUrl && btnText && callbackFun" @click="callbackFun">
    <router-link  :to="linkUrl"  class="empty-btn">{{btnText}}</router-link>
</span>
<span v-else-if="btnText && callbackFun" @click="callbackFun">
    <span class="empty-btn">{{btnText}}</span>
</span>
<router-link  v-else-if="linkUrl && btnText" :to="linkUrl"  class="empty-btn">{{btnText}}</router-link>

</div>
</template>
<style>
    .empty-wraper {
        width: 300px;
        height: 200px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -100px;
        margin-left: -150px;
        text-align: center;
        font-size: 14px;
        font-weight: normal;
        margin-bottom: 20px;
    }
    
    .empty-wraper img {
        width: 88px;
        height: 88px;
    }
    
    .empty-wraper .empty-btn {
        display: inline-block;
        height: 30px;
        padding: 0 30px;
        line-height: 30px;
        text-align: center;
        /* border: solid 1px #cecece; */
        border-radius: 30px;
        color: #ffffff;
        background: #e13228;
        cursor: pointer;
    }
    
    .empty-wraper .empty-tips {
        margin: 25px auto 26px auto;
        color: #868686;
    }
</style>
<script>
    export default {
        name: 'empty',
        props: {
            content: String,
            btnText: String,
            linkUrl: String,
            callbackFun: Function
        },
        methods: {
            clickFun: function() {
                console.log('aaa')
            }
        }
    }
</script>