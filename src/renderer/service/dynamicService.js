import * as Config from './config.js'
import Common from './common.js'
export default {
    getDynamicMainList(data, successCallback, failCallback) {
        let jsondata = {
            "method": "baidu.ting.ugcfriend.getList",
            "isNeedPassEncode": true,
            "data": data,
            "successCallback": successCallback,
            "failCallback": failCallback
        }
        Common.fetchAPI(jsondata)
    }
}