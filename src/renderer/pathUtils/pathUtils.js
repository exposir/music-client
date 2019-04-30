'use-strict'

const remote = require('electron').remote;
const path = require('path');
const fs = require('fs');

import settings from '../dataoperation/settings/settings'
import settingKey from '../dataoperation/settings/settingsKey'

function getAppdataFolder() {
    let folder = remote.app.getPath('appData');
    folder = path.join(folder, 'qianqianMusic');
    if (!fs.existsSync(folder)) {
        console.log('qianqianMusic folder mot exist, create it');
        fs.mkdirSync(folder);
    }

    return folder;
}

export default {
    getMusicFolder() {
        let folder = settings.get_setting_value(settingKey.downloadFolder);
        if (folder == null || folder == "" || typeof folder == "undefined") {
            folder = remote.app.getPath('music');
            folder = path.join(folder, 'qianqianMusic');
        }
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        return folder;
    },
    getLyricFolder() {
        let folder = this.getMusicFolder();;
        folder = path.join(folder, 'lyrics');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    },
    getFocusimagesFolder() {
        let folder = this.getMusicFolder();;
        folder = path.join(folder, 'focusimages');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    },
    getDownloadSongsFolder() {
        let folder = this.getMusicFolder();;
        folder = path.join(folder, 'songs');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    },
    getSongsImageFolder() {
        let folder = this.getMusicFolder();;
        folder = path.join(folder, 'images');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    },
    getTempDownloadFolder() {
        let folder = remote.app.getPath('temp');
        folder = path.join(folder, 'qianqianMusic');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    },
    getCacheFolder() {
        let folder = getAppdataFolder();
        folder = path.join(folder, 'cache');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    }
}