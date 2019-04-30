import * as types from '../mutation-types'
import serviceCommon from 'service/common'
import bangdanService from 'service/bangdanService'

const state = {
    bangdanList: [],
    bangdanInfo: {}
}

const getters = {
    bangdanList: () => state.bangdanList,
    bangdanInfo: () => state.bangdanInfo
}

const actions = {
    async getBangdanList({ commit }) {
        try {
            const jsondata = await bangdanService.getBangdanList({ 'num': 4 })
            if (jsondata.error_code == 22000) {
                let bangdanList = jsondata.content
                commit(types.ALL_BANGDAN_LIST, bangdanList)
            }
        } catch (err) {

        }
    },
    async getBangdanInfo({ commit }, paramsJson) {
        try {
            let bangdanId = paramsJson.type
            const jsondata = await bangdanService.getBangdanInfo(paramsJson)
            let data = {}
            if (jsondata.error_code == 22000) {
                let bangdanInfo = jsondata.billboard
                if (bangdanInfo.billboard_songnum) {
                    let songnums = parseInt(bangdanInfo.billboard_songnum)
                    if (bangdanId == 1 && songnums > 100) { //新歌榜100 
                        songnums = 100
                    } else if (bangdanId == 2 && songnums > 500) { //热歌榜500
                        songnums = 500
                    } else if (songnums > 100) { //其他榜单最多100首
                        songnums = 100
                    }
                    bangdanInfo.billboard_songnum = songnums
                }
                data.billboard = bangdanInfo

                let songList = jsondata.song_list;
                songList.forEach((value, index) => {
                    songList[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id);
                })
                data.song_list = songList
                commit(types.BANGDAN_SONG_LIST, data)

            }
        } catch (err) {

        }
    }
}
const mutations = {
    [types.ALL_BANGDAN_LIST](state, bangdanList) {
        state.bangdanList = bangdanList
    },
    [types.BANGDAN_SONG_LIST](state, data) {
        state.bangdanInfo = data
    }
}
export default {
    state,
    getters,
    actions,
    mutations
}