import * as Config from './config.js'
import Common from './common.js'

//接口
export default {
    creatFeedback(data,successCallback,failCallback) {
        let jsondata = {
            "method": "POST",
            "apiurl": "feedback/create",
            "data": data,
            "successCallback": successCallback,
            "failCallback": failCallback
        }
        return Common.qianqianFetchAPI(jsondata)
    }
}