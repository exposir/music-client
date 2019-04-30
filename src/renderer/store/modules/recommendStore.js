import * as types from '../mutation-types'
import constant from '../../constant.js'
import serviceCommon from '../../service/common'
import recommendService from '../../service/recommendService'

const state = {
    recomAlbumlist: [],
    newBangdanList: [],
    hotBangdanList: [],
    recomGedanlist: [],
    recomMvlist: [],
    recomDailyList: [],
    recomDailyList_2: [],
    recomDailyList_3: [],
    jxGedanList: []
}

const getters = {
    recomAlbumlist: () => state.recomAlbumlist,
    newBangdanList: () => state.newBangdanList,
    hotBangdanList: () => state.hotBangdanList,
    recomGedanlist: () => state.recomGedanlist,
    recomMvlist: () => state.recomMvlist,
    recomDailyList: () => state.recomDailyList,
    recomDailyList_2: () => state.recomDailyList_2,
    recomDailyList_3: () => state.recomDailyList_3,
    jxGedanList: () => state.jxGedanList
}

const actions = {
    async getRecommendAlbum({ commit }) {
        try {
            const jsondata = await recommendService.getRecommendAlbum({ 'type': 3, 'limit': 20 })
            if (jsondata.error_code == 22000) {
                let recomAlbumlist = jsondata.plaze_album_list.RM.album_list.list

                recomAlbumlist = recomAlbumlist.slice(0, 12)
                recomAlbumlist.forEach((value, index) => {
                    recomAlbumlist[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                })
                commit(types.INDEX_RECOMMEND_ALBUM_LIST, recomAlbumlist)
            }

        } catch (err) {
            console.log(err)
        }

    },
    getNewRecBangdanList({ commit, dispatch }) {
        dispatch('getRecommendBangdan', { 'type': 1, 'size': 8 })
    },
    getHotRecBangdanList({ commit, dispatch }) {
        dispatch('getRecommendBangdan', { 'type': 2, 'size': 8 })
    },
    async getRecommendGedan({ commit }) {
        try {
            const jsondata = await recommendService.getRecommendGedan({ 'num': 12 })
            if (jsondata.error_code == 22000) {
                let recomGedanlist = jsondata.content;
                recomGedanlist.forEach((value, index) => {
                        recomGedanlist[index].listen_num = value.listenum
                    })
                    // console.log(recomGedanlist)
                commit(types.INDEX_RECOMMEND_GEDAN_LIST, recomGedanlist)
            }
        } catch (err) {

        }
    },
    async getRecommendBangdan({ commit }, paramsJson) {
        let type = paramsJson.type ? paramsJson.type : 1
        try {
            const jsondata = await recommendService.getRecommendBangdan(paramsJson)
            if (jsondata.error_code == 22000) {
                let songList = jsondata.song_list
                songList.forEach((value, index) => {
                    songList[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                })
                if (type === 1) {
                    commit(types.INDEX_RECOMMEND_NEW_BANGDAN_LIST, songList)
                } else if (type === 2) {
                    commit(types.INDEX_RECOMMEND_HOT_BANGDAN_LIST, songList)
                }
            }

        } catch (err) {

        }

    },
    async getRecommendMv({ commit }) {
        try {
            const jsondata = await recommendService.getRecommendMV({ 'version': 'music' })
            if (jsondata.error_code == 22000) {
                let recomMvlist = jsondata.result.mv.slice(0, 12);
                recomMvlist.forEach((value, index) => {
                    recomMvlist[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                })
                commit(types.INDEX_RECOMMEND_MV_LIST, recomMvlist)
            }
        } catch (err) {

        }
    },
    async getRecommendDaily({ commit }, paramsJson) {
        try {
            const jsondata = await recommendService.getRecommendDaily(paramsJson)
            if (jsondata.error_code == 22000) {
                let recomDailyList = jsondata.result.list;
                recomDailyList.forEach((value, index) => {
                    recomDailyList[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                })
                commit(types.INDEX_RECOMMEND_DAILY_LIST, recomDailyList.slice(0, 10))
                commit(types.INDEX_RECOMMEND_DAILY_LIST_2, recomDailyList.slice(10, 20))
                commit(types.INDEX_RECOMMEND_DAILY_LIST_3, recomDailyList.slice(20, 30))
            }
        } catch (err) {

        }
    },
    async getJXGedan({ commit }, paramsJson) {
        try {
            const jsondata = await recommendService.getJXGedan({ 'list_id': '549371869', 'withcount': '1' })
            if (jsondata.error_code == 22000) {
                let jxGedanList = jsondata.result.info
                jxGedanList.listen_num = jsondata.result.listen_num
                commit(types.INDEX_RECOMMEND_JXGEDAN_LIST, jxGedanList)
            }
        } catch (err) {

        }
    }
}
const mutations = {
    [types.INDEX_RECOMMEND_ALBUM_LIST](state, recomAlbumlist) {
        state.recomAlbumlist = recomAlbumlist
    },
    [types.INDEX_RECOMMEND_NEW_BANGDAN_LIST](state, songList) {
        state.newBangdanList = songList
    },
    [types.INDEX_RECOMMEND_HOT_BANGDAN_LIST](state, songList) {
        state.hotBangdanList = songList
    },
    [types.INDEX_RECOMMEND_GEDAN_LIST](state, recomGedanlist) {
        state.recomGedanlist = recomGedanlist
    },
    [types.INDEX_RECOMMEND_MV_LIST](state, recomMvlist) {
        state.recomMvlist = recomMvlist
    },
    [types.INDEX_RECOMMEND_DAILY_LIST](state, recomDailyList) {
        state.recomDailyList = recomDailyList
    },
    [types.INDEX_RECOMMEND_DAILY_LIST_2](state, recomDailyList_2) {
        state.recomDailyList_2 = recomDailyList_2
    },
    [types.INDEX_RECOMMEND_DAILY_LIST_3](state, recomDailyList_3) {
        state.recomDailyList_3 = recomDailyList_3
    },
    [types.INDEX_RECOMMEND_JXGEDAN_LIST](state, jxGedanList) {
        state.jxGedanList = jxGedanList
    }
}
export default {
    state,
    getters,
    actions,
    mutations
}