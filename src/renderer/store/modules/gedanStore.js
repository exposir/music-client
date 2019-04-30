import * as types from '../mutation-types'
import constant from '../../constant.js'
import gedanService from '../../service/gedanService'
import serviceCommon from '../../service/common'
import commonFuns from '../../components/commonFuns/common.js'

const state = {
    channelList: [],
    gedanList: [],
    gedanList_pagenum: 0,
    gedanInfo: {},
    gedanBaseInfo: 0,
    gedanSongList: [],
    songListType: "self",
    songListId: "", //当前歌单ID,
    gedan_all_songlist: []
}


const getters = {
    channelList: () => state.channelList,
    gedanList: () => state.gedanList,
    gedanList_pagenum: () => state.gedanList_pagenum,
    gedanBaseInfo: () => state.gedanBaseInfo,
    gedanInfo: () => state.gedanInfo,
    gedanSongList: () => state.gedanSongList,
    songListType: () => state.songListType,
    songListId: () => state.songListId,
    gedan_all_songlist: () => state.gedan_all_songlist
}

const actions = {
    async getChannelList({ commit }) {
        try {
            const jsondata = await gedanService.getChannelList({})
            if (jsondata.error_code == 22000) {
                let channelList = jsondata.result
                commit(types.CHANNEL_LIST, channelList)
            }
        } catch (err) {

        }
    },
    async getGedanlist({ commit }, paramsJson) {
        try {
            const jsondata = await gedanService.getGendanList(paramsJson)
            if (jsondata.error_code == 22000) {
                let gedanList = jsondata
                commit(types.GEDAN_LIST, gedanList)
            }
        } catch (err) {

        }
    },
    //歌单 详情
    async getGedanInfo({ commit }, paramsJson) {
        try {
            const jsondata = await gedanService.getGedanBasicInfo(paramsJson)
            if (jsondata.error_code == 22000) {
                let gedanInfo = jsondata.result.info
                let gedanBaseInfo = jsondata.result
                commit(types.GEDAN_INFO, gedanInfo)
                commit(types.GEDAN_BASE_INFO, gedanBaseInfo)
            }
        } catch (err) {

        }
    },
    //歌单歌曲列表
    async getGedanSongList({ commit }, paramsJson) {
        try {
            const jsondata = await gedanService.getGedanSongList(paramsJson)
            if (jsondata.error_code == 22000) {
                let resultData = jsondata.result
                let songdata = []
                resultData.songList.forEach((value, index) => {
                    let authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                    value.authorLinksArr = authorLinksArr
                    songdata.push(value)
                })
                resultData.songList = songdata
                commit(types.GEDAN_SONG_LIST, resultData)
            }
        } catch (err) {

        }
    },
    async getGedanAllSongList({ commit, dispatch }, paramsJson) {
        let pageSize = 100,
            page = paramsJson.page ? paramsJson.page : 1,
            gedanAllSongList = paramsJson.gedanAllSongList ? paramsJson.gedanAllSongList : [],
            data = paramsJson.data,
            list_id = data.list_id
        let jsondata = await gedanService.getGedanSongList(data)

        if (!jsondata.result.have_more) { //没有更多了
            if (jsondata.result.list_num < pageSize) { //只有一页
                gedanAllSongList = jsondata.result.songList
            } else {
                gedanAllSongList = [].concat(gedanAllSongList, jsondata.result.songList)
            }
            gedanAllSongList.forEach((value, index) => {
                let authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                gedanAllSongList[index].authorLinksArr = authorLinksArr

            })
            commit(types.GEDAN_ALL_SONG_LIST, gedanAllSongList)
        } else {
            gedanAllSongList = [].concat(gedanAllSongList, jsondata.result.songList)
            page++
            let offset = (page - 1) * pageSize
            paramsJson = { 'data': { "list_id": list_id, "start": offset, "num": pageSize }, 'page': page, 'gedanAllSongList': gedanAllSongList }
            dispatch('getGedanAllSongList', paramsJson)
        }
        // if (Array.isArray(state.gedan_all_songlist) && state.gedan_all_songlist.length < 1) {

        // }
    },
    //添加歌曲到自建歌单
    async addSongsToList({ commit, dispatch }, paramsJson) {
        try {
            const jsondata = await gedanService.addListSongs(paramsJson)
            if (jsondata.error_code == 22000) {
                let paramsJson = {
                    'data': {
                        'list_id': state.songListId,
                        "start": 0,
                        "num": 100
                    }
                }
                commonFuns.createTips('添加成功', 'success');
            } else if (jsondata.error_code == 22707) {
                commonFuns.createTips('歌单歌曲数量已经超过500首,不能再添加', 'error');
            }
        } catch (err) {

        }
    },
    //删除自建歌单歌曲
    async delSongsFromList({ commit, dispatch, rootState }, paramsJson) {
        try {
            const jsondata = await gedanService.delListSongs(paramsJson)
            if (jsondata.error_code == 22000) {
                console.log('del songs success! res is: ' + JSON.stringify(paramsJson))
                let songids = paramsJson.song_ids;
                let array_ids = songids.split(',');
                commit(types.DEL_SONGS_FROM_DIY_LIST, array_ids);

                //同步的删除正在播放列表里面的歌曲
                let song = rootState.root_currentPlayingSong;
                let cur_id = commonFuns.getSongId(song);
                let cur_list_id = "";
                if (song.hasOwnProperty('listid')) {
                    cur_list_id = song.listid;
                }

                let listid = paramsJson.list_id;
                let isSwitchPlaying = false;
                let idArrs = array_ids;
                let fromList = cur_list_id;
                for (let i = 0; i < array_ids.length; i++) {
                    let id = array_ids[i];
                    if (cur_list_id == listid && cur_id == id) {
                        isSwitchPlaying = true;
                        break;
                    }
                }
                dispatch('deleteCurrentPlaylistSongsByID', { idArrs, fromList, isSwitchPlaying });
            }
        } catch (err) {

        }
    },
    //更新歌单的类型和ID
    updateSongListInfo({ commit, dispatch }, paramsJson) {
        commit(types.UPDATE_SONGLIST_INFO, paramsJson);
    },
    emptySonglist({ commit, dispatch }) {
        commit(types.EMPTY_SONG_LIST);
    },
    getAllSongInfo({ commit, dispatch }, paramsJson) {
        let list_id = paramsJson.list_id;
        let list_type = paramsJson.list_type;

        if (list_type == 'self') {
            // paramsJson.songs = state.gedan_all_songlist;
            for (let i = 0; i < state.gedan_all_songlist.length; i++) {
                paramsJson.songs.push(state.gedan_all_songlist[i])
            }
        } else {
            // paramsJson.songs = state.gedanSongList.songList;
            for (let i = 0; i < state.gedanSongList.songList.length; i++) {
                paramsJson.songs.push(state.gedanSongList.songList[i])
            }
        }
        // console.log(paramsJson.songs[0].title)
    }
}

