<template>
    <div class="bangdan-con bangdan-con-left">
        <div class="bangdan-top">
            <div class="bangdan-top-left">
                <p class="bangdan-title">{{titleData.title}}</p>
                <span class="list-play" @click="playWholeSongList({'songArray':data})"></span>
            </div>
            <span class="tonewbangdan">
                <router-link :to="titleData.link">完整榜单</router-link>
            </span>
        </div>
        <ul class="bangdan-recom-list">
            <li v-for="(val,index) in data" 
                :class="{'disabled':(val.copy_type==0 || val.del_status==1),'active':select_index_array.indexOf(index)>-1}" 
                @dblclick="playWholeSongList({'songArray':data,'playIndex':index})" 
                :data-index="index" 
                @mouseenter="mouseHover(index)" 
                @contextmenu="onContextMenu(index, $event)"
                @click="choseSong(index)"
                :id="getSongId(val)">
                <span class="num" :class="{rank:index<3}">{{index+1}}.</span>
                <span class="title">
                    <span class="_title" :title="val.title" :class='{"_title_1":getIconLength(val.biaoshi)==1,"_title_2":getIconLength(val.biaoshi)==2,"_title_3":getIconLength(val.biaoshi)==3,"_title_4":getIconLength(val.biaoshi)==4}'>{{val.title}}</span> 
                    <span v-if="parseInt(val.has_mv) == 1" class="mv_icon" @click="playVideo({'song_id':val.song_id,'mv_id':val.mv_id})"><i></i></span>
                    <span class="biaoshi" v-html="getIcons(val.biaoshi)"></span>
                    <span class="fct">
                        <play-icon v-if="val.copy_type!=2" :type="'songlist'" :listid="''" :data="{'songArray':data,'playIndex':index}"></play-icon>
                        <play-icon v-else :type="'songlist'" :listid="''" :disabled="'disabled'" :data="{'songArray':data,'playIndex':index}"></play-icon>
                        <!--<favour-icon v-if="!isSongLocal(val)" :type="'songlist'" :data="val" :favorstate="favorstate"></favour-icon>
                        <favour-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val" :favorstate="favorstate"></favour-icon>-->
                        <i :class="{'disabled':isSongLocal(val),'favoured-icon':favorstate, 'favour-icon':!favorstate}" @click="doFavour(val)"></i>
                        <download-icon v-if="isSongCanDownload(val)" :type="'songlist'" :data="val"></download-icon>
                        <download-icon v-else :type="'songlist'" :disabled="'disabled'" :data="val"></download-icon>
                        <more-icon :type="'songlist'" :data="{songArray:data, type:'bangdan', list_id:val.type, selectindex:index}"></more-icon>
                    </span>
                </span>
                <span class="author" :title="val.author">
                    <router-link v-for="(item,i) in val.authorLinksArr" :to="'/music/public/singer/'+item.artist_id+'/0'">{{item.artist_name}}
                        <i v-if="i<val.authorLinksArr.length-1">,</i>
                    </router-link>
                </span>
            </li>
        </ul>
    </div>
