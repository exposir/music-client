<template>
    <div class="private-radio-wrapper">
        <div v-if="loginStatus" class="private-radio-box">
            <div class="left-box" v-cloak>
                <p class="title">{{current_playing_privateRadio.title}}</p>
                
                <p class="author">
                    <span class="bold">歌手：</span>
                    <span v-for="(item, index) in current_playing_privateRadio.artist_list">
                        <router-link @click.native="commonFuns.crmStatistics('radio','singerClick')" :to="'/music/public/singer/'+item.artist_id + '/0'">
                            {{item.artist_name}}
                        </router-link>
                        <i v-if="index < current_playing_privateRadio.artist_list.length-1">,</i>
                    </span>
                </p>
                <p class="album_title">
                    <span class="bold">专辑：</span>
                    <router-link @click.native="commonFuns.crmStatistics('radio','albumClick')" :to="'/music/public/album/'+current_playing_privateRadio.album_id">
                        {{ current_playing_privateRadio.album_title}}
                    </router-link>
                </p>
                <div class="cover">
                    <img v-if="current_playing_privateRadio.pic_premium" :src="current_playing_privateRadio.pic_premium">
                    <img v-else-if="current_playing_privateRadio.pic_s500" :src="current_playing_privateRadio.pic_s500">                    
                    <img v-else-if="current_playing_privateRadio.pic_radio" :src="current_playing_privateRadio.pic_radio">
                    <img v-else-if="current_playing_privateRadio.pic_big" :src="current_playing_privateRadio.pic_big">
                    <img v-else-if="current_playing_privateRadio.pic_huge" :src="current_playing_privateRadio.pic_huge">
                    <img v-else-if="current_playing_privateRadio.pic_small" :src="current_playing_privateRadio.pic_small">
                    <img v-else src="static/images/default_pic.svg">
                    <span :class="{'playing': isPlaying}" @click="playOrPause(false)"></span>
                </div>
                <div class="btnList">
                    <span class="favor" :class="{'favored': current_playing_privateRadio.favorite_type == 1 || favorstate}" @click="doFavour"></span>
                    <span class="dislike" @click="delSong"></span>
                    <span class="next" @click="nextSong(true)"></span>
                </div>
            </div>
            <div class="right-box">
                <p class="moreRadio">
                    <router-link to="/radioIndex"  @click.native="commonFuns.crmStatistics('radio','more')"><span>更多电台</span></router-link>
                </p>
                <div class="lrc-box">
                    <div class="mask"></div>
                    <div class="song-lrc-box" v-if="current_playing_privateRadio.lyric_array.length>0 && current_playing_privateRadio.lyric_array[0].time">
                        <ul class="lrc-box" id="lyricBox">
                            <li v-for="(item,index) in current_playing_privateRadio.lyric_array" :class="{now:(item.time && currentPlayingTimePos>=item.time) && (current_playing_privateRadio.lyric_array[index+1] && currentPlayingTimePos<=current_playing_privateRadio.lyric_array[index+1].time) && (playingRadioInfo.type == 'privateRadio')}">{{item.lyric}}</li>
                        </ul>
                    </div>
                    <div class="song-lrc-box song-text-lrc-box" v-if="current_playing_privateRadio.lyric_array.length>0 && !current_playing_privateRadio.lyric_array[0].time">
                        <ul class="lrc-box txt-lrc-box">
                            <li v-for="lyric in current_playing_privateRadio.lyric_array">{{lyric}}</li>
                        </ul>
                    </div>
                    <div class="song-lrc-box no-lyric-tips-box" v-if="current_playing_privateRadio.lyric_array.length<1">
                        <div class="no-lyric-tips">暂无歌词</div>
                    </div>
                </div>
            </div>
        </div>
        <empty v-else :content="'登录后收听专属推荐歌曲！'" :btnText="'现在登录'" :callbackFun="login" ></empty>
    </div>
