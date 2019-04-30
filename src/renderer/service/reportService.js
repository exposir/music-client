import * as Config from './config.js'
import macAddress from 'getmac'
import md5 from 'md5'
import os from 'os'
import channel_getter from './channel_getter.js'
import { remote } from 'electron'

function serializeJSON(jsondata) {
    let str = "";
    for (let k in jsondata) {
        str += '&' + k + '=' + encodeURIComponent(jsondata[k]);
    }
    return str;
}

async function fetchAPI(url) {
    try {
        await window.fetch(url, Config.requestDataNoCache)
    } catch (error) {
        console.log(error)
    }
}

export default {
    clickReport(data) {
        // console.log('current channel is: ' + channel_getter.get_app_channel())
        // console.log(data);
        const params = serializeJSON(data);
        macAddress.getMac(function(err, macAddr) {
            if (err) {
                console.log('get mac address error');
                return;
            }

            // console.log("macAddr: ", macAddr);
            const deviceId = md5(macAddr);
            // console.log("deviceId: ", deviceId);
            const version = remote.app.getVersion();
            const platform = os.platform() + '_' + os.arch(); // usually returns darwin_64
            const url = Config.CLICK_REPORT + 'ci=' + deviceId + '&channel=' + channel_getter.get_app_channel() + '&ver=' + version + '&system=' + platform + params;
            // console.log('report url is: ' + url);
            fetchAPI(url);
        })

    }
}