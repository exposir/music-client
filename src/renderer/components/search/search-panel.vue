<template>
  <div class="search-wrapper">
    <div class="search-box">
    <i class="search-icon"></i>
      <input class="serch-txt" type="text" id="searchInput" 
      @blur="hideResultBox()" 
      @focus="showSugList($event)" 
      @keyup="showSugList($event)" 
      @keydown.down="selectDown()"
      @keyup.up="selectUp()" 
      @keyup.enter="getSearchList()" 
      placeholder="搜索歌名、歌单、歌手或专辑">
      <a class="clear-btn" v-show="isShowClearBtn" @click="clearInput"></a>
    </div>
    <div class="sug-wrapper" v-show="isShowSug">
      <ul class="sug-list" id="sugList" v-show="keyword">
        <sug-local-list ref="suglocal" v-bind:query="keyword"></sug-local-list>
        <sug-online-list ref="sugonline" v-bind:query="keyword"></sug-online-list>
      </ul>
      <sug-history-list  v-show="!keyword"></sug-history-list>
    </div>
  </div>
</template>
<script>
    import './css/sug.css'
    import sugHistoryList from 'components/search/sugHistoryList'
    import sugLocalList from 'components/search/sugLocalList.vue'
    import sugOnlineList from 'components/search/sugOnlineList.vue'
    import {
        mapGetters
    } from 'vuex'
    const {
        ipcRenderer
    } = require('electron');
    export default {
        name: 'search-panel',
        data() {
            return {
                selectedIndex: -1,
                keyword: "",
                isShowSug: false,
                isShowClearBtn: false,
                isHistorySelect: false
            }
        },
        components: {
            sugHistoryList,
            sugLocalList,
            sugOnlineList
        },
        computed: {
            ...mapGetters({
                sug_online_list: "sug_online_list",
                local_songlist: 'sug_local_list'
            }),
            total() {
                let onLineSongLength = this.sug_online_list.songList ? this.sug_online_list.songList.length : 0
                let onLineArtistLength = this.sug_online_list.artistList ? this.sug_online_list.artistList.length : 0
                let onLineAlbumLength = this.sug_online_list.albumList ? this.sug_online_list.albumList.length : 0
                let localSongListLength = this.local_songlist.length
                let total = onLineSongLength + onLineArtistLength + onLineAlbumLength + localSongListLength
                return total
            }
        },
        watch: {
            total: function(newVal, oldVal) {
                if (newVal < 1) {
                    this.isShowSug = false
                } else {
                    if(!this.isHistorySelect){
                        this.isShowSug = true
                    }
                }
            }
        },
        created() {
            eventBus.$on('isShowSug', (isShowSug) => {
                this.isShowSug = isShowSug
                this.keyword = ""
            })
        },
        methods: {
            showSugList(event) {
                if (event.keyCode == "40" || event.keyCode == "38") { //40 向下 ，38向上
                    return;
                }
                this.keyword = document.getElementById('searchInput').value
                this.selectedIndex = -1
                this.isShowSug = true
                if (this.keyword) {
                    this.isShowClearBtn = true
                    if (this.total < 1) {
                        this.isShowSug = false
                    }
                } else {
                    this.isShowClearBtn = false
                }
            },
            getSearchList() {
                let keyword = document.getElementById('searchInput').value
                if (keyword.trim().length == 0) {
                    return false
                }
                this.keyword = keyword
                this.$nextTick(function() {
                    this.$router.push('/search/song/' + this.keyword + '/1');
                    this.$store.dispatch('setKeyword', this.keyword)
                    this.$store.dispatch('getSearchResult', {
                        "query": this.keyword,
                        "page_no": 1,
                        "page_size": 20
                    })
                    this.$store.dispatch('getSearchNum', {
                            "query": this.keyword,
                            "page_no": 1,
                            "page_size": 20
                        })
                        //加入搜索历史 localstorage  
                    this.$store.dispatch('setSearchHistory', this.keyword)
                        //搜索框失去焦点
                    document.getElementById('searchInput').blur()
                })
                this.isShowSug = false
            },
            selectDown() {
                let elementId = "sugList"
                if (this.keyword.trim().length < 1) {
                    elementId = 'historyList'
                }
                let total_num = this.getSugLiDomRes(elementId, 'num')
                let sug_li_dom_array = this.getSugLiDomRes(elementId)
                this.selectedIndex++
                    if (this.selectedIndex === total_num) {
                        this.selectedIndex = 0
                    }
                let keyword = sug_li_dom_array[this.selectedIndex] ? sug_li_dom_array[this.selectedIndex].innerText : this.keyword
                document.getElementById('searchInput').value = keyword
                sug_li_dom_array.forEach((elem, index) => {
                    elem.classList.remove('selectback')
                })
                sug_li_dom_array[this.selectedIndex].classList.add('selectback')

            },
            selectUp() {
                let elementId = "sugList"
                if (this.keyword.trim().length < 1) {
                    elementId = 'historyList'
                }
                let total_num = this.getSugLiDomRes(elementId, 'num')
                let sug_li_dom_array = this.getSugLiDomRes(elementId)
                this.selectedIndex--
                    if (this.selectedIndex === -1) {
                        this.selectedIndex = total_num - 1
                    }
                let keyword = sug_li_dom_array[this.selectedIndex] ? sug_li_dom_array[this.selectedIndex].innerText : this.keyword
                document.getElementById('searchInput').value = keyword
                sug_li_dom_array.forEach((elem, index) => {
                    elem.classList.remove('selectback')
                })
                sug_li_dom_array[this.selectedIndex].classList.add('selectback')
            },
            getSugLiDomRes(elementId, type = "list") {
                let sugDom = document.getElementById(elementId)
                let sugUlDom = sugDom.getElementsByClassName('sug-res-list')
                let sugUlDomArray = Array.from(sugUlDom)
                let sug_li_array = []
                sugUlDomArray.forEach((elem, index) => {
                    let sugLiDom = elem.getElementsByTagName('li')
                    let sugLiDomArray = Array.from(sugLiDom)
                    sugLiDomArray.forEach((elem, index) => {
                        sug_li_array.push(elem)
                    })
                })
                if (type == 'num') {
                    return sug_li_array.length
                } else {
                    return sug_li_array
                }

            },
            selectClickToSearch(event) {
                let selectedVal = event.target.innerText
                console.log(selectedVal)
                this.keyword = selectedVal
                document.getElementById('searchInput').value = selectedVal
                this.$nextTick(() => {
                        this.$router.push('/search/song/' + encodeURIComponent(this.keyword) + '/1');
                        this.$store.dispatch('setKeyword', selectedVal)
                        this.$store.dispatch('getSearchResult', {
                            "query": selectedVal,
                            "page_no": 1,
                            "page_size": 20
                        })
                        this.$store.dispatch('getSearchNum', {
                            "query": selectedVal,
                            "page_no": 1,
                            "page_size": 20
                        })
                    })
                    //加入搜索历史 localstorage  
                this.$store.dispatch('setSearchHistory', this.keyword)
                let dom = document.querySelector('#searchInput')
                this.domAction.addClass(dom, 'serch-has-txt ')

                this.isHistorySelect = true
                this.isShowSug = false
            },

            hideResultBox() {
                let me = this
                setTimeout(() => {
                    me.isShowSug = false
                }, 300)
                let dom = document.querySelector('#searchInput')

                if (dom.value.length > 0) {
                    this.domAction.addClass(dom, 'serch-has-txt ')
                } else {
                    this.domAction.removeClass(dom, 'serch-has-txt ')
                }

            },
            showResultBox() {
                this.isShowSug = true

            },
            clearInput() {
                document.getElementById('searchInput').value = ""
                this.isShowClearBtn = false

                let dom = document.querySelector('#searchInput')
                this.domAction.removeClass(dom, 'serch-has-txt')
            }
        }

    }