</template>
<script>
    import empty from 'components/empty/empty'
    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'private-radio',
        computed: {
            ...mapGetters({
                loginStatus: 'loginStatus',
                loginUserInfo: 'loginUserInfo',
                private_radio: 'private_radio',

                current_playing_privateRadio: 'current_playing_privateRadio',
                playingRadioInfo: 'playing_radio_info',

                song: 'currentPlayingSong',
                currentPlayIndex: 'currentPlayIndex',
                currentPlaysList: 'currentPlaysList',
                currentPlayingState:'currentPlayingState',
                currentPlayingTimePos: 'currentPlayTimePos',

                playingRadioInfo: 'displayInfo'     //先取出local的电台信息，作为判断是否播放电台的依据
            }),
        },
        components: {
            empty
        },
        data() {
            return {
                playingPrivateRadio: false,
                isPlaying: false,
                favorstate: undefined,
                nowSong: {},
                nowLyric: [],
            }
        },
        created() {
            if ( this.playingRadioInfo.type == "privateRadio" ) {//当前是"私人电台"，页面显示当前播放的歌曲信息
                this.$store.dispatch('setCurrentPlayingPrivateRadio', this.song)
            } else {
                //非私人电台时，要根据播放状态，进行相应的操作
                this.$store.dispatch('getPrivateRadio',{
                    "limit": 10,
                    "city": this.loginUserInfo.province,
                    "from": "weixin",
                    "extra": Object.keys(this.current_playing_privateRadio).length<=1 ? undefined : this.current_playing_privateRadio
                })
            }       
            this.matchSongIsFavour()  
        },
        watch:{
            loginStatus(now, before){
                if ( this.currentPlayingState != 1 && now && this.playingRadioInfo.type != "privateRadio") {     //非私人电台+已登录+暂停状态，则自动播放私人电台
                    this.playPrivateRadio(false)
                }
                //在"私人电台"页退出时，请求新的歌单：避免用户在私人电台页上登录/退出切换时，歌单不变
                if( !now ){
                    this.getPrivateRadio()
                }
            },
            private_radio(now, before){
                if ( this.playingRadioInfo.type != "privateRadio" ) {
                    this.$store.dispatch('setCurrentPlayingPrivateRadio',now[0])
                }
                if ( this.currentPlayingState != 1 && this.loginStatus && this.playingRadioInfo.type != "privateRadio") {     //非私人电台+已登录，则自动播放私人电台
                    this.playPrivateRadio(false)
                }
            },
            currentPlayingState(now, before){
                if ( this.playingRadioInfo.type == "privateRadio" ) { 
                    if ( now != 1 ) {             //暂停状态
                        this.isPlaying = false
                    } else {
                        this.isPlaying = true
                    }
                }
            },
            //播放歌曲切换时，要判断当前歌曲是否被收藏
            current_playing_privateRadio(now, before){
                if ( this.playingRadioInfo.type == "privateRadio" ) {
                    this.matchSongIsFavour()
                }
            },
        },
        mounted() {
            eventBus.$on("favoritesongchanged", () => {
                this.matchSongIsFavour();
            });
            if ( (this.currentPlayingState == 1) && (this.playingRadioInfo.type == "privateRadio") ) {  
                this.isPlaying = true
            }
            
        },
        methods: {
            getPrivateRadio(){
                this.$store.dispatch('getPrivateRadio',{
                    "limit": 10,
                    "city": this.loginUserInfo.province,
                    "from": "weixin"
                })
            },
            login() {
                this.commonFuns.crmStatistics('radio','login','click')
                if (window.navigator.onLine == true) {　
                    this.$store.dispatch('TpassLogin')
                } else {　
                    this.commonFuns.createTips("网络似乎没连好，请检查连接", 'warning');
                }
            },
            playPrivateRadio( deleteCurrent ){
                this.$store.dispatch('addSongsToCurrentPlayinglist', {
                    "songArray": deleteCurrent ? this.private_radio.slice(1) : this.private_radio,
                    "playIndex": 0,
                    "isPlay": true,
                    "isReset": true,
                    "infoForPlayRadio": {
                        type: "privateRadio",
                        scene_title: "私人电台"
                    }
                })
                this.isPlaying = true
            },
            playOrPause(deleteCurrent){
                if ( this.playingRadioInfo.type == "privateRadio" ){
                    if ( this.currentPlayingState != 1 ) { //暂停状态
                        this.$store.dispatch('play');
                    } else {
                        this.$store.dispatch('pause');
                    }
                } else {
                    this.playPrivateRadio(deleteCurrent)
                }
            },
            doFavour(){
                this.commonFuns.crmStatistics('radio','collect','click')
                this.favorstate = (this.favorstate==undefined) ? (this.current_playing_privateRadio.favorite_type==1) : this.favorstate
                if ( this.favorstate ){
                    this.deleteFavour( this.favorstate )
                } else {
                    this.addFavour( this.favorstate )
                }
            },
            addFavour(favorstate) {
                let songsData = [];
                songsData.push(this.current_playing_privateRadio);
                let paramsJson = {
                    songsData,
                    favorstate
                };
                this.$store.dispatch("addSongFavorites", paramsJson);
                this.favorstate = true
            },
            deleteFavour(favorstate) {
                let songsData = [];
                songsData.push(this.current_playing_privateRadio);
                let paramsJson = {
                    songsData,
                    favorstate
                };
                this.$store.dispatch("delSongFavorites", paramsJson);
                this.favorstate = false
            },
            delSong(){
                this.commonFuns.crmStatistics('radio','lajitong','click')
                if ( this.playingRadioInfo.type == "privateRadio" ) {
                    let indexArrs = [];
                    indexArrs.push(this.currentPlayIndex)
                    this.$store.dispatch('deleteCurrentPlaylistSongsByIndex', {
                        indexArrs,
                        isDelFile: true
                    });
                } else {
                    this.playPrivateRadio( true )
                }
                
            },
            nextSong(isClicked) {
                this.commonFuns.crmStatistics('radio','next')
                if ( this.playingRadioInfo.type == "privateRadio" ) {
                    this.$store.dispatch('playPrevOrNextSong', {
                        "isPrev": false,
                        "isMouseClicked": isClicked
                    })
                } else {
                    this.playPrivateRadio( true )
                }
                
            },
            matchSongIsFavour() {
                let param = {
                    song: this.current_playing_privateRadio,
                    is_match: false
                };
                this.$store.dispatch("isSongFavored", param);
                this.favorstate = param.is_match;
            }
        }
        
    }
