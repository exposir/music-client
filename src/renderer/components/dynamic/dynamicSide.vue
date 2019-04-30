<template>
<div class="dy-main-side-box">   
	<!-- 登录人信息start -->
	<div class="dy-side-section dy-login-user-box" v-if="loginUserInfo">
		<div class="avater-box"><img v-lazy="loginUserInfo.userpic_small"></div>
		<p class="dy-login-uname"><a href="" v-html="loginUserInfo.username"></a></p>
		<div class="dy-module-link-box">
			<span><a href="">动态</a><a href="" v-html="loginUserInfo.count_info.dynamic_num"></a></span>
			<span><a href="">关注</a><a href="" v-html="loginUserInfo.count_info.follow_num"></a></span>
			<span><a href="">粉丝</a><a href="" v-html="loginUserInfo.count_info.friend_num"></a></span>				
		</div>
	</div>	

	<!-- 登录人信息end -->
	<!-- 推荐关注start -->
	<div class="dy-side-section">
		<div class="dy-side-head">推荐关注<a href="" class="more-link">换一批</a></div>
		<ul class="dy-side-list dy-side-recd-user-list">
			<li v-for="(val,index) in recUserList">
				<div class="avater-box">
					<a href=""><img v-lazy="val.userpic_small"></a>
				</div>
				<div class="dy-side-user-info">
					<p><a href="" v-html="val.username"></a></p>
					<p><span v-html="val.renzheng_info"></span></p>
				</div>
				<div class="attention-btn-box"><a href="" class="attention-btn">+关注</a></div>
			</li>		
		</ul>
	</div>
	<!-- 推荐关注end -->
	<!-- 热门话题start -->
	<div class='dy-side-section'>
		<div class="dy-side-head">热门话题 <a href="" class="more-link">更多</a></div>		
		<dynamic-topic v-bind:topicdata="topicdata"></dynamic-topic>	
	</div>
	<!-- 热门话题end -->
</div>
</template>
<script>
import dynamicTopic from './dynamicTopic.vue'
export default {
    name : "dynamic-side" ,
	props:{
		'topicdata':Array
	},
    data:function(){
		var me = this;		
    	return {
    		"loginUserInfo":me.loginUserInfo,
    		"recUserList":me.recUserList
    		
    	}
    },
    created : function(){
	//	console.log(this);
    	this.getLoginUserInfo();
		this.getRecUserList();
		
    },    
   	methods:{
   		getLoginUserInfo: function(){
   			var me = this;  
   			this.$http.jsonp('http://musicapi.taihe.com/v1/restserver/ting?method=baidu.ting.ugccenter.getUserBaseInfo&withcount=1&qa=1')
			.then((response) => {
			
				if(response.data.error_code == 22000){	
					
					me.loginUserInfo = response.data.result; 
				
				}			
			}).catch(function(response) {
				
			})
   		},
   		getRecUserList:function(){
			var me = this;
			this.$http.jsonp('http://musicapi.taihe.com//v1/restserver/ting?method=ting.baidu.recommend.getRecAttenteList&size=4&qa=1').then((response) => {
				if(response.data.error_code == 22000){
					me.recUserList = response.data.result.list;
				}
			})
   		}
   	},
	components:{
		dynamicTopic
	}
}
</script>