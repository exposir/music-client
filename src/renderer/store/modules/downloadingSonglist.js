'use-strict'
import * as types from '../mutation-types'
import dataBase from '../../dataoperation/websql/downloadingstorage.js'
import constant from '../../constant.js'
import pathutil from '../../pathUtils/pathUtils.js'
import * as download_status from '../../download/downloadError.js'
import downloadingService from '../../service/downloadSongService.js'
import commonFuns from '../../components/commonFuns/common.js'
import downloadMgr from '../../download/downloaderManager.js'
import serviceCommon from '../../service/common'
import settings from '../../dataoperation/settings/settings'
import settingKey from '../../dataoperation/settings/settingsKey'

const path = require('path')
const urlParse = require('url')
const fs = require('fs');

let DownloadMgr = new downloadMgr()
    // console.log('downloadmanger created:.................')

let dl_count = 0
    //该文件封装所有下载和已下载歌曲的逻辑
const state = {
    downloading_items: [],
    // download_task_items: [], //用来标识该项是否已经创建了对应的downloadtask,仅适用于pc
    downloading_list_initialized: false,
}

const getters = {
    downloadingItems: () => state.downloading_items,
}

const actions = {
    getDownloadingItems({ commit, dispatch }) {
        if (!state.downloading_list_initialized) {
            // dataBase.del_all_downloadings();
            dataBase.query_all_downloadings((items) => {
                commit(types.GET_DOWNLOADING_LIST, items);
            })
        }
    },

    getDownloadingCount({ commit, dispatch }, params) {
        if (process.platform == 'darwin') {
            params.dlCount = DownloadMgr.getDownloaderCount();
        } else {
            let dlCount = 0;
            for (let i = 0; i < state.downloading_items.length; i++) {
                let download_item = state.downloading_items[i];
                if (download_item.status == download_status.DOWNLOAD_RESULT_DOWNLOADING) {
                    dlCount++;
                }
            }
            params.dlCount = dlCount;
            // console.log(params.dlCount)
        }
    },

    ////////////////////////////////////////////////////
    //仅供p2p下载使用
    updateDownloadTaskProgress({ commit, dispatch }, { songid, percent }) {
        dispatch('callBackDownloadProgress', { 'percent': percent, 'identifier': songid });
    },

    downloadTaskFinished({ commit, dispatch }, { songid, cached, fileName, filepath }) {
        // console.log('p2p download finished....................');
        let error = 'success';
        let newfilePath = path.join(pathutil.getDownloadSongsFolder(), fileName);
        // console.log('download file is: ' + newfilePath);
        // fs.writeFileSync(newfilePath, fs.readFileSync(filepath));
        fs.readFile(filepath, null, (error, data) => {
            if (error) {
                console.log('read downloaded file failed.......')
                dispatch('deleteP2pDownloadTask', songid);
            } else {
                fs.writeFile(newfilePath, data, (err) => {
                    if (err) {
                        console.log('write downloaded file failed........')
                        dispatch('deleteP2pDownloadTask', songid);
                    } else {
                        dispatch('callbackDownloadEnd', { 'error': error, 'status': download_status.DOWNLOAD_RESULT_FINISHED, 'identifier': songid });
                    }
                })
            }
        })
    },

    downloadTaskOccursError({ commit, dispatch }, { songid, error }) {
        dispatch('callbackDownloadEnd', { 'error': error, 'status': download_status.DOWNLOAD_RESULT_ERROR, 'identifier': songid })
    },
    ////////////////////////////////////////////////////

    callBackDownloadProgress({ commit }, { percent, identifier }) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier === identifier &&
                item.status == download_status.DOWNLOAD_RESULT_DOWNLOADING &&
                item.percent != percent) {
                commit(types.UPDATE_DOWNLOADING_PROGRESS, { 'percent': percent, 'index': i });
                dataBase.update_downloading(item);
                // console.log('download percent is: ' + percent + ' song is: ' + item.song_info.title);
            }
        }
    },

    callbackDownloadEnd({ commit, dispatch }, { error, status, identifier }) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier == identifier) {

                if (status === download_status.DOWNLOAD_RESULT_FINISHED) {
                    //下载完成，没有错误，添加到已下载列表中
                    console.log('download complete song is: ' + item.song_info.title + ' file is: ' + item.downloading_path);
                    let temp_song_info = commonFuns.deepCopyObj(item.song_info);
                    if (process.platform == 'darwin') {
                        temp_song_info.show_link = 'file://' + item.downloading_path;
                    } else {
                        temp_song_info.show_link = item.downloading_path;
                    }

                    temp_song_info.file_path = item.downloading_path;
                    temp_song_info.copy_type = 1;
                    temp_song_info.listid = constant.downloaded_songlist_id;
                    temp_song_info.dt = item.dt;
                    dispatch('addSongToDownloadedList', temp_song_info);

                    let array_id = [];
                    array_id.push(item.identifier);
                    dataBase.del_downloadings(array_id);

                    //下载完成歌曲步加入本地歌曲列表
                    let param = {};
                    let songArray = [];
                    songArray.push(commonFuns.deepCopyObj(temp_song_info));
                    param.songArray = songArray;
                    param.isReset = false;
                    dispatch('addSongsToLocalSonglist', param);
                } else if (status === download_status.DOWNLOAD_RESULT_ERROR) {
                    commonFuns.createTips(item.song_info.title + " 下载失败", "error");
                }

                if (process.platform == 'darwin') {
                    DownloadMgr.remove(item.identifier, false);
                } else {
                    dispatch('deleteP2pDownloadTask', item.identifier);
                }
            }
        }

        commit(types.NOTIFY_DOWNLOADING_END, { error, status, identifier });
        dispatch('autoStartWatingDownload');
    },

    downloadSong({ commit, dispatch }, { new_download, downloading_item }) {
        // dl_count++;
        // console.log('current download count is: ' + dl_count + ' manger count is: ' + downloadMgr.getDownloaderCount);

        // console.log('download start, the url is: ' + downloading_item.downloadUrl + ' file path is: ' + downloading_item.downloading_path + ' newdownload is: ' + new_download);
        // console.log(downloading_item);
        if (process.platform == 'darwin') {
            DownloadMgr.download(downloading_item.downloadUrl, downloading_item.downloading_path, downloading_item.identifier, new_download, function(percent, identifier) {
                dispatch('callBackDownloadProgress', { 'percent': percent, 'identifier': identifier });
            }, function(error, status, identifier) {
                console.log('notify download end, status is: ' + status);
                dispatch('callbackDownloadEnd', { 'error': error, 'status': status, 'identifier': identifier });
            });
        } else {
            //p2p下载不区分是否创建下载，每次都是重新创建
            let fileName = path.basename(downloading_item.downloading_path);
            dispatch('addDownloadTask', { 'url': downloading_item.downloadUrl, 'isStart': true, 'songid': downloading_item.identifier, 'fileName': fileName });
        }
    },

    getDownloadUrlAndDown({ commit, dispatch }, { downloading_item, popupTips }) {
        let new_download = false;
        if (process.platform == 'darwin') {
            if (!downloading_item.getDownloadUrl || downloading_item.percent <= 0) {
                new_download = true;
            }
        }

        let timestamp = Date.parse(new Date());
        // console.log('current downloading dt is: ' + downloading_item.dt);
        downloadingService.getDownloadUrl({ 'dt': downloading_item.dt, 'timestamp': timestamp, 'songid': downloading_item.identifier }, function(jsonData) {
            //这里构造出来一个临时的对象来是为了避免不能在action中修改state里面的值
            let error_code = jsonData.error_code;
            // console.log('getDownloadUrlAndDown error code is: ' + error_code + '  song title is: ' + downloading_item.song_info.title);
            // console.log('getDownloadUrlAndDown res is: ' + JSON.stringify(jsonData));
            // console.log(jsonData);
            if (error_code === 22000) {
                let json_str = JSON.stringify(downloading_item);
                let new_item = JSON.parse(json_str);

                let songInfo = jsonData.songinfo;
                // console.log('get download url songinfo is: ' + JSON.stringify(songInfo));
                let bitrate = jsonData.bitrate;
                let downloadUrl = bitrate.file_link;

                if (process.platform != 'darwin') {
                    downloadUrl = commonFuns.formatDownloadUrl(bitrate);
                }
                // console.log('download url is: ' + downloadUrl);

                songInfo.file_size = bitrate.file_size;
                songInfo.song_duration = bitrate.file_duration;
                new_item.song_info = songInfo;
                let authorLinksArr = serviceCommon.getAuthorsLinksArr(songInfo.author, songInfo.all_artist_id);
                new_item.song_info.authorLinksArr = authorLinksArr;

                let file_extension = bitrate.file_extension;

                let fileName = path.basename(urlParse.parse(downloadUrl).pathname);
                if (file_extension.length <= 0) {
                    file_extension = path.extname(fileName);
                } else {
                    file_extension = "." + file_extension;
                }

                if ((file_extension == '.flac') && (process.platform == 'darwin')) {
                    //because of current play core do not support flac, so we change flac to mp3
                    file_extension = '.mp3';
                }
                // console.log('download song file extension is: ' + file_extension)
                fileName = new_item.song_info.title + file_extension;
                let filePath = path.join(pathutil.getDownloadSongsFolder(), fileName)
                new_item.downloading_path = filePath;
                new_item.downloadUrl = downloadUrl;
                new_item.getDownloadUrl = true;

                let params = {};
                params.dlCount = 0;
                dispatch('getDownloadingCount', params);

                // new_item.status = download_status.DOWNLOAD_RESULT_DOWNLOADING;
                if (process.platform != 'darwin' && params.dlCount < constant.maxDownloadingCount) {
                    // console.log('p2p download start, dispatch downloadsong')
                    new_item.status = download_status.DOWNLOAD_RESULT_DOWNLOADING;
                }

                commit(types.UPDATE_DOWNLOADING_ITEM, new_item);
                dataBase.update_downloading(new_item);

                if (params.dlCount < constant.maxDownloadingCount) {
                    // console.log('begin a new download, the url is: ' + downloadUrl + ' file path is: ' + filePath + ' identifier is: ' + new_item.identifier);
                    // let item = this.commonFuns.deepCopyObj(new_item);
                    // item.status = download_status.DOWNLOAD_RESULT_DOWNLOADING;
                    // commit(types.UPDATE_DOWNLOADING_ITEM, item);

                    dispatch('downloadSong', { 'new_download': new_download, 'downloading_item': new_item });

                    //是否同时下载歌词
                    let value = settings.get_setting_value(settingKey.download_lyric_with_song);
                    if (value == null || value == "" || typeof value == "undefined") {
                        value = '0';
                    }
                    if (value == '1') {
                        dispatch('getSongLyric', new_item.song_info)
                    }
                }
            } else {
                let json_str = JSON.stringify(downloading_item);
                let new_item = JSON.parse(json_str);
                let songtitle = new_item.song_info.title;
                if (error_code === 22467) {
                    new_item.status = download_status.DOWNLOAD_NEED_VIP;
                    if (popupTips) {
                        dispatch('showOpenVipMessageBox');
                    } else {
                        commonFuns.createTips(songtitle + " 需要VIP才能下载", "error");
                    }
                } else if (error_code === 22469) {
                    new_item.status = download_status.DOWNLOAD_NEED_BUY;
                    new_item.sale_info = jsonData.result;
                    if (popupTips && new_item.sale_info) {
                        dispatch('showSaleSongMessageBox', new_item.sale_info);
                    } else {
                        commonFuns.createTips(songtitle + " 需要付费下载", "error");
                    }
                } else {
                    new_item.status = download_status.DOWNLOAD_RESULT_ERROR;
                    commonFuns.createTips(songtitle + " 获取下载信息失败", "error");
                }

                commit(types.UPDATE_DOWNLOADING_ITEM, new_item);
                dispatch('autoStartWatingDownload');
            }

        }, function() {
            console.log('get download info failed...........')
                // dispatch('autoStartWatingDownload')
        })
    },

    autoStartWatingDownload({ commit, dispatch }) {
        let params = {};
        params.dlCount = 0;
        dispatch('getDownloadingCount', params);

        if (params.dlCount >= constant.maxDownloadingCount) {
            console.log('current download count is max..............')
            return;
        }

        // console.log('auto start download');
        console.log('autoStartWatingDownload.......................')
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            // console.log('auto start state is: ' + item.status)
            if (item.status === download_status.DOWNLOAD_RESULT_WAITING) {
                dispatch('getDownloadUrlAndDown', { 'downloading_item': item, 'popupTips': false });
                if (params.dlCount + 1 >= constant.maxDownloadingCount) {
                    break;
                }
            }
        }
    },

    addDownloadingItem({ commit, dispatch }, { dt, song_info }) {
        if (!state.downloading_list_initialized) {
            dispatch('getDownloadingItems');
        }
        // console.log('add downloading song is: ' + song_info.title)

        // console.log('add downloading list song is: ' + JSON.stringify(song_info))
        let song_id = commonFuns.getSongId(song_info);
        let downloading_item = {};
        downloading_item.status = download_status.DOWNLOAD_RESULT_NOT_START;
        downloading_item.percent = 0;
        downloading_item.getDownloadUrl = false; //是否经过song.down选链
        downloading_item.dt = dt;
        downloading_item.songid = song_id;
        downloading_item.identifier = song_id;
        downloading_item.downloading_path = '';
        downloading_item.downloadUrl = '';

        let song_str = JSON.stringify(song_info);
        downloading_item.song_info = JSON.parse(song_str);
        let authorLinksArr = serviceCommon.getAuthorsLinksArr(downloading_item.song_info.author, downloading_item.song_info.all_artist_id);
        downloading_item.song_info.authorLinksArr = authorLinksArr;

        downloading_item.status = download_status.DOWNLOAD_RESULT_WAITING; //waiting for downloading
        commit(types.ADD_DWONLOADING_ITEM, downloading_item);

        let downloadings = [];
        downloadings.push(downloading_item);
        dataBase.insert_downloadings(downloadings, function(ret) {
            // console.log('add downloading item result is: ' + ret);
        });

        let params = {};
        params.dlCount = 0;
        dispatch('getDownloadingCount', params);

        if (params.dlCount < constant.maxDownloadingCount) {
            dispatch('getDownloadUrlAndDown', { 'downloading_item': downloading_item, 'popupTips': false });
        }
    },

    deleteDownloadingItems({ commit, dispatch }, indexArray) {
        let idArrs = [];
        for (let i = 0; i < indexArray.length; i++) {
            let index = indexArray[i];
            let obj = state.downloading_items[index];
            let id = obj.identifier;
            idArrs.push(id);
        }
        commit(types.DEL_DOWNLOADING_ITEMS, indexArray);

        // console.log(idArrs)
        dataBase.del_downloadings(idArrs, function(del) {
            // commit(types.DEL_DOWNLOADING_ITEMS, del);
            for (let i = 0; i < del.length; i++) {
                let id = del[i];
                if (process.platform != 'darwin') {
                    dispatch('deleteP2pDownloadTask', id)
                }
                // for (let k = 0; k < state.downloading_items.length; k++) {
                //     let item = state.downloading_items[k];
                //     if (id == item.song_info.song_id) {
                //         del_identifier.push(item.identifier);
                //         if (process.platform != 'darwin') {
                //             dispatch('deleteP2pDownloadTask', item.identifier)
                //         }
                //     }
                // }
            }
            dispatch('autoStartWatingDownload');

            // commit(types.DEL_DOWNLOADING_ITEMS, del_identifier);
        });
    },

    startDownloadById({ commit, dispatch }, identifier) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier === identifier) {
                if (item.status === download_status.DOWNLOAD_RESULT_DOWNLOADING) {
                    return;
                }

                let json_str = JSON.stringify(item);
                let new_item = JSON.parse(json_str);
                new_item.status = download_status.DOWNLOAD_RESULT_WAITING;
                commit(types.UPDATE_DOWNLOADING_ITEM, new_item);

                // console.log('downloading percent is: ' + new_item.percent);
                let params = {};
                params.dlCount = 0;
                dispatch('getDownloadingCount', params);
                if (params.dlCount >= constant.maxDownloadingCount) {
                    commonFuns.createTips('最多只能同时下载' + constant.maxDownloadingCount + '个', 'warning');
                    return;
                }

                dispatch('getDownloadUrlAndDown', { 'downloading_item': new_item, 'popupTips': false });
            }
        }
    },

    startDownload({ commit, dispatch }, { index, popupTips }) {
        if (index < 0 || index >= state.downloading_items.length) {
            return;
        }

        let downloading_item = state.downloading_items[index];
        if (downloading_item.status === download_status.DOWNLOAD_RESULT_DOWNLOADING) {
            return;
        }

        let json_str = JSON.stringify(downloading_item);
        let new_item = JSON.parse(json_str);
        new_item.status = download_status.DOWNLOAD_RESULT_WAITING;
        commit(types.UPDATE_DOWNLOADING_ITEM, new_item);

        // console.log('downloading percent is: ' + downloading_item.percent);
        let params = {};
        params.dlCount = 0;
        dispatch('getDownloadingCount', params);
        if (params.dlCount >= constant.maxDownloadingCount) {
            commonFuns.createTips('最多只能同时下载' + constant.maxDownloadingCount + '个', 'warning');
            return;
        }

        dispatch('getDownloadUrlAndDown', { 'downloading_item': downloading_item, 'popupTips': popupTips });
    },

    stopDownload({ commit, dispatch }, index) {
        if (index < 0 || index >= state.downloading_items.length) {
            return;
        }

        let downloading_item = state.downloading_items[index];
        console.log('stop download status is: ' + downloading_item.status);
        if (downloading_item.status != download_status.DOWNLOAD_RESULT_DOWNLOADING &&
            downloading_item.status != download_status.DOWNLOAD_RESULT_WAITING) {
            return;
        }
        console.log('stopDownload, current percent is: ' + downloading_item.percent);

        let json_str = JSON.stringify(downloading_item);
        let new_item = JSON.parse(json_str);
        new_item.status = download_status.DOWNLOAD_RESULT_STOPPED;
        commit(types.UPDATE_DOWNLOADING_ITEM, new_item);

        if (downloading_item.identifier.length > 1) {
            if (process.platform == 'darwin') {
                DownloadMgr.stop(downloading_item.identifier);
            } else {
                dispatch('deleteP2pDownloadTask', downloading_item.identifier);
            }
        }
        dispatch('autoStartWatingDownload');
    },

    stopDownloadById({ commit, dispatch }, identifier) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier === identifier) {
                console.log('stop download status is: ' + item.status);
                if (item.status != download_status.DOWNLOAD_RESULT_DOWNLOADING &&
                    item.status != download_status.DOWNLOAD_RESULT_WAITING) {
                    return;
                }
                console.log('stopDownload, current percent is: ' + item.percent);

                let json_str = JSON.stringify(item);
                let new_item = JSON.parse(json_str);
                new_item.status = download_status.DOWNLOAD_RESULT_STOPPED;
                commit(types.UPDATE_DOWNLOADING_ITEM, new_item);

                if (new_item.identifier.length > 1) {
                    if (process.platform == 'darwin') {
                        DownloadMgr.stop(new_item.identifier);
                    } else {
                        dispatch('deleteP2pDownloadTask', new_item.identifier);
                    }
                }
            }
        }
        dispatch('autoStartWatingDownload');
    },

    startAllDownload({ commit, dispatch }) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.status === download_status.DOWNLOAD_RESULT_DOWNLOADING) {
                continue;
            }

            dispatch('startDownloadById', item.identifier);
        }
    },

    stopAllDownload({ commit, dispatch }) {
        commit(types.STOP_ALL_DOWNLOADINGS);
        dispatch('deleteAllDownloadTask');
    }
}

