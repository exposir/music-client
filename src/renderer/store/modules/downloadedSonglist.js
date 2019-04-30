'use-strict'
import * as types from '../mutation-types'
import dataBase from '../../dataoperation/websql/sqlstorage'
import constant from '../../constant.js'
import serviceCommon from '../../service/common'
import commonFuns from '../../components/commonFuns/common.js'

const path = require('path')
const fs = require('fs')

const state = {
    downloaded_songlist: [],
    downloaded_list_initialized: false,
    downloaded_list_playing_index: -1,
    currentpage_downloaded_songlist: [], //当前页已下载歌曲
    currentpage: 0, //当前页
}

const getters = {
    downloadedSonglist: () => state.downloaded_songlist,
    currentpageDownloadedSonglist: () => state.currentpage_downloaded_songlist,
    downloadedListPlayingIndex: () => state.downloaded_list_playing_index,
}

const actions = {
    getDownloadedSonglist({ commit, dispatch, rootState }) {
        if (!state.downloaded_list_initialized) {
            // dataBase.delete_songlist(constant.downloaded_songlist_id);
            dataBase.query_all(constant.downloaded_songlist_id, function(listid, songArray) {
                if (Array.isArray(songArray)) {
                    let new_arr = [];
                    for (let i = 0; i < songArray.length; i++) {
                        let json_str = JSON.stringify(songArray[i]);
                        // console.log('getDownloadedSonglist called song is: ' + json_str);
                        let song = JSON.parse(json_str);
                        song.listid = constant.downloaded_songlist_id;
                        let authorLinksArr = serviceCommon.getAuthorsLinksArr(song.author, song.all_artist_id)
                            // console.log(authorLinksArr);
                            // for (let i = 0; i < authorLinksArr.length; i++) {
                            //     let item = authorLinksArr[i];
                            //     console.log('downloaded artist name is: ' + item.artist_name + ' artist id is: ' + item.artist_id)
                            // }
                        song.authorLinksArr = authorLinksArr
                        if (!song.authorLinksArr) {
                            song.authorLinksArr = [];
                        }
                        new_arr.push(song);
                    }
                    commit(types.GET_DOWNLOADED_LIST, new_arr);
                    dispatch('getCurrentPageDownloadedData', 0);
                }
            })
        }
    },

    getCurrentPageDownloadedData({ commit, dispatch }, page) {
        let index = page * constant.maxItemCountPerPage;
        if (index >= state.downloaded_songlist.length) {
            return;
        }

        let endIndex = index + constant.maxItemCountPerPage;
        if (endIndex >= state.downloaded_songlist.length) {
            endIndex = state.downloaded_songlist.length;
        }
        // console.log(index);
        // console.log(endIndex)
        // console.log(state.downloaded_songlist)

        let songlist = [];
        for (let i = index; i < endIndex; i++) {
            songlist.push(state.downloaded_songlist[i]);
        }
        commit(types.UPDATE_CURRENTPAGE_DOWNLOADED_DATA, { songlist, page });
        // console.log(songlist)

        dispatch('updateDownloadedSonglistPlayingIndex');
    },

    setDownloadSonglistPlayingIndex({ commit, dispatch }, index) {
        commit(types.UPDATE_DOWNLOADED_LIST_PLAYING_INDEX, index);
    },

    updateDownloadedSonglistPlayingIndex({ commit, rootState }) {
        let playing_index = -1;
        if (rootState.root_currentPlayingSong && rootState.root_currentPlayingSong.hasOwnProperty('listid')) {
            const listid = rootState.root_currentPlayingSong.listid;
            const songid = commonFuns.getSongId(rootState.root_currentPlayingSong)

            if (listid == constant.downloaded_songlist_id) {
                for (let i = 0; i < state.currentpage_downloaded_songlist.length; i++) {
                    const song_in_list = state.currentpage_downloaded_songlist[i];
                    let cur_id = commonFuns.getSongId(song_in_list);
                    if (cur_id == songid) {
                        playing_index = i;
                        break;
                    }
                }
            }
        }

        commit(types.UPDATE_DOWNLOADED_LIST_PLAYING_INDEX, playing_index);
    },

    isSongDownloaded({ commit, dispatch }, param) {
        let song = param.song;
        let songid = commonFuns.getSongId(song);

        let isDownloaded = false;
        for (let i = 0; i < state.downloaded_songlist.length; i++) {
            let id = commonFuns.getSongId(state.downloaded_songlist[i]);
            if (id == songid) {
                isDownloaded = true;
                param.isDownloaded = isDownloaded;
                param.dt = state.downloaded_songlist[i].dt;
            }
        }
    },

    addSongToDownloadedList({ commit, dispatch }, song) {
        if (!state.downloaded_list_initialized) {
            dispatch('getDownloadedSonglist');
        }
        let songArray = [];
        let json = JSON.stringify(song);
        let new_obj = JSON.parse(json);
        // console.log('add to downloaded is: ' + json)
        // let authorLinksArr = serviceCommon.getAuthorsLinksArr(new_obj.author, new_obj.all_artist_id)
        // new_obj.authorLinksArr = authorLinksArr
        // if (!new_obj.authorLinksArr) {
        //     new_obj.authorLinksArr = [];
        // }
        songArray.push(new_obj);

        let array_id = [];
        let songid = commonFuns.getSongId(new_obj);
        array_id.push(songid);

        let param = { 'song': new_obj, 'isDownloaded': false, 'dt': '' };
        dispatch('isSongDownloaded', param);
        if (param.isDownloaded) {
            console.log('song ' + song.title + ' already downloaded, need to delete it')
            dataBase.delete_by_songid(constant.downloaded_songlist_id, array_id, function(del) {
                if (del.length == 1 && del[0] == songid) {
                    dataBase.insert_songinfo(constant.downloaded_songlist_id, songArray, function(ret) {
                        if (ret) {
                            commit(types.ADD_DWONLOADED_ITEM, new_obj);
                            dispatch('getCurrentPageDownloadedData', state.currentpage);
                        }
                    });
                }
            })
        } else {
            dataBase.insert_songinfo(constant.downloaded_songlist_id, songArray, function(ret) {
                if (ret) {
                    commit(types.ADD_DWONLOADED_ITEM, new_obj);
                    // console.log(new_obj)
                    dispatch('getCurrentPageDownloadedData', state.currentpage);
                }
            });
        }
    },

    delSongsFromDownloadedList({ commit, dispatch, rootState }, params) {
        if (params.indexArray.length <= 0) {
            return;
        }

        let del_idArrs = [];
        for (let i = 0; i < params.indexArray.length; i++) {
            let index = params.indexArray[i];
            let obj = state.downloaded_songlist[index];
            let id = commonFuns.getSongId(obj);

            del_idArrs.push(id);
        }
        // console.log(del_idArrs);

        let bSwitchCurrentSong = false;
        console.log('begin to delete from downloaded list...............')
        dataBase.delete_by_songid(constant.downloaded_songlist_id, del_idArrs, function(del) {
            console.log('delete downloaded songs finished.................')
            let currentPlaying_songid = commonFuns.getSongId(rootState.root_currentPlayingSong);
            if (state.downloaded_list_playing_index >= 0 && del.indexOf(currentPlaying_songid) > -1) {
                bSwitchCurrentSong = true;
            }

            let del_songs = [];
            if (params.isDelFile) {
                for (let i = 0; i < del.length; i++) {
                    let del_id = del[i];
                    for (let k = 0; k < state.downloaded_songlist.length; k++) {
                        let songid = commonFuns.getSongId(state.downloaded_songlist[k]);
                        if (del_id === songid) {
                            del_songs.push(state.downloaded_songlist[k]);
                        }
                    }
                }
            }

            let del_songids = del;
            let isDelFile = params.isDelFile;
            commit(types.DEL_DOWNLOADED_ITEMS, { del_songids, del_songs, isDelFile });

            //同步的删除正在播放列表里面的歌曲
            let idArrs = del;
            let fromList = constant.downloaded_songlist_id;
            let isSwitchPlaying = bSwitchCurrentSong;
            dispatch('deleteCurrentPlaylistSongsByID', { idArrs, fromList, isSwitchPlaying });
        });

        dispatch('getCurrentPageDownloadedData', state.currentpage);
    }
}

