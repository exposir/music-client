'use-strict'
import * as types from '../mutation-types'
import dataBase from '../../dataoperation/websql/sqlstorage'
import constant from '../../constant.js'
import serviceCommon from '../../service/common'
import commonFuns from '../../components/commonFuns/common.js'

//该文件封装所有播放历史相关的逻辑和数据
const state = {
    history_songlist: [], //播放历史
    currentpage_history_songlist: [], //当前页的数据
    current_history_page: -1, //当前页
    history_playing_index: -1, //播放历史歌单中当前正在播放的歌曲索引
}

const getters = {
    historySonglist: () => state.history_songlist,
    currentPageHistorySonglist: () => state.currentpage_history_songlist,
    historyPlayingIndex: () => state.history_playing_index,
}

const actions = {
    getHistoryList({ commit, dispatch, rootState }) {
        if (state.history_songlist.length <= 0) {
            dataBase.query_all(constant.history_list_id, function(listid, songArray) {
                if (Array.isArray(songArray)) {
                    commit(types.GET_HISTORY_SONG_LIST, songArray);
                    dispatch('getCurrentPageHistoryData', 0);
                }
            })
        }
    },
    getCurrentPageHistoryData({ commit, dispatch }, page) {
        let index = page * constant.maxItemCountPerPage;
        if (index >= state.history_songlist.length) {
            return;
        }

        let endIndex = index + constant.maxItemCountPerPage;
        if (endIndex >= state.history_songlist.length) {
            endIndex = state.history_songlist.length;
        }

        let songlist = [];
        for (let i = index; i < endIndex; i++) {
            songlist.push(state.history_songlist[i]);
        }
        commit(types.UPDATE_HISTORY_CURRENTPAGE_DATA, { songlist, page });

        if (page == 0) {
            dispatch('updateHistoryPlayingIndex');
        } else {
            commit(types.UPDATE_HISTORY_LIST_PLAYING_INDEX, -1);
        }
    },
    updateHistoryPlayingIndex({ commit, dispatch, rootState }) {
        // console.log('updateHistoryPlayingIndex list id= ' + rootState.root_currentPlayingSong.listid);
        let song = rootState.root_currentPlayingSong;
        let playing_index = -1;

        if (typeof song != 'undefined' && song.hasOwnProperty('listid')) {
            const listid = song.listid;
            const songid = commonFuns.getSongId(song);

            //console.log(JSON.stringify(song));
            if (listid === constant.history_list_id && state.currentpage_history_songlist.length > 0) {
                //由于播放历史的特殊性，正在播放的永远会是弟一个
                let curpage_songid = commonFuns.getSongId(state.currentpage_history_songlist[0]);
                if (songid == curpage_songid) {
                    playing_index = 0;
                }
            }
        }

        //console.log('current playing index is: '+ playing_index);
        commit(types.UPDATE_HISTORY_LIST_PLAYING_INDEX, playing_index);
    },
    setHistoryPlayingIndex({ commit }, index) {
        commit(types.UPDATE_HISTORY_LIST_PLAYING_INDEX, index);
    },
    insertSongToHistory({ commit, dispatch, rootState }, songinfo) {
        const listid = constant.history_list_id;
        console.log('insert into history list id is: ' + songinfo.listid);
        if (songinfo.hasOwnProperty('listid') && songinfo.listid == listid) {
            dispatch('setHistoryPlayingIndex', 0);
        }
        let songids = [];
        let cur_id = commonFuns.getSongId(songinfo)
        songids.push(cur_id);
        //首先删除该歌曲，然后再添加

        dataBase.delete_by_songid(listid, songids);
        //更新本地保存的列表
        //这里这么做是为了避免那个有时候很无语的异步问题
        dataBase.query_all(listid, function(listid, songArray) {
            if (Array.isArray(songArray)) {
                if (songArray.length >= constant.maxHistoryListSongCount) {
                    let del_songinfo = songArray.shift();
                    let del_songids = [];
                    let del_id = commonFuns.getSongId(del_songinfo);
                    del_songids.push(del_id);
                    dataBase.delete_by_songid(listid, del_songids);
                }

                //修改listid同时不影响传进来的对象
                let json_str = JSON.stringify(songinfo);
                let obj = JSON.parse(json_str);
                obj.listid = listid;

                songArray.push(obj);
                commit(types.GET_HISTORY_SONG_LIST, songArray);

                let insert_arr = [];
                insert_arr.push(obj);
                dataBase.insert_songinfo(listid, insert_arr, function(ret) {
                    if (ret) {
                        dispatch('getCurrentPageHistoryData', state.current_history_page);
                        // console.log('after insert to history listid is: ' + songinfo.listid);
                    }
                });
            }
        })
    },
    deleteHistorySongs({ commit, dispatch, rootState }, indexArrs) {
        if (indexArrs.length <= 0) {
            return;
        }

        // console.log(indexArrs);
        let del_idArrs = [];
        for (let i = 0; i < indexArrs.length; i++) {
            let index = indexArrs[i];
            let obj = state.history_songlist[index];
            let id = commonFuns.getSongId(obj);

            // console.log('del index is: ' + index + ' title is: ' + obj.title);
            del_idArrs.push(id);
        }

        let bSwitchCurrentSong = false;
        let cur_playing_id = commonFuns.getSongId(rootState.root_currentPlayingSong);
        dataBase.delete_by_songid(constant.history_list_id, del_idArrs, function(del) {
            // console.log(del);
            // console.log(state.history_playing_index);
            if (state.history_playing_index >= 0 && del.indexOf(cur_playing_id) > -1) {
                bSwitchCurrentSong = true;
                // console.log('we need to switch songs');
            }
            commit(types.DELETE_FROM_HISTORY_SONG_LIST, del);

            dispatch('getCurrentPageHistoryData', state.current_history_page);

            //同步的删除正在播放列表里面的歌曲
            let idArrs = del;
            let fromList = constant.history_list_id;
            let isSwitchPlaying = bSwitchCurrentSong;
            dispatch('deleteCurrentPlaylistSongsByID', { idArrs, fromList, isSwitchPlaying });
        });
    },
    updatehistorysongduration({ commit, dispatch }, song) {
        let songid = commonFuns.getSongId(song);
        dataBase.update_by_songid(constant.history_list_id, songid, song);
        commit(types.UPDATE_HISTORY_SONG_DURATION, song);
    }
}

