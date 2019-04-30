import * as Config from './config.js'
import Common from './common.js'

//接口
export default {
    getSingerList(data) {
        let jsondata = {
            "method": "baidu.ting.artist.getList",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getSingerInfo(data) {
        let jsondata = {
            "method": "baidu.ting.artist.getInfo",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getSingerSonglist(data) {
        let jsondata = {
            "method": "baidu.ting.artist.getSongList",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getSingerAlbumList(data) {
        let jsondata = {
            "method": "baidu.ting.artist.getAlbumList",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}