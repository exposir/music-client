import * as Config from './config.js'
import Common from './common.js'

//接口
export default {
    getMVRecommendFocus(data) {
        let jsondata = {
            "method": "baidu.ting.plaza.recommIndex",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getSearchMV(data) {
        let jsondata = {
            "method": "baidu.ting.mv.searchMV",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRecommMV(data) {
        let jsondata = {
            "method": "baidu.ting.plaza.recommMV",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}