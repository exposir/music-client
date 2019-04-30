// import path from 'path'
// import * as channelService from '../../../static/channel.js'
const fs = require('fs')
const path = require('path')

export default {
    get_app_channel() {
        let current_channel = 'guanwang';
        let config_file_path = './config.json'
        if (process.env.NODE_ENV === 'development') {
            config_file_path = path.join(process.cwd(), 'dist/config/config.json')
        }

        let contents = fs.readFileSync(config_file_path);
        let config_obj = JSON.parse(contents.toString());
        current_channel = config_obj.channel;
        if (!current_channel || current_channel.length <= 1) {
            current_channel = "guanwang";
        }

        let local_storage = window.localStorage;
        if (local_storage) {
            if (current_channel == 'passive') {
                current_channel = local_storage.getItem('appChannel')
                config_obj.channel = current_channel;
                fs.writeFileSync(config_file_path, JSON.stringify(config_obj));
            }
            local_storage.setItem('appChannel', current_channel);
        }
        return current_channel;
    }
}