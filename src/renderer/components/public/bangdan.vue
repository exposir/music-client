<template>
    <div class="bandaninfo">
        <div class="info-box" v-if="bangdanInfo && bangdanInfo.billboard">
            <div class="img-border">
                <img  :src="bangdanInfo.billboard.pic_s192">
            </div>
            <div class="info-detail">
                <h3 class="info-title" v-if="bangdanInfo.billboard.name">{{bangdanInfo.billboard.name}}</h3>
                <div class="detail-box">
                    <div class="detail-txt">
                        <p v-if="bangdanInfo.billboard.update_date">更新时间 : {{bangdanInfo.billboard.update_date}}</p>
                        <p class="detail">该榜单是根据千千音乐平台歌曲每日播放量自动生成的数据榜单，统计范围为近期发行的歌曲，每日更新一次</p>
                    </div>
                </div>
                <div class="button-wrap">
                    <button-collect :allSongs="songlist" :listid="'bangdan'" :isShow="{'playall':this.isNotMass,'massop':this.isNotMass,'favour':false,'more':false,'play':this.isMass,'addto':this.isMass,'download':this.isMass,'massexit':this.isMass}"></button-collect>
                </div>
            </div>
        </div>
        <song-list :data="songlist" :detail="{'classname':'big','type':'bangdan','list_id':bangdanId}" :fields="{'hot':false,'album_title':true,'singer':true}"></song-list>
        <div class="pagination-box" v-if="total > size">
            <el-pagination small layout="prev, pager, next" :total="total" :page-size="size" @current-change="onChangePage"></el-pagination>
        </div>
    </div>
</template>
<script>
    import {
        mapGetters
    } from 'vuex'
    import songList from 'components/public/song-list.vue'
    import buttonCollect from 'components/button/button-collect.vue'
    export default {
        name: 'bangdan',
        data() {
            return {
                selected: null,
                size: 20,
                bangdanId: 0,
                isMass: false,
                isNotMass: true
            }
        },
        computed: {
            ...mapGetters({
                bangdanInfo: 'bangdanInfo'
            }),
            songlist() {
                return this.bangdanInfo.song_list
            },
            total() {
                if (this.bangdanInfo && this.bangdanInfo.billboard) {
                    return parseFloat(this.bangdanInfo.billboard.billboard_songnum)
                }
            }
        },
        created: function() {
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0
            }
            this.fetchData(),
                eventBus.$on('isMass', (val) => {
                    this.isMass = val
                    this.isNotMass = !val
                })
        },
        components: {
            songList,
            buttonCollect
        },
        methods: {
            fetchData(page) {
                let offset = page ? (page - 1) * this.size : 0
                var bangdanId = this.$route.params.id
                this.bangdanId = bangdanId
                this.$store.dispatch('getBangdanInfo', {
                    'type': bangdanId,
                    'size': this.size,
                    'offset': offset
                })
            },
            playWholeSongList(paramsJson) {
                this.$store.dispatch('playWholeSongList', paramsJson)
            },
            onChangePage(page) {
                document.querySelector('.song-list-wrapper').querySelectorAll('.active').forEach((item, index) => {
                    this.domAction.removeClass(item, 'active')
                })
                this.$nextTick(() => {
                    document.querySelector('.show').scrollTop = 0
                    this.fetchData(page)
                })
            },
        }
    }
</script>
<style scoped>
    .bandaninfo {
        padding: 22px 17px 17px 17px;
        
    }
    
    .bd-info {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
    }
    
    .bangdan-title-txt {
        background: #e13228;
        width: 255px;
        height: 72px;
        font-size: 34px;
        color: #fff;
        border-radius: 7px 7px 0 0;
        text-align: center;
        line-height: 72px;
        position: relative;
        padding-right: 70px;
    }
    
    .bangdan-title-txt .txt {
        text-align: center;
        width: 205px;
    }
    
    .bd-play-all {
        position: absolute;
        width: 36px;
        height: 36px;
        background: url(../../common/images/img_play.png) no-repeat 0 0;
        background-size: 72px 36px;
        right: 33px;
        top: 18px;
        cursor: pointer;
    }
    
    .bd-play-all:hover {
        background-position: -36px 0;
    }
    
    .bd-time {
        width: 330px;
        margin-top: 12px;
    }
    
    .bd-time .intro {
        line-height: 18px;
        color: #a3a3a3;
    }
    
    .info-box {
        height: 160px;
        display: flex;
        margin-bottom: 22px;
    }
    
    .img-box {
        flex: 1 1 140px;
        position: relative;
        cursor: pointer;
    }
    
    .img-box .mask {
        opacity: 0;
        transition: opacity .5s;
        z-index: 1;
    }
    
    .img-box:hover .mask {
        opacity: 1
    }
    
    .img-box img {
        width: 136px;
        height: 136px;
        border: solid 2px #f2f2f2;
    }
    
    .info-detail {
        flex: 1 1 600px;
        margin-left: 28px;
        position: relative;
    }
    
    .info-title {
        font-size: 24px;
        color: #333333;
        font-weight: normal;
    }
    
    .detail {
        flex: 0 0 94%;
        color: #8c8c8c;
        font-size: 12px;
        height: 40px;
        line-height: 20px;
        position: relative;
        overflow: hidden;
        -webkit-line-clamp: 2;
        margin-top: 2px;
        margin-bottom: 20px;
    }
    
    .info-tags-box {
        display: flex;
        margin-top: 10px;
    }
    
    .info-user {
        flex: 0 0 225px;
        display: flex;
    }
    
    .info-user .user {
        max-width: 100px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .info-user .user::before {
        width: 16px;
        height: 16px;
        display: inline-block;
        content: "";
        background: url(../../common/images/gedanuser_icon.png) no-repeat 0 50%;
        background-size: 16px auto;
        margin-right: 5px;
        vertical-align: middle;
    }
    
    .info-user .dtime {
        margin-left: 8px;
    }
    
    .info-tags {
        flex: 1 1 350px;
        margin-left: 46px;
    }
    
    .detail-txt {
        display: flex;
        flex-flow: row wrap;
        margin-top: 20px;
    }
    
    .more-btn {
        color: #111;
        position: absolute;
        right: 3px;
        top: 32px;
    }
    
    .detail-box {
        position: relative;
    }
    
    .gedan-item-box {
        width: 140px;
        height: auto;
    }
    
    .gedan-detail {
        width: 160px;
        height: 160px;
    }
    
    .img-border {
        width: 158px;
        height: 158px;
        margin-bottom: 8px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .img-border img {
        width: 158px;
        height: 158px;
        border: solid 1px #f2f2f2;
    }
    
    .img-border .mask {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        z-index: 1;
        transition: opacity .5s;
    }
    
    .img-border .mask {
        opacity: 1;
    }
    
    .img-border:hover .mask {
        opacity: 1;
    }
    
    .img-border .mask a {
        width: 100%;
        height: 100%;
        display: block;
    }
    
    .img-border:hover .mask {
        display: block;
    }
    
    .img-border .img-play {
        width: 36px;
        height: 36px;
        position: absolute;
        left: 52px;
        top: 52px;
        display: none;
        cursor: pointer;
        background: url(../../common/images/img_play.png) no-repeat;
        background-size: 72px 36px;
        z-index: 2;
    }
    
    .img-play:hover {
        background-position: -36px 0;
    }
    
    .img-border:hover .img-play {
        display: block;
    }
    
    .img-border .img-play {
        display: block;
    }
    
    .button-wrap {
        display: flex;
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>