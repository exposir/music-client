'use-strict'

//新歌上架
import * as types from '../mutation-types'
import constant from '../../constant.js'
import serviceCommon from '../../service/common'
import recommendService from '../../service/recommendService'

const state = {
    recommend_album_label: ['推荐', '华语', '欧美', '日韩', '付费专辑'], //新歌上架分类标签
    recommend_album_recent: [], //新歌上架近期热门
    recommend_album_more: [], //新歌上架更多推荐
    current_page: 0, //当前页面
    current_label: '', //当前标签页
    total_album_count: 0, //所有推荐专辑数量
}

const getters = {
    recommendAlbumLabel: () => state.recommend_album_label,
    recommendAlbumRecent: () => state.recommend_album_recent,
    recommendAlbumMore: () => state.recommend_album_more,
    recommendAlbumCount: () => state.total_album_count
}

const actions = {
    async getRecommendAlbumLabel({ commit, dispatch }) {
        try {
            const jsondata = await recommendService.getRecommendAlbumLabel()
            if (jsondata.error_code == 22000) {
                console.log(jsondata)
                let tags = jsondata.result.first_tag;
                let labels = [];
                for (let i = 0; i < tags.length; i++) {
                    let label = tags[i].tagname;
                    labels.push(label);
                }

                console.log(labels)
                commit(types.NEW_RECOMMEND_ALBUM_LABLES, labels);
            }

        } catch (err) {
            console.log(err)
        }
    },

    async getCurrentPageNewSongData({ commit, dispatch }, { page, label }) {
        try {
            let offset = page * 48;
            const jsondata = await recommendService.getRecommendAlbum({ 'type': 3, 'limit': 48, 'offset': offset, 'tagname': label })
            if (jsondata && jsondata.error_code == 22000) {
                console.log(jsondata);
                let album_list = jsondata.plaze_album_list.RM.album_list.list;
                for (let i = 0; i < album_list.length; i++) {
                    album_list[i].authorLinksArr = serviceCommon.getAuthorsLinksArr(album_list[i].author, album_list[i].all_artist_id)
                        // console.log(album_list[i].album_id)
                }
                let total_count = jsondata.plaze_album_list.RM.album_list.total;

                commit(types.NEW_RECOMMEND_ALBUM_DATA, { album_list, total_count, page, label });
            }
        } catch (err) {
            console.log(err);
        }
    },

    clearCurrentPageNewSongData({ commit }) {
        commit(types.CLEAR_NEW_RECOMMEND_ALBUM_DATA);
    }
}

const mutations = {
    [types.NEW_RECOMMEND_ALBUM_LABLES](state, labels) {
        state.recommend_album_label = labels;
    },
    [types.NEW_RECOMMEND_ALBUM_DATA](state, { album_list, total_count, page, label }) {
        // console.log(album_list)
        state.total_album_count = total_count;
        // console.log(state.total_album_count)
        state.current_page = page;
        state.current_label = label;
        state.recommend_album_recent = [];
        state.recommend_album_more = [];

        if (page == 0 && label == state.recommend_album_label[0]) {
            if (album_list.length > 32) {
                for (let i = 0; i < album_list.length; i++) {
                    if (i <= 31) {
                        state.recommend_album_recent.push(album_list[i]);
                    } else {
                        state.recommend_album_more.push(album_list[i]);
                    }
                }
            } else {
                state.recommend_album_recent = album_list;
                state.recommend_album_more = [];
            }
        } else {
            state.recommend_album_more = album_list;
        }
        // console.log(state.recommend_album_recent)
        // console.log(state.recommend_album_more)
    },
    [types.CLEAR_NEW_RECOMMEND_ALBUM_DATA]() {
        state.recommend_album_recent = [];
        state.recommend_album_more = [];
        state.total_album_count = 0;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}