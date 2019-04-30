<template>
  <div class="search_list search_singer_list">
    <ul v-if="singerList && singerList.length > 0">
      <li v-for="(singer,index) in singerList" @click="selected(index)" :class="{on:selectedIndex === index}">
        <span class="img_border">
              <router-link :to="'/music/public/singer/'+singer.artist_id+'/0'">
              <img v-if="singer.avatar_middle" v-lazy="singer.avatar_middle">
              <img v-else src="static/images/default_pic.svg">
              </router-link>
          </span>
        <div class="text_border">
          <p class="s_title">
            <router-link :to="'/music/public/singer/'+singer.artist_id+'/0'" class="album" v-html="highlight(singer.author,keyword)"></router-link>
          </p>
          <p class="msg_title">单曲：{{singer.song_num}} &nbsp;&nbsp; 专辑：{{singer.album_num}}&nbsp;&nbsp; 地区：{{singer.country}}</p>
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
<script>
    import albumService from 'service/albumService'
    export default {
        name: "singer-list",
        data() {
            return {
                selectedIndex: -1
            }
        },
        props: {
            singerList: Array,
            keyword: String,
            totalnum: Number,
            loadding: Boolean,
            highlight: Function
        },
        methods: {
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