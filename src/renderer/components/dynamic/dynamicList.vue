<template>
<div class="dy-list" v-scroll="onScroll">
<!-- 普通动态列表详情start -->  
    <div class="dy-section"  v-for="item in data" v-bind:lastData="lastData | toString"> 
     <dynamic-item v-bind:item="item"></dynamic-item>
      <!-- 推荐话题模板start -->
      <div class="dy-topic-theme-box"  v-if="item.msgtype == 2">
        <img class="dy-topic-pic"  v-bind:src="item.topic.pic_750x215">
        <div class="mask"></div>
        <p class="dy-topic-title" v-html="item.topic.topic_title"></p>
        <p class="dy-topic-num" v-html="item.topic.nums">人参加</p>      
      </div> 
      <!-- 推荐话题模板end    -->       
    </div>
<!-- 普通动态列表详情start -->
</div>
</template>
<script>
import dynamicItem from './dynamicItem.vue'
import scrollDirective from '../../directives/scroll.js'
import dynamicService from '../../service/dynamicService.js'
export default {
  name : "dynamic-list" ,
  props:{
      data:Array,
      lastData:Object
  },
  data() {
    return {
      isScroll:false     
    }
  },
  components: {
    dynamicItem   
  },
  directives:{
    scroll:scrollDirective
  },
  methods:{    
    	loadMoreData:function(){
        var me = this; 
        var lastMsgId = me.lastData.lastMsgId,
            lastMsgTimeStamp = me.lastData.lastMsgTimeStamp;       
        dynamicService.getDynamicMainList({"size":10,"timestamp":lastMsgTimeStamp,"msgid":lastMsgId},function(jsondata){				
          if(jsondata.error_code == 22000){
            me.data = me.data.concat(jsondata.msg);                 
            var lastMsgData = me.data.pop();
            lastMsgId = lastMsgData.msgid;	
            lastMsgTimeStamp = lastMsgData.ctime;	
            me.lastData = {"lastMsgId":lastMsgId,"lastMsgTimeStamp":lastMsgTimeStamp};
            me.isScroll = false;	
          }			
        },function(){

        })
		}, 
    onScroll(){   
    
      if(this.isScroll){
        return
      }
      this.isScroll = true
      this.request()      
    },
    request(){
      setTimeout(this.loadMoreData, 500);
    }
  }
}
</script>