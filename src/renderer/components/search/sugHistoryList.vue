<template>
<ul class="sug-list" id="historyList"  v-if="search_history && total>0">
    <li class="search-history-list">
        <span class="sug-title">搜索历史<a class="clear-history-btn" @click="clearHistoryList">清空</a></span>
        <div class="sug-section">
            <ul class="sug-res-list">
                <li v-for="(item,index) in search_history.list" @click="selectClick($event)">
                <router-link :to="'/search/song/'+item+'/1'" class="song-name-box">{{item}}</router-link>
                </li>
            </ul>
        </div>
    </li>
</ul>
</template>
<style scoped>
    .search-history-list ul.sug-res-list,
    .search-history-list .sug-res-list li,
    .search-history-list .sug-res-list li a {
        width: 100%;
        flex: none;
    }
    
    .sug-title {
        position: relative;
    }
    
    .clear-history-btn {
        position: absolute;
        right: 7px;
        color: #e13228;
    }
</style>
<script>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    export default {
        name: 'sug-history-list',
        props: {
            query: String
        },
        computed: {
            ...mapGetters({
                search_history: 'search_history'
            }),
            total() {
                return this.search_history.list.length
            }
        },
        created() {
            this.$store.dispatch('getSearchHistory')
        },
        methods: {
            selectClick(event) {
                this.$parent.selectClickToSearch(event)
            },
            clearHistoryList() {
                this.$store.dispatch('clearSearchHistory')
                this.$nextTick(() => {
                    this.$store.dispatch('getSearchHistory')
                })
            }
        }
    }
</script>