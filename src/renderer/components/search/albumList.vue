<template> 
<div class="search_list"  v-cloak>
    <ul v-if="albumList && albumList.length>0">
      <li v-for="(album,index) in albumList" @click="selected(index)" :class="{on:selectedIndex === index}">
          <span class="img_border">
              <router-link :to="'/music/public/album/'+album.album_id">
              <img v-if="album.pic_small" v-lazy="album.pic_small">
               <img v-else src="static/images/default_pic.svg">
              </router-link>             
              <a class="play_btn" @click="playWholeAlbum(album.album_id)"></a>
          </span>
        <div class="text_border">
          <p class="s_title"><router-link :to="'/music/public/album/'+album.album_id" class="album" v-html="highlight(album.title,keyword)"></router-link> 
          - <router-link class="artist" v-for="(author,i) in album.authorLinksArr" v-if="i<album.authorLinksArr.length-1" :to="'/music/public/singer/'+author.artist_id+'/0'" v-html="highlight(author.artist_name,keyword)+','"></router-link> 
          <router-link class="artist" v-for="(author,i) in album.authorLinksArr" v-if="i==album.authorLinksArr.length-1"  :to="'/music/public/singer/'+author.artist_id+'/0'" v-html="highlight(author.artist_name,keyword)"></router-link>                   
          </p>
          <p class="msg_title">发行时间：<span class="date">{{album.publishtime}}</span></p>
        </div>
      </li>
      </ul>
      <div class="no-content-tips-box" v-else>
      没有找到相关内容，试试别的关键词吧
      </div> 
      <div class="pagination-box" v-if="totalnum > 20">
        <el-pagination small layout="prev, pager, next" :total="totalnum" :page-size="20" @current-change="onChangePage"></el-pagination>
      </div>
  </div>
</template>
<style scoped>
    .s_title {
        width: auto;
    }
</style>
<script>
    import albumService from 'service/albumService'
    export default {
        name: "album-list",
        data() {
            return {
                selectedIndex: -1
            }
        },
        props: {
            albumList: Array,
            keyword: String,
            totalnum: Number,
            loadding: Boolean,
            highlight: Function
        },
        methods: {
            playWholeAlbum(album_id) {
                this.$store.dispatch('playWholeAlbum', album_id)
            },
            onChangePage(page) {
                this.$nextTick(function() {
                    this.$store.dispatch('getSearchResult', {
                        "query": this.keyword,
                        "page_no": page,
                        "page_size": 20
                    })
                    document.querySelector('.show').scrollTop = 0
                })
            },
            selected(index) {
                this.selectedIndex = index
            }
        }
    }
</script>