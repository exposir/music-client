<template> 
<div class="search_list">
    <ul v-if="gedanList && gedanList.length>0">
      <li v-for="(gedan,index) in gedanList" @click="selected(index)" :class="{on:selectedIndex === index}">
          <span class="img_border">
              <router-link :to="'/music/public/gedan/'+gedan.diy_id">
              <img v-if="gedan.diy_pic" v-lazy="gedan.diy_pic">
              <img v-else src="static/images/default_pic.svg">
              </router-link>             
              <a class="play_btn" @click="playWholeGedan(gedan.diy_id)"></a>
          </span>
        <div class="text_border">
          <p class="s_title">  <router-link :to="'/music/public/gedan/'+gedan.diy_id" v-html="highlight(gedan.diy_title,keyword)"></router-link></p>
          <p class="msg_title">播放量：<span class="date" v-cloak>{{gedan.listen_num}}</span></p>
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
    import gedanService from 'service/gedanService'
    export default {
        name: "gedan-list",
        data() {
            return {
                selectedIndex: -1
            }
        },
        props: {
            gedanList: Array,
            keyword: String,
            totalnum: Number,
            loadding: Boolean,
            highlight: Function
        },
        methods: {
            playWholeGedan(list_id) {
                this.$store.dispatch('playWholeGedan', list_id)
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