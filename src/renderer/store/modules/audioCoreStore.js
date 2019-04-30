import audioCore from '../../audiocore/audioCore.js'
import songService from '../../service/songService'
import commonFuns from '../../components/commonFuns/common.js'
import * as muplayer from '../../components/muplayer/muplayer.js'
import constant from '../../constant.js'
import settings from '../../dataoperation/settings/settings'
import settingKey from '../../dataoperation/settings/settingsKey'
import dataBase from '../../dataoperation/websql/sqlstorage'
import * as types from '../mutation-types'
const md5 = require('md5')


const state = {
    currentPlayingState: 0, //0:未播放 1:播放中 2:暂停
}

const getters = {
    currentPlayingState: () => state.currentPlayingState
}

const actions = {
    initAudioCore({ commit }, param) {
        audioCore.initAudiCore(param);
        audioCore.getSupportFiles();
    },
    uninitAudioCore({ commit }) {
        audioCore.uninitAudioCore();
    },
    getMacPlayer({ commit }, params) {
        params.player = muplayer.playerObj;
    },
    playSongBySoundCore({ commit }, params) {
        let show_link = params.show_link;
        // show_link = show_link.replace('file://', '');
        let flag = 'file://'
        let enablePredeploy = true;
        if (show_link.indexOf(flag) >= 0) {
            show_link = show_link.substr(flag.length);
            enablePredeploy = false;
        }
        // console.log(show_link)

        audioCore.playingSong(show_link, enablePredeploy);
    },
    setPlayCoreAudioLink({ commit, dispatch }, paramsJson) {
        // if (state.currentPlayingState != 0) {
        //     console.log('first we need to stop current playing..............')
        //     dispatch('stop');
        // }
        dispatch('stop', false);

        try {
            let show_link = paramsJson.show_link
                // muplayer.playerObj.reset().add(show_link).play()
            if (process.platform == 'darwin') {
                muplayer.playerObj.reset().add(show_link).play();
            } else {
                dispatch('playSongBySoundCore', { 'show_link': show_link });
            }
        } catch (err) {
            console.log('player core error:' + JSON.stringify(err))
        }
    },
    play({ commit, dispatch }) {
        if (process.platform == 'darwin') {
            muplayer.playerObj.play();
        } else {
            audioCore.play();
        }
        commit(types.SET_PLAYING_STATE, 1);
    },
    pause({ commit, dispatch }) {
        if (process.platform == 'darwin') {
            muplayer.playerObj.pause();
        } else {
            audioCore.pause();
        }

        commit(types.SET_PLAYING_STATE, 2);
    },
    stop({ commit, dispatch }, isResetPlayState) {
        if (process.platform == 'darwin') {
            muplayer.playerObj.reset();
        } else {
            audioCore.stop();
        }
        if (isResetPlayState) {
            commit(types.SET_PLAYING_STATE, 0);
        }
    },
    setPosition({ dispatch }, pos) {
        if (process.platform == 'darwin') {
            muplayer.playerObj.play(pos);
        } else {
            // console.log('set pos: ' + pos)
            audioCore.setPlayPosition(pos);
        }
    },
    getPosition({ dispatch }, param) {
        //单位秒
        if (process.platform == 'darwin') {
            param.position = Math.round(muplayer.playerObj.curPos());
        } else {
            let position = audioCore.getPlayPosition();
            // console.log('get pos: ' + position)
            param.position = Math.round(position / 1000);
        }
    },
    playFastForward({ dispatch }) {
        if (process.platform == 'darwin') {
            let pos = Math.round(muplayer.playerObj.curPos());
            pos += 5000;
            muplayer.playerObj.play(pos);
        } else {
            let pos = audioCore.getPlayPosition();
            pos += 5000;
            audioCore.setPlayPosition(pos);
        }
    },
    playRewind({ dispatch }) {
        if (process.platform == 'darwin') {
            let pos = Math.round(muplayer.playerObj.curPos());
            pos -= 5000;
            muplayer.playerObj.play(pos);
        } else {
            let pos = audioCore.getPlayPosition();
            pos -= 5000;
            audioCore.setPlayPosition(pos);
        }
    },
    setPlayVolume({ dispatch }, volume) {
        console.log('current play volume is: ' + volume)
        if (process.platform == 'darwin') {
            muplayer.playerObj.setVolume(volume);
        } else {
            audioCore.setVolume(volume);
        }
        dispatch('setVolume', volume)
    },
    setMute({ dispatch }, isMute) {
        if (process.platform == 'darwin') {
            muplayer.playerObj.setMute(isMute);
        } else {
            // audioCore.setVolume(volume);
            if (isMute) {
                audioCore.setMute();
            } else {
                let volume = settings.get_setting_value(settingKey.volume)
                if (volume == null || volume == "" || typeof volume == "undefined") {
                    volume = 20
                }
                audioCore.setVolume(volume);
            }
        }
    },
    getPlayingState({ dispatch }, param) {
        param.playState = state.currentPlayingState;
    },
    setPlayingState({ commit }, playState) {
        commit(types.SET_PLAYING_STATE, playState);
    },
    getDuration({ commit }, param) {
        if (process.platform == 'darwin') {
            param.duration = muplayer.playerObj.duration();
            // console.log(muplayer.playerObj);
        } else {
            let duration = audioCore.getDuration();
            // console.log('current duration is: ' + duration)
            duration = parseInt(duration / 1000);
            param.duration = duration;
        }
    },
    getSupportTypes({ commit }, param) {
        let exts = [];
        if (process.platform == 'darwin') {
            exts.push('mp3');
            exts.push('wav');
            exts.push('ogg');
            param.exts = exts;
        } else {
            let supports = audioCore.getSupportFiles();
            let exts = supports.split(';');
            for (let i = 0; i < exts.length; i++) {
                let item = exts[i];
                if (item == '.cue') {
                    //暂不支持cue格式
                    continue;
                }
                if (item.length > 1) {
                    let arr = item.split('.');
                    if (arr.length == 2) {
                        param.exts.push(arr[1]);
                    }

                }
            }
            // console.log(param.exts);
        }
    },
    getAudioTagInfo({ commit, dispatch }, { files, songs }) {
        let tags = [];
        audioCore.getAudioTagInfo(files, tags);
        console.log(tags);
        for (let i = 0; i < tags.length; i++) {
            let songinfo = {};
            let filePath = files[i];
            let tagInfo = tags[i];

            let id_md5 = md5(filePath) + "_local";
            let artist_item = {};
            artist_item.artist_name = tagInfo.artist;
            artist_item.artist_id = 0;
            let authorLinksArr = [];
            authorLinksArr.push(artist_item);

            songinfo["song_id"] = id_md5;
            songinfo["title"] = tagInfo.title;
            songinfo["show_link"] = filePath;
            songinfo["file_path"] = filePath;
            songinfo["artist"] = tagInfo.artist;
            songinfo["authorLinksArr"] = authorLinksArr;
            songinfo["album_title"] = tagInfo.album;
            songinfo["file_duration"] = Math.round(tagInfo.duration / 1000);

            songinfo["listid"] = constant.local_songlist_id;

            songs.push(songinfo);
        }
    },
    getSongLinkAndPlay({ commit, dispatch }, params) {
        //由于currentplayinglist的内容过于庞大，很多逻辑过于复杂，所以把播放相关的抽到这里
        let song = params.songInfo;
        let enableHQ = params.enableHQ; //开启高品质试听
        let isAutoSwitch = params.isAutoSwitch;
        // console.log('isauto switch: ' + isAutoSwitch)

        // console.log('get song link song is: ' + song.title)
        //暂不支持aac了
        let aac = 0;
        // let aac = enableHQ ? "2" : "1";
        // if (process.platform == 'darwin') {
        //     aac = 0; //mac不支持aac试听？其实应该也可以支持
        // }
        let songId = commonFuns.getSongId(song);

        let song_listid = "";
        let res = '1';
        if (song.hasOwnProperty('listid')) {
            song_listid = song.listid;
            if (song_listid == constant.favorite_songlist_id) {
                res = 2;
            }
        }

        let del_status = 0;
        if (song.hasOwnProperty('del_status')) {
            del_status = song.del_status;
        }
        let request_data = {
            'songid': songId,
            'res': res,
            "aac": aac
        };

        let isGetResponse = false;
        songService.getSongLink(request_data, res => {
                isGetResponse = true;
                console.log(res);
                if (res.error_code == 22000) {
                    let songinfoJson = res.songinfo
                        // console.log(songinfoJson)
                    if ((songinfoJson.copy_type == 1 || songinfoJson.copy_type == 3) && songinfoJson.del_status == 0) {
                        let playLinkInfo = commonFuns.extractSongFileLink(res, enableHQ);
                        console.log(playLinkInfo);

                        let show_link = '';
                        if (playLinkInfo.hasOwnProperty('show_link')) {
                            show_link = playLinkInfo.show_link.trim().length > 0 ? playLinkInfo.show_link : playLinkInfo.file_link;
                        }
                        if (show_link.length < 1) {
                            if (isAutoSwitch) {
                                commonFuns.createTips('应唱片公司要求，当前歌曲需付费使用，开通VIP会员可自由畅享哦！')
                            } else {
                                dispatch('showOpenVipMessageBox')
                            }
                            if (isPlayNow) {
                                dispatch('playErrorHandler', { "isAutoSwitch": isAutoSwitch });
                            }
                            return false;
                        }
                        //存储320码率 单曲 url 、时长
                        songinfoJson.listid = song_listid;
                        let temp_song = commonFuns.deepCopyObj(songinfoJson);
                        temp_song.listid = song_listid;
                        console.log(temp_song)

                        if (process.platform != 'darwin') {
                            let extra_linkInfo = commonFuns.getExtraPlayInfo(playLinkInfo)
                            show_link = extra_linkInfo + 'url:' + show_link;
                        }
                        temp_song.show_link = show_link
                            //添加到播放历史应该在计算索引之前，否则可能导致播放历史的正在播放索引不正确
                        dispatch('insertSongToHistory', temp_song);

                        dispatch('setCurrentPlayingSong', temp_song);
                        dispatch('updatePlayingIndexInPlaylist', temp_song);
                        // console.log(JSON.stringify(temp_song))
                        dispatch('setPlayCoreAudioLink', { "show_link": show_link })

                        dispatch('getSongLyric', temp_song) //获得该首歌歌词
                        if (song_listid == constant.local_songlist_id ||
                            song_listid == constant.history_list_id ||
                            song_listid == constant.current_play_list_id) {
                            dataBase.update_by_songid(song_listid, songId, temp_song);
                        }

                    } else {
                        let error_msg = '您好，应版权方要求，该歌曲下载后，即可播放哦~';
                        if (songinfoJson.copy_type == 0) {
                            error_msg = '应版权方要求，该歌曲暂时无法播放'
                        } else if (songinfoJson.del_status == 1) {
                            error_msg = '该歌曲已下线'
                        }
                        commonFuns.createTips(error_msg);
                        dispatch('playErrorHandler', { "isAutoSwitch": isAutoSwitch });
                    }
                } else if (res.error_code == 22469) { //单点售卖歌曲、专辑
                    if (isAutoSwitch) {
                        let del_status = 0;
                        if (song.hasOwnProperty('del_status')) {
                            del_status = song.del_status;
                        }

                        if (del_status == 0) {
                            commonFuns.createTips('当前歌曲为付费歌曲，购买后即可无限畅想~！', 'error');
                        } else {
                            commonFuns.createTips('歌曲已下线', 'error');
                        }
                        dispatch('playErrorHandler', { "isAutoSwitch": true })
                    } else {
                        let songinfoJson = res.result
                        dispatch('showSaleSongMessageBox', songinfoJson)
                    }
                } else if (res.error_code == 22467) { //全球付费
                    if (isAutoSwitch) {
                        dispatch('playErrorHandler', { "isAutoSwitch": true, "errorMsg": "应唱片公司要求，当前歌曲需付费使用，开通VIP会员可自由畅享哦！" });
                    } else {
                        dispatch('showOpenVipMessageBox')
                    }
                } else {
                    let errorMsg = '暂不支持付费歌曲播放和购买';
                    dispatch('playErrorHandler', { "isAutoSwitch": isAutoSwitch, "errorMsg": errorMsg });
                }

            },
            function(err) {
                console.log('get song link occurs error..................')
                let error_msg = "网络错误";
                if (!isGetResponse) {
                    dispatch('playErrorHandler', { "isAutoSwitch": isAutoSwitch, "errorMsg": error_msg })
                }
            })
    },

    //download actions only for pc use
    addDownloadTask({ commit }, params) {
        let url = params.url;
        let isStart = params.isStart;
        let songid = params.songid;
        let fileName = params.fileName;

        audioCore.newDownload(url, songid, fileName, isStart);
    },
    deleteP2pDownloadTask({ commit }, songid) {
        audioCore.deleteDownloadTask(songid);
    },
    deleteAllDownloadTask({ commit }) {
        audioCore.deleteAllDownloadTask();
    },
    setAudioCoreCacheFolder({ commit }, cacheFolder) {
        audioCore.setCacheFolder(cacheFolder)
    },
    setAudioCoreCacheSize({ commit }, size) {
        let size_int = Number(size)
        if (size_int >= 500) {
            audioCore.setCacheSize(size_int)
        }
    }
}

const mutations = {
    [types.SET_PLAYING_STATE](state, playingState) {
        state.currentPlayingState = playingState;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}