<template>
	<div id="mvwindow">
		<div class="titlebar cf">
			<div class="mv-title fl">
			<div title="最小化" class="basic-btn fr small">-</div>
			<div title="关闭" class="basic-btn fr close">X</div>
		</div>	
			<webview id="mv"></webview>
	</div>
</template>
<script>
	export default {
	  name: 'mvWindow',
	  data () {
	    return {
            isMac:false
	    }
	  },
	  methods:{
	  }, 
	}
</script>
<style>
	.titlebar{
		height: 50px;
		background: #499bd4;
		width: 100%;
		color: #fff;
		z-index: 10;
		-webkit-app-region: drag; 
	}
	#mvwindow .basic-btn{
		width: 25px;
		height: 25px;
		line-height: 25px;
		text-align: center;
		color: #fff;
		background:yellow;
	}
</style>