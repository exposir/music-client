import * as types from '../mutation-types'
import dataBase from '../../dataoperation/websql/sqlstorage'
import sortList from '../../dataoperation/sort/sortSongArray.js'
import constant from '../../constant.js'
import commonFuns from '../../components/commonFuns/common.js'
import serviceCommon from '../../service/common'


const fs = require('fs');
const shell = require('electron').shell;

//initial state
const state = {
    local_songlist: [], //本地歌曲
    currentpage_local_songlist: [], //当前页本地歌曲
    currentpage: -1, //当前页
    local_list_playing_index: -1, //本地歌单正在播放的索引

    title_sort_type: 0,
    author_sort_type: 0,
    album_sort_type: 0,
    duration_sort_type: 0,
}

const getters = {
    localSonglist: () => state.local_songlist,
    currentPageLocalSonglist: () => state.currentpage_local_songlist,
    localListPlayingIndex: () => state.local_list_playing_index,
    titleSortType: () => state.title_sort_type,
    authorSortType: () => state.author_sort_type,
    albumSortType: () => state.album_sort_type,
    durationSortType: () => state.duration_sort_type,
}

const actions = {
    getLocalSongList({ commit, dispatch }) {
        if (state.local_songlist.length <= 0) {
            dataBase.query_all(constant.local_songlist_id, function(listid, songArray) {
                if (Array.isArray(songArray)) {
                    for (let i = 0; i < songArray.length; i++) {
                        let song = songArray[i];
                        song.listid = constant.local_songlist_id;
                    }
                    commit(types.GET_LOCAL_SONG_LIST, songArray)
                    dispatch('getCurrentPageLocalData', 0);
                }
            })
        }
    },
    getCurrentPageLocalData({ commit, dispatch }, page) {
        let index = page * constant.maxItemCountPerPage;
        if (index >= state.local_songlist.length) {
            return;
        }
        let endIndex = index + constant.maxItemCountPerPage;
        if (endIndex >= state.local_songlist.length) {
            endIndex = state.local_songlist.length;
        }

        let songlist = [];
        for (let i = index; i < endIndex; i++) {
            songlist.push(state.local_songlist[i]);
        }
        commit(types.UPDATE_LOCAL_CURRENTPAGE_DATA, { songlist, page });

        dispatch('updateLocalListPlayingIndex');
    },
    setLocalListPlayingIndex({ commit }, index) {
        commit(types.UPDATE_LOCAL_LIST_PLAYING_INDEX, index);
    },
    updateLocalListPlayingIndex({ commit, rootState }) {
        // console.log('updateLocalListPlayingIndex listid = ' + song.listid);
        let playing_index = -1;
        let song = rootState.root_currentPlayingSong;
        if (typeof song != 'undefined' && song.hasOwnProperty('listid')) {
            const listid = song.listid;
            const songid = commonFuns.getSongId(rootState.root_currentPlayingSong);

            if (listid === constant.local_songlist_id) {
                for (let i = 0; i < state.currentpage_local_songlist.length; i++) {
                    const song_in_list_id = commonFuns.getSongId(state.currentpage_local_songlist[i]);
                    // console.log(song_in_list.song_id)
                    if (song_in_list_id === songid) {
                        playing_index = i;
                        break;
                    }
                }
            }
        }

        // console.log('local list playing index is: ' + playing_index);
        commit(types.UPDATE_LOCAL_LIST_PLAYING_INDEX, playing_index);
    },
    addSongsToLocalSonglist({ commit, dispatch, rootState }, params) {
        let songArray = params.songArray;
        let isReset = params.isReset;

        let set = new Set();
        for (let i = 0; i < state.local_songlist.length; i++) {
            let id = commonFuns.getSongId(state.local_songlist[i]);
            set.add(id)
        }

        for (let k = 0; k < songArray.length; k++) {
            let id = commonFuns.getSongId(songArray[k]);
            if (set.has(id)) {
                songArray.splice(k, 1);
                k--;
            }
        }
        set.clear();
        set = null;

        if (Array.isArray(songArray)) {
            commit(types.ADD_TO_LOCAL_SONG_LIST, { songArray, isReset });
        }
        dataBase.insert_songinfo(constant.local_songlist_id, songArray);

        dispatch('getCurrentPageLocalData', state.currentpage);
    },
    sortLocalSonglist({ commit, dispatch }, sort_index) {
        commit(types.SORT_LOCAL_SONG_LIST, sort_index);
        dispatch('updateLocalListPlayingIndex');
    },
    //从当前正在播放列表删除本地文件的时候调用用来同步列表
    syncDeleteSongsByPlayinglist({ commit, dispatch }, ids) {
        dataBase.delete_by_songid(constant.local_songlist_id, ids, function(del) {
            console.log(del);
            let del_songs = [];
            let del_songids = del;
            let isDelFile = false;
            commit(types.DELETE_FROM_LOCAL_SONG_LIST, { del_songids, del_songs, isDelFile });
            dispatch('getCurrentPageLocalData', state.currentpage);
        });
    },
    deleteLocalSongs({ commit, dispatch, rootState }, { indexArrs, isDelFile }) {
        if (indexArrs.length <= 0) {
            return;
        }

        let del_idArrs = [];
        for (let i = 0; i < indexArrs.length; i++) {
            let index = indexArrs[i];
            let obj = state.local_songlist[index];
            // console.log(JSON.stringify(obj))
            let id = commonFuns.getSongId(obj);

            del_idArrs.push(id);
        }

        let bSwitchCurrentSong = false;
        console.log('begin to delete from local song list..................')
        dataBase.delete_by_songid(constant.local_songlist_id, del_idArrs, function(del) {
            console.log('delete form database success.......................')
            let currentPlaying_songid = commonFuns.getSongId(rootState.root_currentPlayingSong);
            if (state.local_list_playing_index >= 0 && del.indexOf(currentPlaying_songid) > -1) {
                bSwitchCurrentSong = true;
            }

            let del_songs = [];
            if (isDelFile) {
                for (let i = 0; i < del.length; i++) {
                    let del_id = del[i];
                    for (let k = 0; k < state.local_songlist.length; k++) {
                        let id = commonFuns.getSongId(state.local_songlist[k])
                        if (del_id == id) {
                            del_songs.push(state.local_songlist[k]);
                        }
                    }
                }
            }

            let del_songids = del;
            commit(types.DELETE_FROM_LOCAL_SONG_LIST, { del_songids, del_songs, isDelFile });

            //同步的删除正在播放列表里面的歌曲
            let idArrs = del;
            let fromList = constant.local_songlist_id;
            let isSwitchPlaying = bSwitchCurrentSong;
            dispatch('deleteCurrentPlaylistSongsByID', { idArrs, fromList, isSwitchPlaying });

            if (state.currentpage * constant.maxItemCountPerPage >= state.local_songlist.length) {
                dispatch('getCurrentPageLocalData', 0);
            } else {
                dispatch('getCurrentPageLocalData', state.currentpage);
            }
        });
    },
    openLocalSongFolder({ commit, dispatch }, selectIndex) {
        let song = state.local_songlist[selectIndex];
        // console.log(song);
        if (song.hasOwnProperty('file_path')) {
            // shell.openItem(song.show_link);
            let file_path = song.file_path;
            // console.log(file_path)
            if (!fs.existsSync(file_path)) {
                console.log('local file not exist');
                commonfunc.createTips('本地文件不存在', 'error', 3000);
            } else {
                shell.showItemInFolder(file_path)
            }
        }
    },
    updatelocalsongduration({ commit, dispatch }, song) {
        let songid = commonFuns.getSongId(song);
        dataBase.update_by_songid(constant.local_songlist_id, songid, song);
        commit(types.UPDATE_LOCAL_SONG_DURATION, song);
    }
}