const mutations = {
    [types.GET_DOWNLOADED_LIST](state, songArray) {
        // state.downloaded_songlist = songArray;
        for (let i = songArray.length - 1; i >= 0; i--) {
            let item = songArray[i];
            // console.log(item.authorLinksArr);
            state.downloaded_songlist.push(item);
        }
        state.downloaded_list_initialized = true;
        // console.log(state.downloaded_songlist)
    },
    [types.UPDATE_CURRENTPAGE_DOWNLOADED_DATA](state, { songlist, page }) {
        state.currentpage = page;
        state.currentpage_downloaded_songlist = songlist;
    },
    [types.UPDATE_DOWNLOADED_LIST_PLAYING_INDEX](state, index) {
        state.downloaded_list_playing_index = index;
        // console.log('downloaded playing index is: ' + index)
    },

    [types.ADD_DWONLOADED_ITEM](state, song) {
        let add_song_id = commonFuns.getSongId(song)
        for (let i = 0; i < state.downloaded_songlist.length; i++) {
            let item = state.downloaded_songlist[i];
            let item_song_id = commonFuns.getSongId(item);
            if (item_song_id == add_song_id) {
                state.downloaded_songlist.splice(i, 1);
                break;
            }
        }
        let json_str = JSON.stringify(song);
        let obj = JSON.parse(json_str);
        obj.listid = constant.downloaded_songlist_id;

        let authorLinksArr = serviceCommon.getAuthorsLinksArr(obj.author, obj.all_artist_id)
        obj.authorLinksArr = authorLinksArr

        state.downloaded_songlist.splice(0, 0, obj);
        // console.log(state.downloaded_songlist)
    },

    [types.DEL_DOWNLOADED_ITEMS](state, param) {
        for (let i = 0; i < param.del_songids.length; i++) {
            let id = param.del_songids[i];
            for (let k = 0; k < state.downloaded_songlist.length; k++) {
                let songid = commonFuns.getSongId(state.downloaded_songlist[k])
                if (id == songid) {
                    state.downloaded_songlist.splice(k, 1);
                }
            }
        }

        if (param.isDelFile) {
            for (let i = 0; i < param.del_songs.length; i++) {
                let song = param.del_songs[i];
                // console.log('del song is: ' + JSON.stringify(song))
                if (song.hasOwnProperty('file_path')) {
                    let file_path = song.file_path;
                    console.log('delete downloaded song file is: ' + file_path)
                    if (fs.existsSync(file_path)) {

                    }
                    fs.unlink(file_path, (error) => {
                        console.log(error)
                    });
                }
            }
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}