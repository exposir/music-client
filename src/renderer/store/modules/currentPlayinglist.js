import * as types from '../mutation-types'
import dataBase from '../../dataoperation/websql/sqlstorage'
import songService from '../../service/songService'
import settings from '../../dataoperation/settings/settings'
import settingKey from '../../dataoperation/settings/settingsKey'
import underscore from 'underscore'
import constant from '../../constant.js'
import lyricParser from '../../lyric/lyricSearch.js'
import lyricContent from '../../lyric/localLyricParser.js'
import reportService from '../../service/reportService'
import commonFuns from '../../components/commonFuns/common.js'
import serviceCommon from '../../service/common'

import albumService from '../../service/albumService'
import gedanService from '../../service/gedanService'
import radioService from '../../service/radioService'
import bangdanService from '../../service/bangdanService'
import MessageBox from 'components/messageBox/main.js'
const { shell } = require('electron');
const fs = require('fs');

//该文件封装所有有当前正在播放列表相关的变量和操作，其他无光的不要写在这里
const state = {
    current_playing_list: [], //当前正在播放列表
    currentPlayingIndex: 0, //当前需要播放的歌曲索引
    currentPlayingSong: {},

    //播放歌曲的顺序列表，如果是循环模式则为当前播放列表，否则为随机列表
    //歌曲要按照这个表的顺序来播放，无论是顺序还是随机
    orderedPlayinglist: [],

    //orderedPlayinglist表中需要播放的歌曲的索引，这个值外面不应该使用
    //外面需要使用的是currentPlayingIndex
    orderedPlayingIndex: 0,

    //当前播放歌曲时间位置 单位：毫秒
    currentPlayTimePos: 0,

    //当前播放歌曲的歌词
    currentPlayingSongLyric: [],

    //当前歌词是不是纯文本歌词
    isCurrentPureTextLyric: false,

    //播放错误的次数
    playErrorCount: 0,
}

const getters = {
    currentPlaysList: () => state.current_playing_list,
    currentPlayIndex: () => state.currentPlayingIndex,
    currentPlayingSong: () => state.currentPlayingSong,
    currentPlayTimePos: () => state.currentPlayTimePos, //
    currentPlayingSongLyric: () => state.currentPlayingSongLyric,
    isCurrentPureTextLyric: () => state.isCurrentPureTextLyric,
    playErrorCount: () => state.playErrorCount,
}

