<template>
  <div class="dy-music-type" v-if="musicdata.msgtype == 1">        
    <img class="dy-music-type-pic" v-bind:src="musicdata.content.pic" alt="">
      <!-- 单曲类型start -->
    <div class="dy-music-type-txt" v-if="musicdata.content.content_type == 0">
     <p><a class="song-name" v-html="musicdata.content.title" @click="addToPlayList(musicdata.content)"></a></p> 
     <p><a class="artist-name" v-html="musicdata.content.artist_name"></a></p>
    </div>
    <!--  单曲类型end -->
    <!-- 歌单类型start -->
    <div class="dy-music-type-txt" v-if="musicdata.content.content_type == 1">
     <p class="dy-normal-type">歌单-<a class="source-title" v-html="musicdata.content.title"></a></p>          
    </div>
    <!-- 歌单类型end -->
    <!-- 专辑类型start -->
    <div class="dy-music-type-txt" v-if="musicdata.content.content_type == 2">
     <p class="dy-normal-type">专辑-<a class="source-title" v-html="musicdata.content.title"></a></p>          
    </div>
    <!-- 专辑类型end -->
    <!-- 歌手类型start -->
    <div class="dy-music-type-txt" v-if="musicdata.content.content_type == 3">
     <p class="dy-normal-type">歌手-<a class="source-title" v-html="musicdata.content.title"></a></p>          
    </div>
    <!-- 歌手类型end -->

    <div class="trangle-box">
      <div class="trangle-bottomleft"></div>
      <div class="trangle-topright"></div>
    </div>
  </div>   
</template>
<style>
  .dy-music-type{
	display: flex;
	background: #f2f2f2;
	padding:5px;
	position: relative;	
}
.dy-music-type-pic{	
	width:50px;
	height:50px;
}
.dy-music-type-txt{
	flex:9 9 450px;
}

.dy-music-type-txt p{
	margin-top:7px;
	margin-left:13px;
}
.dy-music-type-txt p.dy-normal-type{
  margin-top:14px;
}
.dy-normal-type a{

}
.trangle-box .trangle-bottomleft{	
	width:0;
	height:0;
	border-bottom: 12px solid #e5e5e5;
	border-right: 12px solid transparent;
	position: absolute;
	right:0;
	top:0;
}
.trangle-box .trangle-topright{	
	width:0;
	height:0;
	border-top: 12px solid #ffffff;
	border-left: 12px solid transparent;
	position: absolute;
	right:0;
	top:0;
}
</style>
<script>
// import playDirective from '../../directives/playSong.js'
import constant from "../../constant.js"
export default {
    name:"dynamic-share-music" ,
    props:{
        musicdata:Object
    },
    // directives:{
    //   play:playDirective
    // }
    methods:{
      addToPlayList( song ){
        let song_json = {"song_id":song.content_id,"title":song.title,"author":song.artist_name}
        let songArray = [];
        songArray.push(song_json);
        let playIndex = 0;
        let isPlay = true;
        let isReset = false;
        this.$store.dispatch('addSongsToCurrentPlayinglist', {songArray, playIndex, isPlay, isReset});    
      }
    }
}
</script>