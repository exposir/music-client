<template>
<div class="dy-base-box">
 <!-- 用户信息start -->
  	<div class="dy-user">
      <div class="avatar-box"><a href=""><img class="avatar" v-bind:src="basedata.author.userpic_small"></a></div>
      <div class="dy-user-info">
        <p><a href="" class="uname-txt" v-html="basedata.author.username"></a></p>
		<p><span class="dtime-txt" v-html="basedata.ctime"></span></p>	
      </div>       
    </div>
     <!-- 用户信息end -->
    <p class="dy-con" v-html="basedata.msg"></p>
    <!-- 话题start -->
    <a v-if="basedata.topic" href="" class="dy-topic" v-html="basedata.topic.topic_title"></a>
    <!-- 话题end -->
</div>
</template>
<style>
.dy-user{
	display: flex;
	margin-bottom: 10px;
}
.dy-user .avatar{
	flex:1;
	width:43px;
	height:43px;
	border-radius: 50%;
}
.dy-user-info {
	flex:9;
	margin-left: 10px;
	margin-top:5px;
}
.dy-user-info p{
	line-height: 18px;
}
.dy-user-info .uname-txt{
	font-size:14px;
	color:#3f9bd7;

}
.dy-user-info .dtime-txt{
	font-size:10px;
	color:#a3a3a3;
}
.dy-con{
	font-size:12px;
	line-height: 20px;
	color:#515151;
	margin-bottom:7px;
}
.dy-topic{
	display: inline-block;
	height:22px;
	line-height: 22px;
	background-color:#dbedff;
	padding:0 18px;
	border-radius: 10px;
	color:#51a7e0;
	font-size:12px;
	margin-bottom: 10px;
}   
</style>
<script>
export default {
    name:"dynamic-base-info",
    props:{
        basedata:Object
    }
}
</script>