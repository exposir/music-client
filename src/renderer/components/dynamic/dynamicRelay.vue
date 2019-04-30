<template>
<div class="relay-dynamic-box">
	<dynamic-share-music v-bind:musicdata="parentdata"></dynamic-share-music>
	<dynamic-piclist v-bind:picdata="parentdata.piclist"></dynamic-piclist>
</div>
</template>
<script>
import dynamicPiclist from './dynamicPicList.vue'
import dynamicShareMusic from './dynamicShareMusic.vue'
export default {
    name : "dynamic-relay" ,
    props:{
        parentdata:Object
    },
    components: {
    	dynamicPiclist,
    	dynamicShareMusic
  	}
}
</script>
<style>
.relay-dynamic-box{
	background-color:#f8f8f8;
	padding:15px;
}
.relay-dynamic-box .trangle-box .trangle-topright{
	border-top: 12px solid #f8f8f8;
}
.relay-dynamic-box .dy-small-pics-box .dy-pic img.square{
	width:152px;
	height:152px;
}
.relay-dynamic-box .dy-small-pics-box .dy-pic img..rectangle{
	width:238px;
	height:132px;
}
</style>