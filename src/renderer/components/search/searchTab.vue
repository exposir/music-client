<template>
    <div class="search_tab info_tab">
      <ul>
        <li class="visited"><a href="javascript:void(0);">歌曲（10）</b></a></li>
        <!--<li><a data-searchpos="singer" href="">歌手（2）</a></li>    -->
        <li><router-link to="">专辑（20）</router-link></li>    
        <!--<li><a data-searchpos="gd" href="">歌单（31）</a></li>-->
        </ul>
    </div>  
</template>
<script>
export default {
    name : "search-tab" 
    // props:{
    //     songListlen:Number           
    // }
    //,
    // created(){
    //     console.log(searchdata)
    // }
}
</script>