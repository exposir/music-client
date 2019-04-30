import * as Config from './config.js'
import Common from './common.js'

export default {
    getDownloadUrl(data, successCallback, failCallback) {
        let e = Common.encryptStr({ "songid": data.songid, 'ts': +new Date()})
        data = Object.assign(data, { "e": e, "version": "1.0.0" })
        // console.log('getDownloadurl data is: ' + JSON.stringify(data));
        let jsondata = {
            "method": "baidu.ting.song.down",
            "isNeedPassEncode": false,
            "data": data,
            "successCallback": successCallback,
            "failCallback": failCallback
        }
        Common.fetchAPI(jsondata)
    }
}