</script>
<style scoped>
    [v-cloak] {
        display: none;
    }
    .private-radio-wrapper {
        height: 100%;
        position: relative;
    }
    .private-radio-wrapper .empty-wraper {
    }
    .private-radio-wrapper .empty-wraper .empty-tips {
        font-size: 16px;
        color: #333333;
        background-color: black;
    }
    .private-radio-wrapper .empty-wraper span.empty-btn {
        display: inline-block;
        background-color: #e13228;
        color: #fdf5f5;
    }
    .private-radio-box {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 485px;
        width: 800px;
        padding-left: 50px;
        
        margin: auto;
    }
    .private-radio-box>div {
        display: inline-block;
        height: 100%;
        vertical-align: top;
    }
    .private-radio-box .left-box {
        width: 300px;
    }
    .private-radio-box .right-box {
        width: 430px;
    }
    .left-box p {
        width: 280px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .left-box .title {
        font-size: 20px;
        /* margin: 35px 0 20px; */
        margin: 30px 0 20px;
    }
    .left-box .author {
        font-size: 14px;
        margin-bottom: 5px;
    }
    .left-box .album_title {
        font-size: 14px;
        margin-bottom: 10px; 
    }
    .left-box p span.bold {
        font-weight: bold;
    }
    .left-box .cover {
        width: 300px;
        height: 280px;
        position: relative;
        margin-bottom: 15px;
        background: url('~static/images/record_bg.png') no-repeat;
        background-size: 100% 100%;
    }
    .left-box .cover img {
        border: 1px solid #eeeeee;
        width: 278px;
        height: 278px;
        margin-right: 20px;
    }
    .left-box .cover span {
        display: inline-block;
        width: 65px;
        height: 65px;
        background-size: 65px 65px;
        cursor: pointer;
        position: absolute;
        left: 110px;
        top: 110px;
        background: url('~static/images/roundBorderIcon/playing.svg') no-repeat;
    }
    .left-box .cover span.playing {
        background: url('~static/images/roundBorderIcon/paused.svg') no-repeat;
    }
    .left-box .btnList {
        height: 50px;
        padding-right: 20px;
        display: flex;
        justify-content: space-around;
    }
    .left-box .btnList span{
        display: inline-block;
        height: 50px;
        width: 50px;
        cursor: pointer;
    }
    .left-box .btnList .favor{
        background: url('~static/images/roundBorderIcon/favor.svg') no-repeat;
    }
    .left-box .btnList .favor:not(.favored):hover{
        background: url('~static/images/roundBorderIcon/favor_hover.svg') no-repeat;
    }
    .left-box .btnList .favored{
        background: url('~static/images/roundBorderIcon/favored.svg') no-repeat;
    }
    .left-box .btnList .dislike{
        background: url('~static/images/roundBorderIcon/dislike.svg') no-repeat;
    }
    .left-box .btnList .dislike:hover{
        background: url('~static/images/roundBorderIcon/dislike_hover.svg') no-repeat;
    }
    .left-box .btnList .next{
        background: url('~static/images/roundBorderIcon/next.svg') no-repeat;
    }
    .left-box .btnList .next:hover{
        background: url('~static/images/roundBorderIcon/next_hover.svg') no-repeat;
    }

    .right-box {
        padding-left: 50px;
    }

    .right-box .moreRadio {
        margin: 20px 20px 0 0;
        height: 30px;
        text-align: right;
        margin-bottom: 2px;
    }
    
    .right-box .moreRadio a{
        display: inline-block;
    }
    .right-box .moreRadio span {
        display: inline-block;
        width: 95px;
        height: 30px;
        color: #e13228;
        border: 1px #e13228 solid;
        border-radius: 16px;
        font-size: 14px;
        text-align: center;
        line-height: 30px;
    }
    .right-box .lrc-box {
        height: 430px;
        position: relative;
    }
    .right-box .lrc-box .mask {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom,rgba(255,255,255,1) 0%,rgba(255,255,255,0) 25%, rgba(255,255,255,0) 75%, rgba(255,255,255,1) 100%);
    }
    .right-box .song-lrc-box {
        width: 100%;
        height: 100%;
        background: transparent;
        font-size: 16px;
        line-height: 35px;
        overflow: hidden;
        text-align: left;
        position: relative;
    }
    .right-box .song-lrc-box .lrc-box {
        width: 100%;
        position: absolute;
        /*top:-100px;*/
    }
    .right-box .song-lrc-box li.now {
        color: #e75b53;
    }
    .right-box .song-lrc-box li {
        width: 100%;
        color: #a0a0a0;
    }
    .song-lrc-box.song-text-lrc-box {

    }
    .song-lrc-box.no-lyric-tips-box {
        padding-top: 50%;
    }
    .no-lyric-tips-box .no-lyric-tips {
        text-align: center;
    }
    

</style>

