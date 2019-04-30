import * as Config from './config.js'
import Common from './common.js'
export default {
    getAlbumInfo(data) {
        let jsondata = {
            "method": "baidu.ting.album.getAlbumInfo",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}