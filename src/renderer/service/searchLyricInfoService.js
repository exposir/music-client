import * as Config from './config.js'
import Common from './common.js'
export default {
    searchSongLyricInfos(title, singer, successCallback, failedCallback) {
        let queryContent = title
        if (singer.length > 0) {
            queryContent = queryContent + '$$' + singer;
        }
        let data = {'query': queryContent, 'type': 2 };
        let jsondata = {
            "method": "baidu.ting.search.lrcpic",
            "isNeedPassEncode": true,
            "data": data,
            "successCallback": successCallback,
            "failCallback": failedCallback
        }
        Common.fetchAPI(jsondata)
    }
}