</script>
<style scoped>
    .search-wrapper {
        flex: 0 0 440px;
        position: relative;
        display: flex;
        border: 1px solid rgba(225,50,40,0.05);
        border-radius: 28px;
    }
    
    .search-box {
        display: flex;
        width: 100%;
        position: relative;
    }
    
    .search-box a,
    span {
        display: inline-block;
    }
    
    .search-icon {
        display: inline-block;
        width: 14px;
        height: 14px;
        background: url('~static/images/topBar/search_icon_red.svg') no-repeat;
        position: absolute;
        top: 6px;
        left: 6px;
    }
    
    .serch-txt {
        width: 100%;
        height: 26px;
        line-height: 26px;
        text-align: center;
        border-radius: 13px;
        color: #999999;
        -webkit-app-region: no-drag;
        background: rgba(225,50,40,0.07);
    }
    
    .serch-txt:focus {
        text-align: left;
        padding-left: 25px;
        padding-right: 25px;
        background-position: 5px 5px;
    }
    
    .serch-has-txt {
        text-align: left;
        padding-left: 25px;
        padding-right: 25px;
        background-position: 5px 5px;
    }
    
    .search-box .clear-btn {
        width: 16px;
        height: 16px;
        background: url(../../common/images/close.svg) no-repeat;
        position: absolute;
        right: 10px;
        top: 5px;
        -webkit-app-region: no-drag;
    }
    /*.search-icon {
        width: 16px;
        height: 16px;
        background: url(../../common/images/search_btn.png);
        position: absolute;
        right: 0;
        top: 5px;
        cursor: pointer;
        -webkit-app-region: no-drag;
    }*/
</style>