import * as Config from './config.js'
import Common from './common.js'
export default {
    getSongLink(data, successCallback, failCallback) {
        // console.log(data);
        let e = Common.encryptStr({ "songid": data.songid, 'ts': +new Date() })
        data = Object.assign(data, { "e": e, "version": "1.0.0" })
        let jsondata = {
            "method": "baidu.ting.song.getInfos",
            "isNeedPassEncode": false,
            "data": data,
            "successCallback": successCallback,
            "failCallback": failCallback
        }
        Common.fetchAPI(jsondata)
    },
    getSongInfo(data, successCallback, failCallback) {
        let jsondata = {
            "method": "baidu.ting.song.baseInfo",
            "isNeedPassEncode": false,
            "data": data,
            "successCallback": successCallback,
            "failCallback": failCallback
        }
        Common.fetchAPI(jsondata)
    }
}