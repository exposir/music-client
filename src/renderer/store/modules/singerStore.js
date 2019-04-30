import * as types from '../mutation-types'
import serviceCommon from '../../service/common'
import singerService from '../../service/singerService'
import VueRouter from 'vue-router'
import routerConfig from '../../router.config.js'
const router = new VueRouter(routerConfig)

const state = {
    singerList: {},
    singerInfo: {},
    singerSongdata: {},
    singerAlbumdata: {},
    hotSingerSongList: []

}

const getters = {
    singerList: () => state.singerList,
    singerInfo: () => state.singerInfo,
    singerSongdata: () => state.singerSongdata,
    singerAlbumdata: () => state.singerAlbumdata,
    hotSingerSongList: () => state.hotSingerSongList
}

const actions = {
    async getSingerList({ commit }, paramsJson) {
        try {
            let jsondata = await singerService.getSingerList(paramsJson)
            // console.log(jsondata)
            let singerdata = {}
            let artists = jsondata.artist
            
            // singerdata.singerImgList = jsondata.artist.splice(0, 10)
            // singerdata.singerTxtList = jsondata.artist
            // 显示10张图
            singerdata.singerImgList = artists.filter(function(element, index) {
                return index < 10
            }, this)
            // 显示12张图
            singerdata.singerImgListBig = artists.filter(function(element, index) {
                return index < 12
            }, this)
            // 文字列表包含第11、12个数据
            singerdata.singerTxtListBig = artists.filter(function(element, index) {
                return index >= 10
            }, this)
            // 文字列表不包含第11、12个数据
            singerdata.singerTxtList = artists.filter(function(element, index) {
                return index >= 12
            }, this)
            singerdata.nums = jsondata.nums
            if(paramsJson.offset == 0) {
                singerdata.artist = jsondata.artist.slice(10)
            }else{
                singerdata.artist = jsondata.artist
            }
            commit(types.ALL_SINGER_LIST, singerdata)
        } catch (err) {

        }
    },
    async getSingerInfo({ commit }, paramsJson) {
        try {
            let jsondata = await singerService.getSingerInfo(paramsJson)
            commit(types.SINGER_INFO, jsondata)
        } catch (err) {

        }
    },
    async getSingerSonglist({ commit }, paramsJson) {
        try {
            const jsondata = await singerService.getSingerSonglist(paramsJson)
            paramsJson.offset = 0;
            paramsJson.limits = 1;
            const jsondata2 = await singerService.getSingerSonglist(paramsJson)
            let maxhot = jsondata2.songlist[0].hot
            let offset = paramsJson.offset
            let songdata = {}
            if (jsondata.error_code == 22000) {
                songdata.songlist = serviceCommon.computedSongHotLong(jsondata.songlist, maxhot)
                songdata.songnums = jsondata.songnums
                if (offset == 0) {
                    commit(types.HOT_SINGER_SONG_LIST, jsondata.songlist)
                }
            } else {
                router.push({ path: '/404/' })
            }
            commit(types.SINGER_SONG_LIST, songdata)
        } catch (err) {

        }
    },
    async getSingerAlbumList({ commit }, paramsJson) {
        try {
            const jsondata = await singerService.getSingerAlbumList(paramsJson)
            commit(types.SINGER_ALBUM_LIST, jsondata)

        } catch (err) {

        }
    }

}
const mutations = {
    [types.ALL_SINGER_LIST](state, singerdata) {
        state.singerList = singerdata
    },
    [types.SINGER_INFO](state, jsondata) {
        state.singerInfo = jsondata
    },
    [types.SINGER_SONG_LIST](state, songdata) {
        state.singerSongdata = songdata
    },
    [types.SINGER_ALBUM_LIST](state, albumdata) {
        state.singerAlbumdata = albumdata
    },
    [types.HOT_SINGER_SONG_LIST](state, songList) {
        state.hotSingerSongList = songList
    }
}
export default {
    state,
    getters,
    actions,
    mutations
}