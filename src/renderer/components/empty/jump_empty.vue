<template>
<div class="empty-wraper">
<!--<img src="../../common/images/empty1.png" alt="">-->
<p class="empty-tips">暂时没获取到资源</p>
<!--<a class="refresh-btn">刷新</a>-->
</div>
</template>
<style scoped>
    .empty-wraper {
        width: 460px;
        margin: 0 auto;
        margin-top: 150px;
        text-align: center;
        font-size: 15px;
        position: static;
    }
    
    .empty-wraper img {
        width: 88px;
        height: 88px;
    }
    
    .refresh-btn {
        display: inline-block;
        width: 86px;
        height: 25px;
        line-height: 25px;
        text-align: center;
        border: solid 1px #cecece;
        border-radius: 5px;
        color: #868686;
    }
    
    .empty-tips {
        margin: 25px auto 15px auto;
        color: #868686;
    }
</style>
<script>
    export default {
        name: 'empty',
        watch: {
            '$route': function() {

            }
        }

    }
</script>