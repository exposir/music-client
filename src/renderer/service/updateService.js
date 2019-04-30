'use strict'

import channel_getter from './channel_getter.js'
import * as Config from './config.js'
let ipcRenderer = require('electron').ipcRenderer;

async function getUpdateInfo() {
    let channel = channel_getter.get_app_channel();
    let version = require('electron').remote.app.getVersion();
    console.log('check update channel is: ' + channel + '  version is: ' + version);

    let arg = 'version=' + version + '&channel=' + 'passive';
    let checkUrl = 'https://api.qianqian.com/crossplatformupgrade/check?'
        // let checkUrl = 'http://192.168.218.107:8001/crossplatformupgrade/check?'
        // if (process.env.NODE_ENV === 'development') {
        //     arg = 'version=' + '1.0.0' + '&channel=' + 'passive';
        //     checkUrl = 'http://192.168.218.107:8001/crossplatformupgrade/check?'
        // }
    checkUrl += arg;
    console.log(checkUrl);

    let result = await window.fetch(checkUrl, Config.requestDataNoCache)
    if (result.ok) {
        return result.json();
    }
}

export default {
    async checkUpdate() {
        let data = await getUpdateInfo();
        console.log(data)
        if (data) {
            let arg = {}
            arg.desc = "update";
            arg.url = data.url;
            arg.version = data.name;
            arg.detail = data.notes;
            ipcRenderer.send('asynchronous-message', arg);
        }
    }
}