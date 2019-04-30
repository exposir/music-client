import * as types from '../mutation-types'
import dataBase from '../../dataoperation/websql/sqlstorage'
import recommendService from '../../service/recommendService'
import pathUtils from '../../pathUtils/pathUtils.js'

const fs = require('fs');
const shell = require('electron').shell;
const path = require('path');

//initial state
const state = {
    local_focusimages: [], //存储焦点图
}

const getters = {
    local_focusimages: () => state.local_focusimages,
}

const actions = {
    async storFocusimgs({ commit, dispatch }, params = {}) {
        try {
            const jsondata = await recommendService.getRecommendFocus({ 'num': 8 })
            if (jsondata.error_code == 22000) {
                const http = require('http');
                let arr = [];
                let info = jsondata.pic;
                // let focusimagesFolder = pathUtils.getFocusimagesFolder();
                for (let i = 0; i < info.length; i++) {
                    let data = info[i];
                    let index = i;
                    // console.log(JSON.stringify(data));
                    commit(types.STOR_LOCAL_FOCUS_IMAGES, { index, data })
                        // arr[i] = jsondata.pic[i].randpic;
                        // // let timestamp = Date.parse(new Date());
                        // let name = 'slide' + i + '.jpg';
                        // let filePath = path.join(focusimagesFolder, name);

                    // let stream = fs.createWriteStream(filePath);
                    // let clientReq = http.get(arr[i], function(res) {
                    //     res.on('data', function(data) {
                    //         stream.write(data);
                    //     }).on('end', function() {
                    //         stream.end();
                    //         let file_path = 'file://' + filePath;
                    //         let index = i;
                    //         commit(types.STOR_LOCAL_FOCUS_IMAGES, { index, file_path, info })
                    //     }).on('error', function(error) {
                    //         console.log('download focusimage failed! error is: ' + error);
                    //     });
                    // });
                    // clientReq.on('error', function(err) {
                    //     console.log('download focusimage failed! error is:' + err.message)
                    // })
                }
            }

        } catch (err) {

        }
    }
}

const mutations = {
    [types.STOR_LOCAL_FOCUS_IMAGES](state, params) {
        // params.info[params.index]['loaclpic'] = params.file_path;
        // console.log('111111111111111');
        // console.log(JSON.stringify(params.data));
        // console.log(JSON.stringify(params.index));
        state.local_focusimages[params.index] = params.data;

        let empty_arr = [];
        state.local_focusimages = state.local_focusimages.concat(empty_arr);
        // console.log(state.local_focusimages)
    },
}

export default {
    state,
    getters,
    actions,
    mutations
}