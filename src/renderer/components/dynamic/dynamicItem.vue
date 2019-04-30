<template>
 <div class="dy-item"  v-if="item.msgtype == 1 || item.msgtype == 4">         
    <dynamic-base-info v-bind:basedata="item"></dynamic-base-info>  
    <!-- 分享的音乐类型start -->        
    <dynamic-share-music v-bind:musicdata="item"></dynamic-share-music>        
    <!-- 分享的音乐类型end-->
    <!-- 动态图片列表start -->
    <dynamic-piclist v-if="item.msgtype == 1 && item.piclist" v-bind:picdata="item.piclist"></dynamic-piclist>
    <!-- 动态图片列表end -->
    <!-- 转发的动态start -->        
    <dynamic-relay v-if="item.msgtype == 4" v-bind:parentdata="item.msg_parent"></dynamic-relay>        
    <!-- 转发的动态end -->
    <!-- 分享的图片列表end -->
    <!-- 点赞 评论 start -->
    <div class="dy-handle-box">
        <i class="dy-icon icon-thumbs-up" v-html="item.zan_num"></i>
        <i class="dy-icon icon-comment">评论</i>
        <i class="dy-icon icon-external-link">转发</i>
    </div>
    <!-- 点赞 评论 end -->
</div>
</template>
<script>
import dynamicBaseInfo from './dynamicBaseInfo.vue'
import dynamicPiclist from './dynamicPicList.vue'
import dynamicShareMusic from './dynamicShareMusic.vue'
import dynamicRelay from './dynamicRelay.vue'

export default{
    name:"dynamic-item",
    props:{
        item:Object
    },
    components: {
        dynamicBaseInfo,   
        dynamicPiclist,
        dynamicShareMusic,  
        dynamicRelay
   }
}
</script>