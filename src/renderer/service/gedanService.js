import * as Config from './config.js'
import Common from './common.js'
export default {
    getChannelList(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.getChannels",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getGendanList(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.getChanneldiy",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getGedanBasicInfo(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.getBaseInfo",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getGedanSongList(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.listSong",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    addList(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.addSongList",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    delList(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.delList",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    delListSongs(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.delListSongs",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    addListSongs(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.addSongToDiy",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    addSongListAndSongs(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.addSongListOnce",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    modifyListInfo(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.editDiy",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }

}