import * as Config from './config.js'
import Common from './common.js'
export default {
    suggestion(data) {
        let jsondata = {
            "method": "baidu.ting.search.catalogSug",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    searchMerge(data) {
        let jsondata = {
            "method": "baidu.ting.search.merge",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}