import * as Config from './config.js'
import Common from './common.js'

//接口
export default {
    getBangdanList(data) {
        let jsondata = {
            "method": "baidu.ting.billboard.billCategory",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getBangdanInfo(data) {
        let jsondata = {
            "method": "baidu.ting.billboard.billList",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}