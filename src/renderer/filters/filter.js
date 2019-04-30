import Vue from 'vue'
import underscore from 'underscore'
import * as utils from './utils.js'
//json object => json string
Vue.filter('toString', function(object) {
    return JSON.stringify(object);
})


Vue.filter('get_br', function(str) {
    return str = str.replace("\n", "<br/>")
})

//vue 解析不了该路径 暂时弃用
Vue.filter('getDefaultPic', (value) => {
    if (value) {
        return value;
    } else {
        return '../../common/images/default_song_pic.png'
    }
})