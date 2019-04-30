const fs = require('fs');
const path = require('path');
const remote = require('electron').remote;
const http = require('http');

import pathUtils from '../pathUtils/pathUtils.js'
import lrcParser from './localLyricParser.js'
import searchLyric from '../service/searchLyricInfoService.js'


function searchLyricUrl(title, singer) {
    searchLyric.searchSongLyricInfos(title, singer, (jsonData) => {
        console.log(JSON.stringify(jsonData));
    }, () => {
        console.log('search lyric failed');
    })
}

function downloadLyricFile(url, localPath, callback) {
    console.log('lyric url is: ' + url);
    let file = fs.createWriteStream(localPath);

    // console.log(url)
    let clientReq = http.get(url, function(res) {
        // console.log(res)
        res.on('data', function(data) {
            // console.log(data)
            file.write(data);
        }).on('end', function() {
            file.end();
            callback(localPath);
        }).on('error', function(error) {
            console.log('download lyric failed, the error result is: ' + error);
            callback(null)
        });
    });
    clientReq.on('error', function(err) {
        console.log('download lyric failed, the error result is:' + err.message)
    })
}

export default {
    //url:歌词下载路径 
    //title & singer 歌曲名和歌手名
    //isLoad 是否需要从api获取歌词信息，如果这个参数为true, url不能为空
    getLyricFilePath(url, title, singer, isLoad, callback) {
        let lyricFolder = pathUtils.getLyricFolder();
        let lyricName = title + '-' + singer + '.lrc';
        if (singer.length <= 0) {
            lyricName = title + '.lrc';
        }
        let lyricPath = path.join(lyricFolder, lyricName);
        if (fs.existsSync(lyricPath)) {
            //如果本地有这个歌词文件，那么优先使用本地
            //lrcParser.getLyricContent(title, singer);
            callback(lyricPath);
            return;
        }

        if (isLoad && (typeof url != 'undefined') && url.length > 0) {
            //直接从api读取数据
            downloadLyricFile(url, lyricPath, callback);
        } else {
            //搜索歌词,如果有多个结果默认使用第一个
            // searchLyricUrl(title, singer);
            callback(null)
        }
    }
}