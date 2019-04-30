import * as Config from './config.js'
import Common from './common.js'

//接口
export default {
    getRecommendFocus(data) {
        let jsondata = {
            "method": "ting.baidu.plaza.getFocusPic",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommendAlbum(data) {
        // console.log(data)
        let jsondata = {
            "method": "baidu.ting.plaza.getRecommendAlbum",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommendAlbumLabel() {
        let data = {};
        let jsondata = {
            "method": "baidu.ting.plaza.getRecAlbumLabel",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommendBangdan(data) {
        let jsondata = {
            "method": "baidu.ting.billboard.billList",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommendGedan(data) {
        let jsondata = {
            "method": "baidu.ting.diy.gedanHot",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommendMV(data) {
        let jsondata = {
            "method": "baidu.ting.plaza.recomm",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommendDaily(data) {
        let jsondata = {
            "method": "baidu.ting.song.userRecSongList",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getJXGedan(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.getBaseInfo",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}