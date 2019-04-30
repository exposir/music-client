import * as Config from './config.js'
let CryptoJS = require("crypto-js");
let md5 = require('md5')

export default {
    serializeJSON(jsondata) {
        let str = "";
        for (let k in jsondata) {
            str += '&' + k + '=' + encodeURIComponent(jsondata[k]);
        }
        return str;
    },
    // Qianqian fetchapi
    qianqianFetchAPI(paramsJson) {
        let isNeedPassEncode = (typeof paramsJson.isNeedPassEncode != 'undefined') ? paramsJson.isNeedPassEncode : false
        let method = paramsJson.method
        let data = paramsJson.data ? paramsJson.data : '';
        let version = '1' + require('electron').remote.app.getVersion(); // 为解决API的列表歌曲置灰，直接在大版本号字符串前加1
        let platform = require('os').platform();
        data = Object.assign({ "from": "qianqianmini", "version": version, "platform": platform }, data);
        let apiparam = ""
        if (isNeedPassEncode) {
            apiparam = this.serializeJSON(this.aesPassEncod(data))
        } else {
            apiparam = this.serializeJSON(data)
        }
        const url = Config.QIANQIAN_API + paramsJson.apiurl;
        const qianqianRequestData = Config.qianqianRequestData;
        
        let successCallback = paramsJson.successCallback
        let failCallback = paramsJson.failCallback

        if(method && method == 'POST'){
            qianqianRequestData.method = 'POST'
        }
        qianqianRequestData.body = JSON.stringify(data)
        
        window.fetch(url, qianqianRequestData).then(function(res) {
            if (res.ok) {
                return res.json();
            }
        }).then(function(data) {
            successCallback(data);
        }).catch(function(err) {
            failCallback(err);
        })
    },
    fetchAPI(paramsJson) {
        let isNeedPassEncode = (typeof paramsJson.isNeedPassEncode != 'undefined') ? paramsJson.isNeedPassEncode : false
        let method = paramsJson.method
        let data = paramsJson.data ? paramsJson.data : '';
        let version = '1' + require('electron').remote.app.getVersion(); // 为解决API的列表歌曲置灰，直接在大版本号字符串前加1
        let platform = require('os').platform();
        data = Object.assign({ "from": "qianqianmini", "version": version, "platform": platform }, data);
        let apiparam = ""
        if (isNeedPassEncode) {
            // console.log('aes param is: ' + data);
            apiparam = this.serializeJSON(this.aesPassEncod(data))
        } else {
            apiparam = this.serializeJSON(data)
        }
        const url = Config.TING_API + 'method=' + method + apiparam;
        const requestData = Config.requestData;

        let successCallback = paramsJson.successCallback
        let failCallback = paramsJson.failCallback

        // console.log('fetch api is: ' + url);
        window.fetch(url, requestData).then(function(res) {
            if (res.ok) {
                return res.json();
            }
        }).then(function(data) {
            successCallback(data);
        }).catch(function(err) {
            failCallback(err);
        })
    },
    async asyncFetchData(paramsJson) {
        let isNeedPassEncode = (typeof paramsJson.isNeedPassEncode != 'undefined') ? paramsJson.isNeedPassEncode : false
        let method = paramsJson.method
        let data = paramsJson.data ? paramsJson.data : '';
        let platform = require('os').platform();
        let version = '1' + require('electron').remote.app.getVersion(); // 为解决API的列表歌曲置灰，直接在大版本号字符串前加1
        data = Object.assign({ "from": "qianqianmini", "version": version, "platform": platform }, data);
        let apiparam = ""
        if (isNeedPassEncode) {
            apiparam = this.serializeJSON(this.aesPassEncod(data))
        } else {
            apiparam = this.serializeJSON(data)
        }
        const url = Config.TING_API + 'method=' + method + apiparam;
        const requestData = Config.requestData;
        try {
            // console.log('fetch url is:' + url)
            let res = await window.fetch(url, requestData)
            if (res.ok) {
                return res.json();
            }
        } catch (err) {
            console.log(err)
        }
    },
    aesPassEncod(jsonData) {
        var timestamp = Math.floor(new Date().getTime() / 1000);
        var privateKey = md5('baidu_taihe_music_secret_key' + timestamp),
            privateKey = privateKey.substr(8, 16),
            iv = privateKey;

        var arrData = [],
            strData = '';
        for (var key in jsonData) {
            arrData.push(key);
        }
        arrData.sort();
        for (var i = 0; i < arrData.length; i++) {
            var key = arrData[i];
            strData += (i === 0 ? '' : '&') + key + '=' + encodeURIComponent(jsonData[key]);
        }

        var JsonFormatter = {
            stringify: function(cipherParams) {
                // create json object with ciphertext
                var jsonObj = {
                    ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
                };
                // optionally add iv and salt
                if (cipherParams.iv) {
                    jsonObj.iv = cipherParams.iv.toString();
                }
                if (cipherParams.salt) {
                    jsonObj.s = cipherParams.salt.toString();
                }
                return jsonObj;
            },

            parse: function(jsonStr) {
                // parse json string
                var jsonObj = JSON.parse(jsonStr);
                // extract ciphertext from json object, and create cipher params object
                var cipherParams = CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
                });
                // optionally extract iv and salt
                if (jsonObj.iv) {
                    cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
                }
                if (jsonObj.s) {
                    cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
                }
                return cipherParams;
            }
        };

        //加密
        var key = CryptoJS.enc.Utf8.parse(privateKey); //密钥
        var iv = CryptoJS.enc.Utf8.parse(privateKey);
        var encrypted = CryptoJS.AES.encrypt(strData, key, { iv: iv, blockSize: 16, mode: CryptoJS.mode.CBC, format: JsonFormatter });
        var ciphertext = encrypted.toString().ct; //加密串
        var sign = md5('baidu_taihe_music' + ciphertext + timestamp); //签名

        var jsonRet = {
            timestamp: timestamp,
            param: ciphertext,
            sign: sign
        };
        return jsonRet;
    },
    encryptStr(jsonData) {
        let privateKey = '1131021386755796',
            iv = '1231021386755796';
        privateKey = md5(privateKey)
        privateKey = privateKey.toUpperCase()
        privateKey = privateKey.substr(16)

        var JsonFormatter = {
            stringify: function(cipherParams) {
                // create json object with ciphertext
                var jsonObj = {
                    ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
                };
                // optionally add iv and salt
                if (cipherParams.iv) {
                    jsonObj.iv = cipherParams.iv.toString();
                }
                if (cipherParams.salt) {
                    jsonObj.s = cipherParams.salt.toString();
                }
                return jsonObj;
            },

            parse: function(jsonStr) {
                // parse json string
                var jsonObj = JSON.parse(jsonStr);
                // extract ciphertext from json object, and create cipher params object
                var cipherParams = CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
                });
                // optionally extract iv and salt
                if (jsonObj.iv) {
                    cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
                }
                if (jsonObj.s) {
                    cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
                }
                return cipherParams;
            }
        };

        let arrData = [],
            strData = '';
        for (let key in jsonData) {
            arrData.push(key);
        }
        arrData.sort();
        for (let i = 0; i < arrData.length; i++) {
            let key = arrData[i];
            strData += (i === 0 ? '' : '&') + key + '=' + encodeURIComponent(jsonData[key]);
        }
        privateKey = CryptoJS.enc.Utf8.parse(privateKey); //密钥
        iv = CryptoJS.enc.Utf8.parse(iv);
        var encrypted = CryptoJS.AES.encrypt(strData, privateKey, { iv: iv, blockSize: 16, mode: CryptoJS.mode.CBC, format: JsonFormatter });
        var ciphertext = encrypted.toString().ct;
        return ciphertext
    },
    getAuthorsLinksArr(names, ids) {
        if (!names) { return false }
        let authorLinksArr = []
        if (!ids) {
            let namesArray = names.indexOf(',') > -1 ? names.split(',') : [names]
            namesArray.forEach((name, index) => {
                let item = {}
                item.artist_name = name
                item.artist_id = 0
                authorLinksArr.push(item)
            })
            return authorLinksArr
        } else {
            ids = ids.toString();
            let namesArray = names.indexOf(',') > -1 ? names.split(',') : [names]
            let idsArray = ids.split(',')
            namesArray.forEach((name, index) => {
                let item = {}
                item.artist_name = name
                item.artist_id = idsArray[index]
                authorLinksArr.push(item)
            })

            return authorLinksArr
        }
    },
    computedSongHotLong(songList, maxhot) {
        const hotarr = []

        if (Array.isArray(songList) && songList.length > 0) {
            songList.forEach((value, index) => {
                if (maxhot == 0 || value.hot < 0) {
                    value.hotlong = 0
                } else {
                    value.hotlong = parseInt((value.hot * 140) / maxhot)
                }
            })
            return songList;
        }
    },
    // 直接访问api--url不需要拼接 
    directFetchAPI(paramsJson) {
        let method = paramsJson.method
        let data = paramsJson.data ? paramsJson.data : '';
        let version = '1' + require('electron').remote.app.getVersion(); // 为解决API的列表歌曲置灰，直接在大版本号字符串前加1
        let platform = require('os').platform();
        data = Object.assign({ "from": "qianqianmini", "version": version, "platform": platform }, data);
        
        const qianqianRequestData  = {
            method: 'GET',
            mode: 'cors',
            credentials: "include",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
            }
        };
        if(method && method == 'POST'){
            qianqianRequestData.method = 'POST'
        }

        // qianqianRequestData.body = JSON.stringify(data)
        const url = paramsJson.apiurl;
        let successCallback = paramsJson.successCallback
        let failCallback = paramsJson.failCallback
        window.fetch(url, qianqianRequestData).then(function(res) {
            if (res.ok) {
                return res.json();
            }
        }).then(function(data) {
            successCallback(data);
        }).catch(function(err) {
            failCallback(err);
        })
    }, 


}