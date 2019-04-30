<template>
 <div class="container"> 
	<div class="dy-ls"  >
	   <!-- 动态top模块start -->
	  <div class="dy-top-box">
	    <h3 class="dy-top-title">动态</h3>
	  </div>
	  <!-- 动态top模块end -->	    
	  <dynamic-list v-bind:data="mainDynamicList" v-bind:lastData='{"lastMsgId":lastMsgId,"lastMsgTimeStamp":lastMsgTimeStamp}'></dynamic-list>	   
	</div>	  	
	<dynamic-side v-bind:topicdata="hotTopics"></dynamic-side> 	
</div>
</template>
<script>
import './css/index.css';
import dynamicList from './dynamicList.vue'
import dynamicSide from './dynamicSide.vue'
import dynamicService from '../../service/dynamicService.js'
export default {	
    name : "dynamic-main" ,
    data:function(){
    	var me = this; 
    	return {
    		"mainDynamicList":me.mainDynamicList,
			"hotTopics":me.hotTopics,
			"lastMsgId":me.lastMsgId,
			"lastMsgTimeStamp":me.lastMsgTimeStamp
    	}       
    },
	created: function () {  
	   this.getDynamicList();	    
	},
	methods: {
		getDynamicList:function(){
			var me = this; 
			dynamicService.getDynamicMainList({"size":20},function(jsondata){				
				if(jsondata.error_code == 22000){
	        		me.mainDynamicList = jsondata.msg; 
					me.hotTopics = jsondata.topics; 
					var lastMsgData = me.mainDynamicList.pop();
					me.lastMsgId = lastMsgData.msgid;	
					me.lastMsgTimeStamp = lastMsgData.ctime;			
				}			
			},function(){

			})
		}	
	},
    components: {
	   dynamicList,
	   dynamicSide	  
  	}
}
</script>