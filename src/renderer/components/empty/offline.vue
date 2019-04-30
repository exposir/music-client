<template>
<div class="empty-wraper">
<!--<img src="../../common/images/offline.png" alt="">-->
<p class="empty-tips">网络似乎没连好，请检查连接</p>
<a class="empty-btn" @click="refresh()">刷新</a>
</div>
</template>
<style scoped>
    .empty-wraper {
        width: 300px;
        height: 300px;
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
    .show > div.empty-wraper {
        margin-top: -150px;
        margin-left: -150px;
    }
    
    .empty-wraper img {
        width: 88px;
        height: 88px;
    }
    
    .empty-wraper .empty-btn {
        display: inline-block;
        height: 25px;
        padding: 0 8px;
        line-height: 25px;
        text-align: center;
        border: solid 1px #cecece;
        border-radius: 5px;
        color: #868686;
    }
    
    .empty-wraper .empty-tips {
        margin: 25px auto 15px auto;
        color: #868686;
    }
</style>
<script>
    export default {
        name: 'offline',
        methods: {
            refresh() {
                this.$router.go(-1)
                    //若不能后退一步 那么回到推荐页面 是为了兼容 无网络的情况下启动客户端 开启网络（有个bug就是点击刷新没有反应）
                this.$router.push('/recommend');
            }
        }

    }
</script>