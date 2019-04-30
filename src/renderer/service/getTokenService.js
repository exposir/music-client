import * as Config from './config.js'
import Common from './common.js'
//接口
export default {
    // 获取token
    getTokenInfo(data,successCallback,failCallback) {
        let jsondata = {
            "apiurl": "https://passport.taihe.com/v2/api/userquery",
            "data": data,
            "successCallback": successCallback,
            "failCallback": failCallback
        }
        return Common.directFetchAPI(jsondata)
    },
}