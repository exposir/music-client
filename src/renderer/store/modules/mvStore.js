import * as types from '../mutation-types'
import serviceCommon from '../../service/common'
import mvRecommendService from '../../service/mvRecommendService'
import { stat } from 'fs';

const state = {
    mvRecommend: {
        recommFocusImages: [],
        recommList: [],
        recommBigman: [],
        recommReplay: []
    },
    mvBigMan: {
        mvBigManList: [],
        total: null
    },
    mvReplay: {
        mvReplayList: [],
        total: null
    },
    mvList: {
        mvSearchList: [],
        total: null
    }
}

const getters = {
    mvRecommend: () => state.mvRecommend,
    mvBigMan: () => state.mvBigMan,
    mvReplay: () => state.mvReplay,
    mvList: () => state.mvList
}

const actions = {
    async getMVRecommendFocus({ commit }) {
        try {
            const jsondata = await mvRecommendService.getMVRecommendFocus({ 'column_id': 1 })
            if (jsondata.error_code == 22000) {
                let mvRecommend = jsondata;
                commit(types.MV_RECOMMEND_LIST, mvRecommend)
            }
        } catch (err) {
            console.log(err)
        }
    },
    async getBigManList({ commit }, paramsJson) {
        try {
            const jsondata = await mvRecommendService.getRecommMV(paramsJson)
            if (jsondata.error_code == 22000) {
                let mvBigMan = jsondata.result;
                commit(types.MV_BIGMAN_LIST, mvBigMan)
            }
        } catch (err) {
            console.log(err)
        }
    },
    async getReplayList({ commit }, paramsJson) {
        try {
            const jsondata = await mvRecommendService.getRecommMV(paramsJson)
            if (jsondata.error_code == 22000) {
                let mvReplay = jsondata.result;
                commit(types.MV_REPLAY_LIST, mvReplay)
            }
        } catch (err) {
            console.log(err)
        }
    },
    async getSearchList({ commit }, paramsJson) {
        // console.log(paramsJson)
        try {
            const jsondata = await mvRecommendService.getSearchMV(paramsJson)
                // console.log(jsondata)
            if (jsondata.error_code == 22000) {
                let mvList = jsondata.result;
                commit(types.MV_SEARCH_LIST, mvList)
            }
        } catch (err) {
            console.log(err)
        }
    }
}

const mutations = {
    [types.MV_RECOMMEND_LIST](state, mvRecommend) {
        state.mvRecommend.recommFocusImages = mvRecommend.modules[0],
            state.mvRecommend.recommList = mvRecommend.modules[1],
            state.mvRecommend.recommBigman = mvRecommend.modules[2],
            state.mvRecommend.recommReplay = mvRecommend.modules[3]
    },
    [types.MV_BIGMAN_LIST](state, mvBigMan) {
        state.mvBigMan.total = mvBigMan.total,
            state.mvBigMan.mvBigManList = mvBigMan.mv_list
    },
    [types.MV_REPLAY_LIST](state, mvReplay) {
        state.mvReplay.total = mvReplay.total,
            state.mvReplay.mvReplayList = mvReplay.mv_list
    },
    [types.MV_SEARCH_LIST](state, mvList) {
        state.mvList.mvSearchList = mvList.mv_list
        state.mvList.total = mvList.total
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}