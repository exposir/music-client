'use-strict'

import * as Config from './config.js'
import Common from './common.js'

export default {
    getMvPlayUrl(obj, successCallback, failCallback) {
        let str = '';
        if(obj.song_id){
            str = 'song_id=' + obj.song_id
        }else if(obj.mv_id){
            str = 'mv_id=' + obj.mv_id
        }
        const url = Config.TING_API + 'method=baidu.ting.mv.playMV&from=qianqianmini&' + str;
        console.log(url)
        const requestData = Config.requestData;
        window.fetch(url, requestData).then(function (res) {
            if (res.ok) {
                return res.json();
            }
        }).then(function (data) {
            successCallback(data);
        }).catch(function (err) {
            failCallback(err);
        })
    }

}