const mutations = {
    [types.GEDAN_LIST](state, gedanList) {
        state.gedanList = gedanList
    },
    [types.CHANNEL_LIST](state, channelList) {
        state.channelList = channelList
    },
    [types.GEDAN_INFO](state, gedanInfo) {
        state.gedanInfo = gedanInfo
    },
    [types.GEDAN_BASE_INFO](state, gedanBaseInfo) {
        state.gedanBaseInfo = gedanBaseInfo
    },
    [types.GEDAN_SONG_LIST](state, resultData) {
        state.gedanSongList = resultData
    },
    [types.UPDATE_SONGLIST_INFO](state, paramsJson) {
        state.songListType = paramsJson.list_type;
        state.songListId = paramsJson.list_id;
    },
    [types.DEL_SONGS_FROM_DIY_LIST](state, songids) {
        for (let i = 0; i < songids.length; i++) {
            let id = songids[i];
            for (let k = 0; k < state.gedan_all_songlist.length; k++) {
                let song = state.gedan_all_songlist[k];
                let songid = commonFuns.getSongId(song);

                if (id === songid) {
                    state.gedan_all_songlist.splice(k, 1);
                    break;
                }
            }
        }
    },
    [types.GEDAN_ALL_SONG_LIST](state, gedanAllSongList) {
        state.gedan_all_songlist = gedanAllSongList
    },
    [types.EMPTY_SONG_LIST](state) {
        if (state.gedan_all_songlist && state.gedan_all_songlist.length > 0) {
            state.gedan_all_songlist.splice(0, state.gedan_all_songlist.length);
        }

        if (state.gedanSongList && state.gedanSongList.songList && state.gedanSongList.songList.length > 0) {
            state.gedanSongList.songList.splice(0, state.gedanSongList.songList.length);
        }

    }
}

export default {
    state,
    getters,
    actions,
    mutations
}