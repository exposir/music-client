import macAddress from 'getmac'
import md5 from 'md5'
import http from 'http';

function serializeJSON(jsondata) {
    let str = "";
    for (let k in jsondata) {
        str += '&' + k + '=' + encodeURIComponent(jsondata[k]);
    }
    return str;
}

export default {
    clickReport(data) {
        const params = serializeJSON(data);
        macAddress.getMac(function(err, macAddr) {
            if (err) {
                console.log('get mac address error');
                return;
            }

            // console.log("macAddr: ", macAddr);
            const deviceId = md5(macAddr);
            // console.log("deviceId: ", deviceId);
            const version = require('electron').app.getVersion();
            const url = 'http://click.qianqian.com/v.gif?pid=337&ci=' +
                deviceId + '&ver=' + version + params;
            // console.log('report service in main url:' + url)
            let req = http.get(url, function(res) {
                res.on('error', function(err) {
                    console.log('report service in main result:' + err.message)
                })
            })
            req.on('error', function(err) {
                console.log('report service in main result:' + err.message)
            })
        })
    }
}