'use strict'
import channel_getter from '../../service/channel_getter.js'
import commonFuns from './common.js';
import { remote } from 'electron'

let payment_state = '1';
let tip_user_download = '1';

async function fetchData() {
    let requestParam = {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json;charset=UTF-8"
        }
    };

    let url = 'http://api.qianqian.com/clientconfig/query';
    // let url = 'http://192.168.218.107:8001/clientconfig/query';
    try {
        let res = await window.fetch(url, requestParam);
        if (res.ok) {
            return res.json();
        }
        if (res.status === 403) {
            // no permission
            console.log('client config permission_limit');
        }
    } catch (err) {
        throw new Error(err);
    }
}

async function get_client_configs() {
    console.log('current version is: ' + remote.app.getVersion())
    let channel = channel_getter.get_app_channel();
    console.log('current channel is: ' + channel);

    let data_array = await fetchData();
    if (data_array && Array.isArray(data_array)) {
        for (let i = 0; i < data_array.length; i++) {
            let data = data_array[i];
            if (data.config_type == 'close_payment_version') {
                let close_payment_version = data.config_value;
                if (channel != 'mas_app') {
                    payment_state = '1';
                } else {
                    let versionCheck = commonFuns.checkVersion(close_payment_version);
                    if (versionCheck == 'Eq') {
                        payment_state = '0';
                    }
                }
                console.log('current payment state is: ' + payment_state);
            } else if (data.config_type == 'tip_user_download') {
                tip_user_download = data.config_value;
            }
        }
    }
}

get_client_configs()

export default {
    get_payment_state() {
        return payment_state;
    },
    tip_user_download() {
        get_client_configs()
        return tip_user_download;
    }
}