const mutations = {
    [types.GET_LOCAL_SONG_LIST](state, songArray) {
        // state.local_songlist = songArray;
        let localist = [];
        let len = songArray.length - 1;
        for (let i = len; i >= 0; i--) {
            let songinfo = songArray[i];
            localist.push(songinfo);
        }
        state.local_songlist = localist;
    },
    [types.ADD_TO_LOCAL_SONG_LIST](state, params) {
        let songArray = params.songArray;
        let isReset = params.isReset;

        if (isReset) {
            state.local_songlist.splice(0, state.local_songlist.length);
        }
        for (let i = 0; i < songArray.length; i++) {
            let song = songArray[i];
            song.listid = constant.local_songlist_id;

            // state.local_songlist.push(song);
            let authorLinksArr = serviceCommon.getAuthorsLinksArr(song.author, song.all_artist_id)
            song.authorLinksArr = authorLinksArr
            state.local_songlist.splice(0, 0, song)
        }
    },
    [types.UPDATE_LOCAL_SONG_DURATION](state, song) {
        let cur_id = commonFuns.getSongId(song);
        for (let i = 0; i < state.local_songlist.length; i++) {
            let id = commonFuns.getSongId(state.local_songlist[i])
            if (id == cur_id) {
                let json_str = JSON.stringify(song);
                state.local_songlist[i] = JSON.parse(json_str);
                break;
            }
        }

        let empty_array = [];
        state.local_songlist = state.local_songlist.concat(empty_array);
    },
    [types.UPDATE_LOCAL_LIST_PLAYING_INDEX](state, playing_index) {
        state.local_list_playing_index = playing_index;
    },
    [types.DELETE_FROM_LOCAL_SONG_LIST](state, params) {
        for (let i = 0; i < params.del_songids.length; i++) {
            let id = params.del_songids[i];
            for (let k = 0; k < state.local_songlist.length; k++) {
                let song = state.local_songlist[k];
                let songid = commonFuns.getSongId(song);

                if (id === songid) {
                    state.local_songlist.splice(k, 1);
                }
            }
        }

        if (params.isDelFile) {
            for (let i = 0; i < params.del_songs.length; i++) {
                let song = params.del_songs[i];
                if (song.hasOwnProperty('file_path')) {
                    let file_path = song.file_path;
                    console.log('deleted local list file is: ' + file_path);
                    fs.unlink(file_path, (error) => {
                        console.log(error)
                    });
                }
            }
        }
    },
    [types.SORT_LOCAL_SONG_LIST](state, sort_index) {
        //sort_index: 0按标题排序 1按歌手排序 2按专辑排序 3按时间排序
        //sort_Type 0不排序 1按升序排列 2按降序排列
        if (sort_index === 0) {
            if (state.title_sort_type === 0) {
                state.title_sort_type = 1;
                sortList.sortBySongTitle_asce(state.currentpage_local_songlist);
            } else {
                if (state.title_sort_type === 1) {
                    state.title_sort_type = 2;
                    sortList.sortBySongTitle_desc(state.currentpage_local_songlist);
                } else {
                    state.title_sort_type = 1;
                    sortList.sortBySongTitle_asce(state.currentpage_local_songlist);
                }
            }
        } else if (sort_index === 1) {

        } else if (sort_index === 2) {

        } else if (sort_index === 3) {}
    },
    [types.UPDATE_LOCAL_CURRENTPAGE_DATA](state, { songlist, page }) {
        state.currentpage_local_songlist = songlist;
        // console.log(state.currentpage_local_songlist)
        state.currentpage = page;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}