const mutations = {
    [types.GET_DOWNLOADING_LIST](state, items) {
        // console.log('downloading store initialized!');
        if (!state.downloading_list_initialized) {
            state.downloading_list_initialized = true;
            for (let i = 0; i < items.length; i++) {
                let obj = items[i];
                obj.status = download_status.DOWNLOAD_RESULT_STOPPED;
                let authorLinksArr = serviceCommon.getAuthorsLinksArr(obj.song_info.author, obj.song_info.all_artist_id);
                obj.song_info.authorLinksArr = authorLinksArr;
                // console.log(obj);

                state.downloading_items.push(obj);
            }
        }
    },
    [types.UPDATE_DOWNLOADING_PROGRESS](state, param) {
        let index = param.index;
        if (index < 0 || index >= state.downloading_items.length) {
            return;
        }
        let item = state.downloading_items[index];
        item.percent = param.percent;
    },
    [types.NOTIFY_DOWNLOADING_END](state, param) {
        let status = param.status;

        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier === param.identifier) {
                if (status === download_status.DOWNLOAD_RESULT_FINISHED) {
                    state.downloading_items.splice(i, 1);

                    item = null;
                } else {
                    item.status = status;
                }
            }
        }
    },
    [types.DEL_DOWNLOADING_ITEMS](state, indexArray) {
        // for (let i = 0; i < del_identifier.length; i++) {
        //     let identifier = del_identifier[i];
        //     for (let k = 0; k < state.downloading_items.length; k++) {
        //         let item = state.downloading_items[k];
        //         if (identifier == item.identifier) {
        //             state.downloading_items.splice(k, 1);
        //             if (process.platform == 'darwin') {
        //                 DownloadMgr.remove(item.identifier, true);
        //             }
        //         }
        //     }
        // }
        indexArray.sort();
        for (let i = 0; i < indexArray.length; i++) {
            let index = indexArray[i];
            index = index - i;
            if (process.platform == 'darwin') {
                // DownloadMgr.remove(item.identifier, true);
                //do nothing.............
            }
            state.downloading_items.splice(index, 1);
        }
    },
    [types.ADD_DWONLOADING_ITEM](state, new_item) {
        let isFind = false;
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier == new_item.identifier) {
                isFind = true;
                // state.downloading_items.splice(i, 1);
                // DownloadMgr.remove(item.identifier, true);
                break;
            }
        }
        // console.log('new downloading item is: ' + JSON.stringify(new_item));
        if (!isFind) {
            let authorLinksArr = serviceCommon.getAuthorsLinksArr(new_item.song_info.author, new_item.song_info.all_artist_id);
            new_item.song_info.authorLinksArr = authorLinksArr;
            state.downloading_items.push(new_item);
            console.log('new download item added: ' + new_item.identifier + ' title is: ' + new_item.song_info.title)
        }
        // console.log(new_item);
    },
    [types.UPDATE_DOWNLOADING_ITEM](state, new_item) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            let item = state.downloading_items[i];
            if (item.identifier == new_item.identifier) {
                // console.log(state.downloading_items);

                state.downloading_items.splice(i, 1, new_item);
                // console.log(state.downloading_items);
                break;
            }
        }
    },
    [types.STOP_ALL_DOWNLOADINGS](state) {
        for (let i = 0; i < state.downloading_items.length; i++) {
            state.downloading_items[i].status = download_status.DOWNLOAD_RESULT_STOPPED;
        }
        // let empty_array = [];
        // state.downloading_items = state.downloading_items.concat(empty_array);
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}