</template>
<script>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import playIcon from 'components/icons/playIcon.vue'
    import favourIcon from 'components/icons/favourIcon'
    import moreIcon from 'components/icons/moreIcon.vue'
    import downloadIcon from 'components/icons/downloadIcon.vue'
    import mvService from '../../service/mvService'
    import playMv from '../../utils/mv/playMv.js'   
    const ipc = require('electron').ipcRenderer
    
    export default {
        name: 'rec-bangdan',
        computed: mapGetters({
            loginStatus: 'loginStatus'
        }),
        props: {
            titleData: Object,
            data: Array,
        },
        data() {
            return {
                select_index_array: [],
                favorstate: ''
            }
        },
        components: {
            playIcon,
            favourIcon,
            moreIcon,
            downloadIcon
        },
        methods: {
            playWholeSongList(paramsJson) {
                if (this.domAction.hasClass(event.currentTarget, 'disabled')) {
                    return false
                }
                this.$store.dispatch('playWholeSongList', paramsJson)
                eventBus.$emit('isShowAddMusicIcon', true)
            },
            downloadSong(songinfoJson, event) {
                let clientX = event.clientX
                let clientY = event.clientY
                let positionData = {
                    'clientX': clientX,
                    'clientY': clientY
                }
                if (document.getElementsByClassName('context-menu-wrapper').length > 0) {
                    document.body.removeChild(document.getElementsByClassName('context-menu-wrapper')[0])
                }
                let songArray = [];
                songArray.push(songinfoJson);
                this.MessageBox.download(songArray, positionData)

            },

            isSongLocal(songInfo) {
                let songid = this.commonFuns.getSongId(songInfo);
                if (songid.length <= 0 || songid.indexOf('_local') !== -1) {
                    return true;
                }

                return false;
            },
            isSongCanDownload(songInfo) {
                return this.commonFuns.isSongCanDownload(songInfo);
            },
            choseSong(index) {
                if (event.metaKey || event.ctrlKey) {
                    this.select_index_array.push(index)
                } else if (event.shiftKey) { // shift键
                    let top_selected = this.select_index_array[0]
                    let newSelectIndexs = []
                    if (top_selected <= index) {
                        for (let i = top_selected; i <= index; i++) {
                            newSelectIndexs.push(i);
                        }
                    } else {
                        for (let i = index; i <= top_selected; i++) {
                            newSelectIndexs.push(i);
                        }
                    }
                    this.select_index_array = newSelectIndexs
                } else {
                    this.select_index_array = []
                    this.select_index_array.push(index)
                }


            },
            mouseHover(index) {
                if (this.loginStatus) {
                    if (index < 0 || index >= this.data.length) {
                        return;
                    }

                    let songInfo = this.data[index];
                    let param = {
                        'song': songInfo,
                        'is_match': false
                    }
                    this.$store.dispatch('isSongFavored', param);
                    this.favorstate = param.is_match;
                    // console.log('current favor state is: ' + this.favorstate + ' song is: ' + songInfo.title)
                } else {
                    this.favorstate = false;
                }
            },
            getIcons(namesStr) {
                let biaoshi = ''
                if (namesStr) {
                    let biaoshiArr = ['pay', 'sole', 'presell', 'lossless', 'first']
                    let namesArr = namesStr.split(',')

                    namesArr.forEach((item, index) => {
                        if (biaoshiArr.indexOf(item) > -1) {
                            biaoshi += '<i class="' + item + '"></i>'
                        }
                    })
                }
                return biaoshi
            },
            getIconLength(namesStr) {
                let len = 0
                if (namesStr) {
                    let biaoshiArr = ['pay', 'sole', 'presell', 'lossless', 'first']
                    let namesArr = namesStr.split(',')
                    namesArr.map((item) => {
                        biaoshiArr.indexOf(item)
                    })
                    len = namesArr.length
                }
                return len

            },
            getSongId(song) {
                return this.commonFuns.getSongId(song);
            },
            addFavour(data) {
                let songsData = []
                songsData.push(data)
                let isFavoured = this.favorstate
                let paramsJson = {
                    songsData,
                    isFavoured
                }
                this.$store.dispatch('addSongFavorites', paramsJson)
                this.favorstate = true
            },
            deleteFavour(data) {
                let songsData = []
                songsData.push(data)
                let isFavoured = this.favorstate
                let paramsJson = {
                    songsData,
                    isFavoured
                }
                this.$store.dispatch('delSongFavorites', paramsJson)

                this.favorstate = false

            },
            doFavour(song) {
                if (this.favorstate) {
                    this.deleteFavour(song)
                } else {

                    this.addFavour(song)
                }
            },
            onContextMenu(index, event) {
                if (this.select_index_array.indexOf(index) == -1) {
                    this.select_index_array.splice(0, this.select_index_array.length);
                    this.select_index_array.push(index)
                }
                let clientX = event.clientX
                let clientY = event.clientY
                let positionData = {
                    'clientX': clientX,
                    'clientY': clientY
                }

                this.MessageBox.context(this.data, this.select_index_array, 'online', 'recBangdan', positionData)
            },
            playVideo (obj) {
                let data =  {}
                let _self = this;
                if(obj.song_id){
                    data = {'song_id':obj.song_id};
                    mvService.getMvPlayUrl(data, res => {
                        if (res.error_code == 22000) {
                            playMv.playMv(res.result ? res.result : {})
                        }
                    }, err => {
                        console.log(err)
                    })
                }else if(obj.mv_id){
                    data = {'mv_id':obj.mv_id}
                    mvService.getMvPlayUrl(data, res => {
                        if (res.error_code == 22000) {
                            playMv.playMv(res.result ? res.result : {})
                        }
                    }, function(err) {
                        console.log(err)
                    })
                }else {
                    alert('播放数据有误')
                    return false
                }
                
            }
        }
    }