const actions = {
    getCurrentPlayingList({ commit, dispatch }, isPlay = false) {
        if (state.current_playing_list.length > 0) {
            dispatch('updatePlayingIndexInPlaylist', state.currentPlayingSong);
            if (isPlay) {
                dispatch('playingSong', true);
            }
        } else {
            dataBase.query_all(constant.current_play_list_id, function(listid, songArray) {
                if (Array.isArray(songArray)) {
                    commit(types.GET_CURRENT_PLAYING_LIST, songArray)

                    let songIndex = settings.get_setting_value(settingKey.currentplay_song_index);
                    if ((songIndex == "") || (songIndex < 0) || (songIndex >= songArray.length)) {
                        songIndex = 0;
                    }
                    commit(types.ORIGN_PLAYING_INDEX, songIndex)
                        // console.log('last time playing index is: ' + songIndex);
                    let song = songArray[songIndex];
                    commit(types.UPDATE_CURRENT_PLAYING_SONG, song);
                    if (!isPlay && !commonFuns.isLocalSong(song) && song && !song.pic_small) {
                        console.log('current playing song do not has album,need to get song link')
                        let request_data = {
                            'songid': commonFuns.getSongId(song),
                            'res': 1,
                            "aac": 0
                        };
                        songService.getSongLink(request_data, res => {
                            if (res.error_code == 22000) {
                                let songinfoJson = res.songinfo
                                commit(types.UPDATE_CURRENT_PLAYING_SONG, songinfoJson);
                            }
                        })
                    }
                    // console.log(song)
                    if (songArray.length > 0) {
                        dispatch('updatePlayingIndexInPlaylist', song);
                        if (isPlay) {
                            dispatch('playingSong', true);
                        }
                    }
                }
            })
        }

    },
    reGenerationOrderPlayList({ commit, dispatch, rootState }) {
        // console.log('rebuild ordered playlist');
        let mode = settings.get_setting_value(settingKey.playmode)
        if (constant.playModeArray.indexOf(mode) == -1) {
            mode = constant.defaultPlayMode
        }

        // console.log(state.currentPlayingIndex)
        let songArray = [];
        for (let i = 0; i < state.current_playing_list.length; i++) {
            songArray.push(state.current_playing_list[i])
        }

        if (mode === constant.playModeArray[1]) {
            //random play
            console.log('current play mode is random!');
            let len = state.current_playing_list.length;
            while (len != 0) {
                let random = Math.floor(Math.random() * len);
                len--;

                let temp = songArray[len];
                songArray[len] = songArray[random];
                songArray[random] = temp;
            }
        }

        // state.orderedPlayinglist = songArray;
        commit(types.REGENERRATION_ORDER_PLAY_LIST, songArray);

        let cur_play_song = rootState.root_currentPlayingSong;
        let playing_id = commonFuns.getSongId(cur_play_song);
        // console.log(JSON.stringify(rootState.root_currentPlayingSong))
        let index = 0;
        for (let i = 0; i < state.current_playing_list.length; i++) {
            let id = commonFuns.getSongId(state.current_playing_list[i])
            if (playing_id == id) {
                index = i;
                break;
            }
        }
        commit(types.ORIGN_PLAYING_INDEX, index);
        console.log('current playing index is: ' + index + 'song is: ' + cur_play_song.title);

        // console.log(state.currentPlayingIndex);
        const playing_song = state.current_playing_list[index];
        // console.log('cur index is: ' + index + ' cur array is: '+ state.current_playing_list.length + ' sort is: ' + songArray.length);
        for (let i = 0; i < songArray.length; i++) {
            let id = commonFuns.getSongId(songArray[i])
            if (playing_id === id) {
                commit(types.ORDER_PLAYING_INDEX, i);
                break;
            }
        }
    },
    addSongsToCurrentPlayinglist({ commit, dispatch }, params) {
        let songArray_in = params.songArray; //歌曲列表
        let playIndex = params.playIndex; //播放第几首  第一首为0
        let isPlay = params.isPlay; //是否播放   true or false
        let isReset = params.isReset; //是否重置列表   true or false
        let len = state.current_playing_list.length; //
        // console.log(songArray_in)
        // console.log('orign len is: ' + len);
        //电台播放时，minibar会有变化，故增加infoForPlayRadio属性。在非电台播放时，不必在调用addSongsToCurrentPlayinglist时加入infoForPlayRadio
        let infoForPlayRadio = params.infoForPlayRadio
        if (!infoForPlayRadio || infoForPlayRadio.type == 'others') {
            dispatch('setPlayingRadioInfo', { type: 'others' })
            dispatch('setDisplayInfo', { type: 'others' })
        } else {
            dispatch('setPlayingRadioInfo', infoForPlayRadio)
            dispatch('setDisplayInfo', infoForPlayRadio)
        }

        let songArray = [];
        let playSpec_index = -1;
        if (!isReset) {
            //去重，避免添加重复的歌曲到播放列表
            for (let i = 0; i < songArray_in.length; i++) {
                let song_add = songArray_in[i];
                if (commonFuns.isSongOffline(song_add)) {
                    if (i < playIndex) {
                        playIndex--;
                        if (playIndex < 0) {
                            playIndex = 0;
                        }
                    }
                    continue;
                }
                let songid_add = commonFuns.getSongId(song_add);
                let isRepeat = false;
                for (let k = 0; k < state.current_playing_list.length; k++) {
                    let song = state.current_playing_list[k];
                    let songid = commonFuns.getSongId(song);

                    if (songid_add == songid) {
                        isRepeat = true;
                        playSpec_index = k;
                        break;
                    }
                }

                if (!isRepeat) {
                    songArray.push(song_add);
                }
            }
        } else {
            for (let i = 0; i < songArray_in.length; i++) {
                let song = songArray_in[i];
                if (commonFuns.isSongOffline(song)) {
                    if (i < playIndex) {
                        playIndex--;
                        if (playIndex < 0) {
                            playIndex = 0;
                        }
                    }
                    continue;
                }
                songArray.push(song)
            }
        }

        if (songArray.length <= 0) {
            isReset = false;
        }
        commit(types.ADD_TO_CURRENT_PLAYINGLIST, { songArray, isReset });
        // console.log('modify len is: ' + state.current_playing_list.length)

        if (isReset) {
            dataBase.delete_songlist(constant.current_play_list_id);
        } else {
            if (playSpec_index != -1) {
                playIndex = playSpec_index;
            } else {
                playIndex = len + playIndex;
                if (playIndex >= state.current_playing_list.length) {
                    playIndex = 0;
                }
            }
        }

        dataBase.insert_songinfo(constant.current_play_list_id, songArray);

        if (isPlay) {
            commit(types.UPDATE_PLAY_ERROR_COUNT, 0);
            commit(types.ORIGN_PLAYING_INDEX, playIndex);
            let isAutoSwitch = false;
            if (songArray.length > 1) {
                isAutoSwitch = true;
            }
            dispatch('playSpecifySong', { playIndex, isAutoSwitch })
        }


    },
    addWholeListToCurrentPlayinglist({ commit, dispatch }, params) {
        let playIndex = params.playIndex;
        let isPlay = params.isPlay;
        let isReset = params.isReset;
        let listid = params.listid;
        dataBase.query_all(listid, function(listid, arr) {
            if (Array.isArray(arr)) {
                let songArray = [];
                if (listid == constant.history_list_id) {
                    let len = arr.length - 1;

                    for (let i = len; i >= 0; i--) {
                        songArray.push(arr[i]);
                    }
                } else {
                    songArray = songArray.concat(arr);
                }
                //actions.addSongsToCurrentPlayinglist({ commit }, { songArray, playIndex, isPlay, isReset });
                dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset });
            }
        })
    },
    playPrevOrNextSong({ commit, dispatch }, params) {
        let isPrev = params.isPrev;
        let isMouseClicked = params.isMouseClicked;
        // console.log('is prev: ' + isPrev + ' isMouseClicked: ' + isMouseClicked);

        if (state.current_playing_list.length <= 0) {
            return;
        }

        if (state.playErrorCount >= constant.maxPlayErrorCount && !isMouseClicked) {
            // console.log('current error count is exceed max, stop play');
            dispatch('resetCurrentPlayingState');
            return;
        }

        if (state.orderedPlayinglist.length <= 0 ||
            state.orderedPlayinglist.length !== state.current_playing_list.length) {
            dispatch('reGenerationOrderPlayList');
        }

        let mode = settings.get_setting_value(settingKey.playmode)
        if (constant.playModeArray.indexOf(mode) == -1) {
            mode = constant.defaultPlayMode
        }

        if (mode === 'single' && !isMouseClicked) {
            dispatch('playingSong', true);
            return;
        }

        let index = state.orderedPlayingIndex;
        if (index < 0 || index >= state.orderedPlayinglist.length) {
            index = 0;
        }

        // console.log('now index is: ' + index)
        if (mode == 'list' && !isMouseClicked) {
            if (index == (state.orderedPlayinglist.length - 1)) {
                // console.log('current playing is last song, stop!');
                dispatch('resetCurrentPlayingState');
                return;
            }
        }

        if (isMouseClicked || mode != 'single') {
            if (isPrev) {
                index--;
                if (index < 0) {
                    index = state.orderedPlayinglist.length - 1;
                }
            } else {
                index++;
                if (index >= state.orderedPlayinglist.length) {
                    index = 0;
                }
            }
            commit(types.ORDER_PLAYING_INDEX, index);
        }

        // console.log("prv or next index is: " + index + " list len is: " + state.orderedPlayinglist.length);
        let playing_song = state.orderedPlayinglist[index];
        let playing_id = commonFuns.getSongId(playing_song)
        for (let i = 0; i < state.current_playing_list.length; i++) {
            let id = commonFuns.getSongId(state.current_playing_list[i])
            if (playing_id === id) {
                playing_song = state.current_playing_list[i];
                commit(types.ORIGN_PLAYING_INDEX, i);
                break;
            }
        }


        dispatch('playingSong', true);
    },
    playSpecifySong({ commit, dispatch }, params) {
        let playIndex = params.playIndex;
        let isAutoSwitch = params.isAutoSwitch;
        console.log(playIndex)
            // console.log(params);

        if (state.orderedPlayinglist.length <= 0 ||
            state.orderedPlayinglist.length !== state.current_playing_list.length) {
            // actions.reGenerationOrderPlayList({ commit });
            dispatch('reGenerationOrderPlayList');
        }

        let playing_song = state.current_playing_list[playIndex];
        let playing_id = commonFuns.getSongId(playing_song)
        commit(types.ORIGN_PLAYING_INDEX, playIndex);
        for (let i = 0; i < state.orderedPlayinglist.length; i++) {
            let order_song = state.orderedPlayinglist[i];
            let id = commonFuns.getSongId(order_song)
            if (playing_id === id) {
                playing_song = order_song;
                commit(types.ORDER_PLAYING_INDEX, i);
                break;
            }
        }

        //actions.playingSong({ commit });
        dispatch('playingSong', isAutoSwitch);
    },
    playingSong({ commit, dispatch, rootGetters }, isAutoSwitch) {
        if (state.current_playing_list.length <= 0) {
            return;
        }

        if (state.orderedPlayinglist.length <= 0 ||
            state.orderedPlayinglist.length !== state.current_playing_list.length) {
            dispatch('reGenerationOrderPlayList');
        }

        let playing_song = state.current_playing_list[state.currentPlayingIndex];

        // console.log('current playing song is: ' + playing_song.title + ' song index is: ' + state.currentPlayingIndex);
        // console.log('current playing song list id is: ' + playing_song.listid + ' auto switch is: ' + isAutoSwitch);
        // //console.log("playing song is: " + JSON.stringify(playing_song))
        if (typeof playing_song == 'undefined') {
            console.log('current playing song is undefined, index is: ' + state.currentPlayingIndex);
            return;
        }

        // console.log('current song:', JSON.stringify(playing_song))
        let songid = commonFuns.getSongId(playing_song);
        reportService.clickReport({ 'type': 14, 'songid': songid, 'songtitle': playing_song.title, 'songartist': playing_song.author });

        settings.set_setting_value(settingKey.currentplay_song_index, state.currentPlayingIndex)

        let isNeedToGetSongLink = true;
        if (commonFuns.isLocalSong(playing_song)) {
            let isDownloaded = false;
            if (songid.indexOf('_local') == -1) {
                isDownloaded = true;
            }
            isNeedToGetSongLink = false;
            if (!fs.existsSync(playing_song.file_path)) {
                //本地音乐，而且不是来自已下载列表
                if (!isDownloaded) {
                    console.log('this is local song and can not find local file! play error');
                    let errorMsg = '本地文件不存在';
                    dispatch('playErrorHandler', { "isAutoSwitch": isAutoSwitch, "errorMsg": errorMsg });
                    return;
                } else {
                    isNeedToGetSongLink = true;
                }
            } else if (!isNeedToGetSongLink) {
                let show_link = playing_song.show_link;
                commit(types.UPDATE_CURRENT_PLAYING_SONG, playing_song);
                dispatch('updatePlayingIndexInPlaylist', playing_song);
                dispatch('setPlayCoreAudioLink', { "show_link": show_link })
                dispatch('getSongLyric', playing_song) //获得该首歌歌词
                dispatch('insertSongToHistory', playing_song);
                return;
            }
        }

        if (playing_song.hasOwnProperty('expire') && playing_song.hasOwnProperty('show_link')) {
            let curTime = new Date().getTime();
            if (playing_song.expire > curTime) {
                isNeedToGetSongLink = false;
            } else {
                console.log('expire is out of date, we need to get song link..........')
            }
        }

        let song_listid = '';
        if (playing_song.hasOwnProperty('listid')) {
            song_listid = playing_song.listid;
        }
        //如果需要选链，那么再查询下播放历史，看看是不是需要选链
        if (isNeedToGetSongLink && (song_listid != constant.history_list_id)) {
            dataBase.query_by_songid(constant.history_list_id, songid, function(listid, songArray) {
                if (songArray.length > 0) {
                    let song = songArray[0];
                    if (song.hasOwnProperty('expire') && song.hasOwnProperty('show_link')) {
                        let curTime = new Date().getTime();
                        if (song.expire > curTime) {
                            isNeedToGetSongLink = false;
                            let new_song = commonFuns.deepCopyObj(song);
                            new_song.listid = song_listid;
                            playing_song = new_song;
                        } else {
                            console.log('expire is out of date, we need to get song link')
                        }
                    }
                }
            })
        }


        if (playing_song.hasOwnProperty('show_link') && !isNeedToGetSongLink) {
            let show_link = playing_song.show_link;
            commit(types.UPDATE_CURRENT_PLAYING_SONG, playing_song);
            dispatch('updatePlayingIndexInPlaylist', playing_song);
            dispatch('setPlayCoreAudioLink', { "show_link": show_link })
            dispatch('getSongLyric', playing_song) //获得该首歌歌词
            dispatch('insertSongToHistory', playing_song);
            return;
        }

        let params = {};
        params.songInfo = playing_song;
        params.enableHQ = (rootGetters.loginUserInfo.flag == 200) ? true : false;
        params.isAutoSwitch = isAutoSwitch;
        dispatch('getSongLinkAndPlay', params);
    },
    playErrorHandler({ commit, dispatch }, params) {
        console.log('playErrorHandler')
        let isAutoSwitch = params.isAutoSwitch;
        let errorMsg = params.errorMsg;
        if (errorMsg) {
            commonFuns.createTips(errorMsg, 'warning');
        }

        // console.log(state.current_playing_list)
        if (isAutoSwitch && state.current_playing_list.length > 1) {
            let isPrev = false;
            let isMouseClicked = false;
            commit(types.UPDATE_PLAY_ERROR_COUNT, state.playErrorCount + 1);
            dispatch('playPrevOrNextSong', { isPrev, isMouseClicked });
        } else {
            dispatch('resetCurrentPlayingState');
        }
    },
    updatePlayingIndexInPlaylist({ commit, dispatch }, song) {
        //把当前歌曲更新到跟组件中，方便别的state使用
        dispatch('updateRootCurrentPlayingSong', song);

        let index = -1;
        let songid = commonFuns.getSongId(song);
        for (let i = 0; i < state.current_playing_list.length; i++) {
            let id = commonFuns.getSongId(state.current_playing_list[i]);
            if (songid == id) {
                index = i;
            }
        }
        commit(types.ORIGN_PLAYING_INDEX, index);
        // console.log('current playing index is: ' + index + ' song is: ' + song.title)

        if (typeof song === 'undefined' || !song.hasOwnProperty('listid') || (listid === constant.history_list_id)) {
            return;
        }

        const listid = song.listid;
        if (listid == constant.local_songlist_id) {
            dispatch('updateLocalListPlayingIndex', song);
        } else if (listid == constant.history_list_id) {
            dispatch('updateHistoryPlayingIndex');
        } else if (listid == constant.downloaded_songlist_id) {
            dispatch('updateDownloadedSonglistPlayingIndex', song);
        }
    },
    setCurrentPlayingTimePos({ commit }, pos) {
        commit(types.CURRENT_PLATING_TIME_POS, pos)
    },
    getSongLyric({ commit }, songInfo) {
        let lrclink = songInfo.lrclink
        let title = songInfo.title
        let author = songInfo.author

        // console.log('current get lyric song is: ' + title + ' lrclink: ' + lrclink)
        // console.log(songInfo)
        if (lrclink && title && author) {
            lyricParser.getLyricFilePath(lrclink, title, author, true, function(file) {
                // console.log('getLyricFilePath success: ' + title)
                lyricContent.getLyricContent(title, author, (data) => {
                    let songid = commonFuns.getSongId(songInfo);
                    let curId = commonFuns.getSongId(state.currentPlayingSong);
                    if (curId != songid) {
                        console.log('lyric is not match current playing song: ' + state.currentPlayingSong.title)
                        return;
                    }
                    if (data) {
                        let lyric_array = data.array_lyric;
                        let isPureText = data.isPureText;
                        if (isPureText) {
                            lyric_array = data.array_pure_text;
                        }
                        // console.log(lyric_array);
                        commit(types.CURRENT_PLATING_SONG_LYRIC, { lyric_array, isPureText })
                    } else {
                        let lyric_array = [],
                            isPureText = false
                        commit(types.CURRENT_PLATING_SONG_LYRIC, { lyric_array, isPureText })
                    }
                })
            })
        } else {
            let lyric_array = [],
                isPureText = false
            commit(types.CURRENT_PLATING_SONG_LYRIC, { lyric_array, isPureText })
        }

    },
    deleteCurrentPlayingSong({ commit, dispatch }) {
        // console.log('current playing song is deleted!');
        let index = Math.min(state.currentPlayingIndex, state.current_playing_list.length);
        if (index >= state.current_playing_list.length) {
            index = 0;
        }
        if (state.current_playing_list.length <= 0) {
            dispatch('resetCurrentPlayingState');
        } else {
            let playIndex = index;
            let isAutoSwitch = true;
            dispatch('playSpecifySong', { playIndex, isAutoSwitch })
        }
    },
    deleteCurrentPlaylistSongsByIndex({ commit, dispatch, rootState }, { indexArrs, isDelFile }) {
        if (indexArrs.length <= 0) {
            return false;
        }

        let idArrs = [];
        for (let i = 0; i < indexArrs.length; i++) {
            let index = indexArrs[i];
            let obj = state.current_playing_list[index];
            let id = commonFuns.getSongId(obj);
            // console.log('need del id is: ' + id);
            idArrs.push(id);
        }

        let bSwitchCurrentSong = false;
        dataBase.delete_by_songid(constant.current_play_list_id, idArrs, function(del) {
            let cur_playing_songid = commonFuns.getSongId(rootState.root_currentPlayingSong)
            if (del.indexOf(cur_playing_songid) > -1) {
                bSwitchCurrentSong = true;
            }

            let del_songs = [];
            if (isDelFile) {
                for (let i = 0; i < del.length; i++) {
                    let del_id = del[i];
                    for (let k = 0; k < state.current_playing_list.length; k++) {
                        let song = state.current_playing_list[k];
                        let songid = commonFuns.getSongId(song);
                        if (del_id == songid) {
                            del_songs.push(song);
                        }
                    }
                }
                dispatch('syncDeleteSongsByPlayinglist', del)
            }

            let del_songids = del;
            commit(types.DEL_CURRENT_LIST_SONG, { del_songids, del_songs, isDelFile });

            if (bSwitchCurrentSong) {
                dispatch('deleteCurrentPlayingSong');
            } else if (del.length > 0) {
                dispatch('reGenerationOrderPlayList');
            }
        });
    },
    deleteCurrentPlaylistSongsByID({ commit, dispatch, rootState }, { idArrs, fromList, isSwitchPlaying }) {
        let ids = [];
        for (let i = 0; i < idArrs.length; i++) {
            let id = idArrs[i];
            for (let k = 0; k < state.current_playing_list.length; k++) {
                let song = state.current_playing_list[k];
                let songid = commonFuns.getSongId(song)
                    // console.log(JSON.stringify(song))
                if (!song.hasOwnProperty('listid')) {
                    continue;
                }

                if (id == songid &&
                    song.listid == fromList) {
                    // console.log(song.title);
                    ids.push(songid);
                }
            }
        }

        dataBase.delete_by_songid(constant.current_play_list_id, ids, function(del) {
            commit(types.DEL_CURRENT_LIST_SONG, { 'del_songids': del, 'del_songs': [], 'isDelFile': false });
            if (isSwitchPlaying) {
                dispatch('deleteCurrentPlayingSong');
            } else if (del.length > 0) {
                if (state.current_playing_list.length <= 0) {
                    dispatch('resetCurrentPlayingState');
                }
            }
            dispatch('updatePlayingIndexInPlaylist', rootState.root_currentPlayingSong)
                // console.log('current playing index is: ' + state.currentPlayingIndex)
        })
    },
    updateCurrentPlayngSongDuration({ commit, dispatch }, duration) {
        let json_songinfo = JSON.stringify(state.currentPlayingSong);
        let song = JSON.parse(json_songinfo);
        if (song.hasOwnProperty('song_duration') && song.song_duration == duration) {
            return;
        }

        song.song_duration = duration;
        dispatch('updatehistorysongduration', song);
        if (song.hasOwnProperty('listid')) {
            song.song_duration = duration;
            commit(types.UPDATE_CURRENT_PLAYING_SONG, song);
            let listid = song.listid;
            if (listid == constant.local_songlist_id) {
                dispatch('updatelocalsongduration', song);
            }
        } else {
            song.song_duration = duration;
            commit(types.UPDATE_CURRENT_PLAYING_SONG, song);
        }
    },
    resetCurrentPlayingState({ commit, dispatch }) {
        commit(types.UPDATE_CURRENT_PLAYING_SONG, null);
        commit(types.ORIGN_PLAYING_INDEX, -1);
        commit(types.ORDER_PLAYING_INDEX, -1);
        commit(types.UPDATE_PLAY_ERROR_COUNT, 0);
        dispatch('updateRootCurrentPlayingSong', null);
        dispatch('setLocalListPlayingIndex', -1);
        dispatch('setHistoryPlayingIndex', -1);
        dispatch('stop', true);
        if (document.getElementById('totalTime')) {
            document.getElementById('totalTime').innerHTML = "00:00";
            document.getElementById('progressSlider').value = 0;
            document.getElementById('curTime').innerHTML = '00:00';
            $('#progressSlider').css('background', '#f2f2f2')
            $('#playBtn').addClass('stop')
        }
        dispatch('setCurrentPlayingTimePos', 0)
        eventBus.$emit('playingsongchanged');
    },
    emptyCurrentPlayinglist({ commit }) {
        let songArray = [];
        let isReset = true;
        commit(types.ADD_TO_CURRENT_PLAYINGLIST, { songArray, isReset });
        dataBase.delete_songlist(constant.current_play_list_id);
    },
    //播放整个专辑
    async playWholeAlbum({ commit, dispatch }, album_id) {
        let jsondata = await albumService.getAlbumInfo({ 'album_id': album_id })
        let songArray = jsondata.songlist,
            playIndex = 0,
            isPlay = true,
            isReset = true
        if (songArray.length > 0) {
            dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset })
        }
    },
    //播放整个歌单
    async playWholeGedan({ commit, dispatch }, list_id) {
        let jsondata = await gedanService.getGedanSongList({ "list_id": list_id, "start": 0 })
        if (jsondata.error_code == 22000) {
            let songArray = jsondata.result.songList,
                playIndex = 0,
                isPlay = true,
                isReset = true
            if (songArray.length > 0) {
                dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset })
            }
        }
    },
    //播放整个电台
    async playWholeRadio({ commit, dispatch }, paramJson) {
        let { scene_id, scene_title } = paramJson
        let jsondata = await radioService.getRadioSongList({ "scene_id": scene_id, "limit": 20 })
        if (jsondata.error_code == 22000) {
            let songArray = jsondata.data.songs,
                playIndex = 0,
                infoForPlayRadio = paramJson,
                isPlay,
                isReset
            if (paramJson.addToList) { //追加到电台列表里
                isReset = false
                isPlay = false
            } else { //重新生成一个列表
                isReset = true
                isPlay = true
            }

            infoForPlayRadio.type = 'radio'
            delete infoForPlayRadio.addToList
            if (songArray.length > 0) {
                dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset, infoForPlayRadio })
            }

        }
    },
    //播放整个榜单
    async playWholeBangdan({ commit, dispatch }, bangdan_id) {
        let jsondata = await bangdanService.getBangdanInfo({ "type": bangdan_id })
        if (jsondata.error_code == 22000) {
            let songArray = jsondata.song_list,
                playIndex = 0,
                isPlay = true,
                isReset = true
            if (songArray.length > 0) {
                dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset })
            }
        }
    },
    //播放单曲
    playSingleSong({ commit, dispatch }, song) {
        let songArray = []
        songArray.push(song)
        let playIndex = 0,
            isPlay = true,
            isReset = false
        dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset });
    },
    //点击播放一首歌曲  则会播放某一个歌曲列表，重置播放列表 （当专辑只有一首歌的时候，歌曲添加到播放列表，不会重置播放列表）
    //与playWholeSongList 区别 主要是区别专辑一首歌的情况
    playSongUptoWholeSongList({ commit, dispatch }, paramsJson) {
        let songArray = paramsJson.songArray ? paramsJson.songArray : []
        let playIndex = paramsJson.playIndex ? paramsJson.playIndex : 0
        let isPlay = true,
            isReset = true
        if (Array.isArray(songArray) && songArray.length > 0) {
            if (songArray.length == 1) {
                isReset = false
            }
            dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset })
        }
    },
    //播放当前歌曲列表，重置播放列表
    playWholeSongList({ commit, dispatch }, paramsJson) {
        let songArray = paramsJson.songArray ? paramsJson.songArray : []
        let playIndex = paramsJson.playIndex ? paramsJson.playIndex : 0
        let isPlay = true,
            isReset = true
        if (Array.isArray(songArray) && songArray.length > 0) {
            dispatch('addSongsToCurrentPlayinglist', { songArray, playIndex, isPlay, isReset })
        }
    },
    setCurrentPlayingSong({ commit }, song) {
        commit(types.UPDATE_CURRENT_PLAYING_SONG, song);
    },
}

