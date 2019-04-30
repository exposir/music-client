import * as Config from './config.js'
import Common from './common.js'
//接口
export default {
    // 查询签约
    getAgreeInfo(data) {
        let jsondata = {
            "method": "baidu.ting.pay.agreeInfo",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    // 取消签约
    withholdDisagree(data) {
        let jsondata = {
            "method": "baidu.ting.pay.withholdDisagree",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}