</script>
<style scoped>
    .bangdan-con {
        min-width: 393px;
        width: 50%;
        padding-right: 20px;
        box-sizing: border-box;
    }
    
    .bangdan-con:last-child {
        margin-right: 0px;
    }
    
    .bangdan-top {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        height: 44px;
        background: #22c5bd;
    }
    
    .bangdan-title {
        font-size: 20px;
        color: #fff;
        margin-left: 15px;
    }
    
    .tonewbangdan {
        color: #fff;
        font-size: 14px;
        margin-right: 16px;
    }
    
    .tonewbangdan a {
        color: #fff;
    }
    
    .tonewbangdan a:hover {
        color: #fff;
    }
    
    .bangdan-recom-list li {
        height: 34px;
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        padding: 0 10px;
    }
    
    .bangdan-recom-list li:nth-child(2n+1) {
        background: #fff;
    }
    
    .bangdan-recom-list li:nth-child(2n) {
        background: #fafafa;
    }
    
    .bangdan-recom-list li span {
        font-size: 14px;
    }
    
    .bangdan-recom-list .num {
        width: 27px;
    }
    
    .bangdan-recom-list .title {
        position: relative;
        height: 34px;
        flex: 1 1 126px;
        padding-left: 8px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        display: flex;
        align-items: center;
    }


    .bangdan-recom-list .biaoshi {
        max-width: 118px;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        opacity: 1;
        transition: 0.2s linear;
    }
    
    .bangdan-recom-list .biaoshi >>> i {
        display: inline-block;
        width: 30px;
        height: 30px;
        margin-left: 2px;
    }
    
    .bangdan-recom-list .biaoshi >>> i.first {
        background: url('~static/images/jiaobiao/first.svg') no-repeat 0 8px;
    }
    
    .bangdan-recom-list .biaoshi >>> i.lossless {
        background: url('~static/images/jiaobiao/lossless.svg') no-repeat 0 8px;
    }
    
    .bangdan-recom-list .biaoshi >>> i.pay {
        background: url('~static/images/jiaobiao/pay.svg') no-repeat 0 8px;
    }
    
    .bangdan-recom-list .biaoshi >>> i.sole {
        background: url('~static/images/jiaobiao/sole.svg') no-repeat 0 8px;
    }
    
    .bangdan-recom-list .biaoshi >>> i.presell {
        background: url('~static/images/jiaobiao/presell.svg') no-repeat 0 8px;
    }


    .bangdan-recom-list .fct {
        position: absolute;
        top: 7px;
        right: -10px;
        width: 100px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        opacity: 0;
        margin-right: 14px;
        transition: 0.2s 0.05s linear;  
    }
    
    .bangdan-recom-list li:hover .fct {
        opacity: 1;
    }
    .bangdan-recom-list li.disabled:hover .fct {
        opacity: 0;
    }
    .bangdan-recom-list li:hover .biaoshi {
        opacity: 0;
    }
    .bangdan-recom-list li.disabled span,.bangdan-recom-list li.disabled a{
        color: #ccc;
    }
    
    .bangdan-recom-list .author {
        flex: 0 0 80px;
        justify-content: flex-start;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        text-align: right;
    }
    
    .bangdan-recom-list .play {
        width: 23px;
        height: 23px;
        margin-top: 6px;
    }
    
    ul.bangdan-recom-list li:hover {
        background: #f2f2f2;
    }
    
    .bangdan-recom-list li.active {
        background: #f2f2f2;
    }
    
    .bangdan-recom-list .rank {
        color: #22c5bd;
    }
    
    .bangdan-con:last-child .rank {
        color: #ff6d8f;
    }
    
    .bangdan-con:last-child .bangdan-top {
        background: #ff6d8f;
    }
    
    .list-play {
        display: block;
        width: 23px;
        height: 23px;
        background: url(../../common/images/list_play.png) no-repeat 0 0;
        background-size: 92px 23px;
    }
    
    .bangdan-top .list-play {
        width: 27px;
        height: 27px;
        background: url(../../common/images/img_play.png) no-repeat;
        background-size: auto 27px;
        cursor: pointer;
    }
    
    .bangdan-recom-list li .list-play {}
    
    .bangdan-top-left {
        display: flex;
        width: 106px;
        justify-content: space-between;
        align-items: center;
    }
    
    .bangdan-recom-list a:hover {
        color: #e13228;
    }
    
    .disabled,
    .disabled a,
    .disabled span,
    .table-song-list li.disabled a:hover {
        color: #f2f2f2;
    }
    
    .table-song-list li.disabled:hover .fct {
        visibility: hidden;
    }
    
    .table-song-list li.disabled:hover {
        background: #fff;
    }
    
    .title span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    ._title {
        max-width: 130px;
        transition: 0.1s linear;        
    }
    
    /* ._title._title_1 {
        max-width: 130px;
    }
    
    ._title._title_2 {
        max-width: 130px;
    }
    
    ._title._title_3 {
        max-width: 110px;
    } */
    /*
    ._title._title_4 {
        max-width: 10px;
    }
    */
    ul.bangdan-recom-list li:hover ._title{
        max-width: 100px;
    }
    
    .favour-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('~static/images/listIcon/icon2.svg') no-repeat;
        cursor: pointer;
    }
    
    .favour-icon:hover {
        background: url('~static/images/listIcon/icon2_1.svg') no-repeat;
    }
    
    .favoured-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('~static/images/listIcon/icon5.svg') no-repeat;
        cursor: pointer;
    }
    
    .disabled.favour-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('~static/images/listIcon/icon2_2.svg') no-repeat;
        cursor: default;
    }

    .bangdan-recom-list .mv_icon {
        display: inline-block;
        width: 18px;
        cursor: pointer;
        margin-left: 3px;
    }
    .bangdan-recom-list .mv_icon i{
        display: inline-block;
        width: 16px;
        height: 30px;
        background: url('~static/images/mv/mv.svg') no-repeat 0 10px;
    }
    .bangdan-recom-list .mv_icon:hover i {
        background: url('~static/images/mv/mv_hover.svg') no-repeat 0 10px;
    }
    .bangdan-recom-list .mv_icon.gray {
        cursor: default;
    }
    .bangdan-recom-list .mv_icon.gray:hover i,.mv_icon.gray i {
        background: url('~static/images/mv/mv_gray.svg') no-repeat 0 10px;
    }

    @media screen and (min-width: 1200px) {
       ._title {
            max-width: 200px;
            transition: 0.1s linear;        
        }
        
        ul.bangdan-recom-list li:hover ._title{
            max-width: 170px;
        }
    }

</style>