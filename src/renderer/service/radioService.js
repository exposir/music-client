import * as Config from './config.js'
import Common from './common.js'
export default {
    getRadioCategory(data){
        let jsondata = {
            "method": "baidu.ting.scene.getRadioCategory",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRadioAllScene(data){
        let jsondata = {
            "method": "baidu.ting.scene.getRadioAllScene",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getRadioSongList(data) { 
        let jsondata = {
            "method": "baidu.ting.scene.getSceneSong",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    getPrivateRadio(data){
        let jsondata = {
            "method": "baidu.ting.scene.getRecSceneSong",
            "data": data,
        }
        return Common.asyncFetchData(jsondata)
    }
}