import * as types from '../mutation-types'
import constant from '../../constant.js'
import serviceCommon from '../../service/common'
import searchService from '../../service/searchService'
import settings from '../../dataoperation/settings/settings'
import settingKey from '../../dataoperation/settings/settingsKey'
import underscore from 'underscore'
import dataBase from '../../dataoperation/websql/sqlstorage'
//initial state
const state = {
    keyword: "",
    search_list: {},
    search_num: {},
    loadding: true,
    search_history: {},
    sug_online_list: {},
    sug_local_list: []
}

const getters = {
    keyword: () => state.keyword,
    search_list: () => state.search_list,
    search_num: () => state.search_num,
    loadding: () => state.loadding,
    search_history: () => state.search_history,
    sug_online_list: () => state.sug_online_list,
    sug_local_list: () => state.sug_local_list
}

const actions = {
    getKeyWord({ commit }) {
        let keyword = settings.get_setting_value('search_keyword')
        commit(types.KEYWORD, keyword)
    },
    setKeyword({ commit }, keyword) {
        keyword = keyword ? keyword : ""
        settings.set_setting_value('search_keyword', keyword)
        commit(types.KEYWORD, keyword)
    },
    setLoadding({ commit }, isLoading) {
        commit(types.SEARCH_LOADDING, isLoading)
    },
    //检索线上 歌曲、歌手、专辑
    async getSugOnlineList({ commit }, paramsJson = { "query": "" }) {
        let query = paramsJson.query
        let sugList = {},
            songList = [],
            artistList = [],
            albumList = []
        try {
            const jsondata = await searchService.suggestion({ "query": query })
            if (jsondata.error_code == 22000) {
                songList = jsondata.song ? jsondata.song.slice(0, 4) : []
                artistList = jsondata.artist ? jsondata.artist.slice(0, 2) : []
                albumList = jsondata.album ? jsondata.album.slice(0, 2) : []
            }
            sugList = { "songList": songList, "artistList": artistList, 'albumList': albumList }
            commit(types.SUG_ONLINE_LIST, sugList)
        } catch (err) {

        }
    },
    getSugLocalSongList({ commit }, paramsJson = { "query": "", "limit": 4 }) {
        let query = paramsJson.query
        let limit = paramsJson.limit ? paramsJson.limit : 4
        let local_songlist_id = constant.local_songlist_id
        let history_list_id = constant.history_list_id
        let downloaded_songlist_id = constant.downloaded_songlist_id

        let search_songs = []
        dataBase.query_by_name(local_songlist_id, query, (local_songlist_id, jsondata) => {
            for (let i = 0; i < jsondata.length; i++) {
                if (i >= limit) {
                    break
                }
                jsondata[i].listid = local_songlist_id;
                // console.log(jsondata[i])
                search_songs.push(jsondata[i]);
            }
            if (search_songs.length < limit) {
                dataBase.query_by_name(history_list_id, query, (history_list_id, jsondata) => {
                    for (let k = 0; k < jsondata.length; k++) {
                        if (search_songs.length >= limit) {
                            break;
                        }
                        jsondata[k].listid = history_list_id;
                        // console.log(jsondata[k])
                        search_songs.push(jsondata[k]);
                    }

                })

                if (search_songs.length < limit) {
                    dataBase.query_by_name(downloaded_songlist_id, query, (downloaded_songlist_id, jsondata) => {
                        for (let k = 0; k < jsondata.length; k++) {
                            if (search_songs.length >= limit) {
                                break;
                            }
                            jsondata[k].listid = downloaded_songlist_id
                                // console.log(jsondata[k])
                            search_songs.push(jsondata[k]);
                        }
                        commit(types.SUG_LOCAL_SONG_LIST, search_songs)
                    })

                } else {
                    commit(types.SUG_LOCAL_SONG_LIST, search_songs)
                }

            } else {
                commit(types.SUG_LOCAL_SONG_LIST, search_songs)
            }

        })
    },
    setSearchHistory({ commit }, search_keyword) {
        let search_history_json = JSON.parse(settings.get_setting_value('search_history'))
            //搜索历史 list 去重
        let search_history_list = search_history_json.list
        search_history_list.unshift(search_keyword)
        search_history_list = underscore.uniq(search_history_list)

        //搜索历史数组 不超过10
        search_history_json.list = search_history_list.slice(0, 10)
        commit(types.SEARCH_HISTORY, search_history_json)
            //写入storage
        search_history_json = JSON.stringify(search_history_json)
        settings.set_setting_value('search_history', search_history_json)
    },
    getSearchHistory({ commit }) {
        let search_history_json = settings.get_setting_value('search_history')
        let default_value = JSON.stringify({ "list": [] })
        if (!search_history_json) {
            settings.set_setting_value('search_history', default_value)
        }
        //写入state
        search_history_json = JSON.parse(search_history_json)
        commit(types.SEARCH_HISTORY, search_history_json)

    },
    clearSearchHistory({ commit }) {
        let default_value = JSON.stringify({ "list": [] })
        settings.set_setting_value('search_history', default_value)
    },
    async getSearchResult({ commit, dispatch }, paramsJson) {
        // dispatch('setLoadding', true)
        try {
            paramsJson = Object.assign({ "isNew": 1 }, paramsJson)
            const jsondata = await searchService.searchMerge(paramsJson)
            if (jsondata.error_code == 22000) {
                let searchdata = jsondata.result
                let songList_total = searchdata.song_info && searchdata.song_info.total > 1000 ? 1000 : searchdata.song_info.total
                let albumList_total = searchdata.album_info && searchdata.album_info.total > 1000 ? 1000 : searchdata.album_info.total
                let gedanList_total = searchdata.playlist_info && searchdata.playlist_info.total > 1000 ? 1000 : searchdata.playlist_info.total
                let singerList_total = searchdata.artist_info && searchdata.artist_info.total > 1000 ? 1000 : searchdata.artist_info.total

                let songList = searchdata.song_info && searchdata.song_info.song_list ? searchdata.song_info.song_list : []
                let albumList = searchdata.album_info && searchdata.album_info.album_list ? searchdata.album_info.album_list : []
                let gedanList = searchdata.playlist_info.play_list ? searchdata.playlist_info.play_list : []
                let singerList = searchdata.artist_info && searchdata.artist_info.artist_list ? searchdata.artist_info.artist_list : []

                let songdata = []
                songList.forEach((value, index) => {
                    value.authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                    songdata.push(value)
                })

                let albumdata = []
                albumList.forEach((value, index) => {
                    value.authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                    albumdata.push(value)
                })

                let search_list = {
                    "song_info": {
                        "song_list": songdata,
                        "total": songList_total
                    },
                    "album_info": {
                        "album_list": albumdata,
                        "total": albumList_total
                    },
                    "playlist_info": {
                        "play_list": gedanList,
                        "total": gedanList_total
                    },
                    "artist_info": {
                        "artist_list": singerList,
                        "total": singerList_total
                    }
                }
                commit(types.SEARCH_LIST, search_list)
                    //dispatch('setLoadding', false)
            }
        } catch (err) {

        }
    },

    //总数 不会根据传的参数page_no 而变化
    async getSearchNum({ commit }, paramsJson) {
        let search_num = {
            "song_total": 0,
            "album_total": 0,
            "gedan_total": 0,
            "singer_total": 0
        }
        try {
            const jsondata = await searchService.searchMerge(paramsJson)
            if (jsondata.error_code == 22000) {
                let result = jsondata.result
                if (result.song_info) { //歌曲
                    let song_total = result.song_info.total
                    search_num.song_total = song_total
                }
                if (result.album_info) { //专辑
                    let album_total = result.album_info.total
                    search_num.album_total = album_total
                }
                if (result.playlist_info) { //歌单
                    let gedan_total = result.playlist_info.total
                    search_num.gedan_total = gedan_total
                }
                if (result.artist_info) {
                    let singer_total = result.artist_info.total
                    search_num.singer_total = singer_total

                }
                commit(types.SEARCH_NUM, search_num)
            }
        } catch (err) {

        }
    }
}

const mutations = {
    [types.KEYWORD](state, keyword) {
        state.keyword = keyword;
    },
    [types.SEARCH_NUM](state, search_num) {
        state.search_num = search_num;
    },
    [types.SEARCH_LIST](state, search_list) {
        state.search_list = search_list;
    },
    [types.SEARCH_LOADDING](state, isLoading) {
        state.loadding = isLoading
    },
    [types.SEARCH_HISTORY](state, search_history_json) {
        state.search_history = search_history_json
    },
    [types.SUG_ONLINE_LIST](state, sug_list) {
        state.sug_online_list = sug_list
    },
    [types.SUG_LOCAL_SONG_LIST](state, search_songs) {
        state.sug_local_list = search_songs
            // console.log(search_songs)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}