const mutations = {
    [types.GET_CURRENT_PLAYING_LIST](state, songArray) {
        songArray.forEach((value, index) => {
            songArray[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
        })

        state.current_playing_list = songArray;
    },
    [types.UPDATE_CURRENT_PLAYING_SONG](state, song) {
        // state.currentPlayingSong = song;
        // console.log(song)
        if (song) {
            let authorLinksArr = serviceCommon.getAuthorsLinksArr(song.author, song.all_artist_id)
            song.authorLinksArr = authorLinksArr
            state.currentPlayingSong = song;
        } else {
            state.currentPlayingSong = {};
        }
    },
    [types.ADD_TO_CURRENT_PLAYINGLIST](state, params) {
        let songArray = params.songArray;
        // songArray.forEach((value, index) => {
        //     if (value.author) {
        //         songArray[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
        //     }
        // })
        let isReset = params.isReset;
        if (isReset) {
            state.current_playing_list.splice(0, state.current_playing_list.length);
        }
        let start_time = new Date();
        for (let i = 0; i < songArray.length; i++) {
            let song_info = songArray[i];
            if (song_info.author) {
                song_info.authorLinksArr = serviceCommon.getAuthorsLinksArr(song_info.author, song_info.all_artist_id)
            }
            state.current_playing_list.push(song_info);
        }
        let end_time = new Date();
        let cost = end_time - start_time;
        console.log('cost is: ' + cost);

        //清空排序列表，播放切换的时候需要重新计算
        state.orderedPlayinglist.splice(0, state.orderedPlayinglist.length);
    },
    [types.REGENERRATION_ORDER_PLAY_LIST](state, songArray) {
        state.orderedPlayinglist = songArray;
    },
    [types.ORIGN_PLAYING_INDEX](state, index) {
        state.currentPlayingIndex = index;
        // console.log('current playing index is: ' + index);
    },
    [types.ORDER_PLAYING_INDEX](state, index) {
        state.orderedPlayingIndex = index;
    },
    [types.CURRENT_PLATING_TIME_POS](state, pos) {
        state.currentPlayTimePos = pos
    },
    [types.CURRENT_PLATING_SONG_LYRIC](state, { lyric_array, isPureText }) {
        state.currentPlayingSongLyric = lyric_array
            // console.log(lyric_array)
        state.isCurrentPureTextLyric = isPureText;
    },
    [types.DEL_CURRENT_LIST_SONG](state, { del_songids, del_songs, isDelFile }) {
        // console.log('before del len is: ' + state.current_playing_list.length);
        for (let i = 0; i < del_songids.length; i++) {
            let id = del_songids[i];
            for (let k = 0; k < state.current_playing_list.length; k++) {
                let song = state.current_playing_list[k];
                let songid = commonFuns.getSongId(song);
                if (id === songid) {
                    state.current_playing_list.splice(k, 1);
                }
            }
        }

        if (isDelFile) {
            for (let i = 0; i < del_songs.length; i++) {
                let song = del_songs[i];
                if (song.hasOwnProperty('file_path')) {
                    let file_path = song.file_path;
                    console.log('deleted local list file is: ' + file_path);
                    fs.unlink(file_path, (error) => {
                        console.log(error)
                    });
                }
            }
        }
        // console.log('after del len is: ' + state.current_playing_list.length);
    },
    [types.UPDATE_PLAY_ERROR_COUNT](state, count) {
        state.playErrorCount = count;
        // console.log('play error count is: ' + state.playErrorCount);
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}