const mutations = {
    [types.GET_HISTORY_SONG_LIST](state, songArray) {
        let history = [];
        let len = songArray.length - 1;
        for (let i = len; i >= 0; i--) {
            let songinfo = songArray[i];
            if (!songinfo.hasOwnProperty("authorLinksArr") && songinfo.hasOwnProperty('author') && songinfo.hasOwnProperty('all_artist_id')) {
                let authorLinksArr = serviceCommon.getAuthorsLinksArr(songinfo.author, songinfo.all_artist_id)
                songinfo.authorLinksArr = authorLinksArr
            }

            if (!songinfo.authorLinksArr) {
                songinfo.authorLinksArr = [];
            }
            history.push(songinfo);
        }
        state.history_songlist = history;
    },
    [types.UPDATE_HISTORY_LIST_PLAYING_INDEX](state, playing_index) {
        state.history_playing_index = playing_index;
    },
    [types.UPDATE_HISTORY_SONG_DURATION](state, song) {
        let cur_id = commonFuns.getSongId(song);
        for (let i = 0; i < state.history_songlist.length; i++) {
            let songid = commonFuns.getSongId(state.history_songlist[i])
            if (songid == cur_id) {
                let Json_str = JSON.stringify(song);
                let obj = JSON.parse(Json_str);
                obj.listid = constant.history_list_id;
                // console.log(song.song_duration);
                state.history_songlist[i] = obj;
                break
            }
        }
        let empty_array = [];
        state.history_songlist = state.history_songlist.concat(empty_array);
    },
    [types.DELETE_FROM_HISTORY_SONG_LIST](state, del_ids) {
        for (let i = 0; i < del_ids.length; i++) {
            let id = del_ids[i];
            for (let k = 0; k < state.history_songlist.length; k++) {
                let songid = commonFuns.getSongId(state.history_songlist[k])
                if (id == songid) {
                    state.history_songlist.splice(k, 1);
                }
            }
        }
    },
    [types.UPDATE_HISTORY_CURRENTPAGE_DATA](state, { songlist, page }) {
        state.currentpage_history_songlist = songlist;
        state.current_history_page = page;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}