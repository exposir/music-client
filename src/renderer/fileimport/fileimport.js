'use-strict'
import constant from '../constant.js'

const remote = require('electron').remote;
const fs = require('fs');
const path = require('path');
import worker from '../webworker/worker.js'

let support_music_type = ['mp3', 'wav', 'ogg', 'flac'];
let workerscript = 'static/worker/importworker.js'

function get_extension(filepath) {
    let patharr = filepath.split('.');
    let extension = '';
    if (patharr.length > 0) {
        extension = patharr[patharr.length - 1];
    }
    return extension;
}

function is_music_file(filepath) {
    let extension = get_extension(filepath);
    if (extension.length <= 0) return false;

    for (let i = 0; i < support_music_type.length; i++) {
        if (support_music_type[i] == extension) {
            return true;
        }
    }
    return false;
}

function make_data(files) {
    return [{ 'songlistid': constant.local_songlist_id, 'files': files }]
}

function read_directory(directory, callback) {
    fs.readdir(directory, function(err, files) {
        if (err) {
            console.log("read directory occurs error: " + err);
            return;
        }

        var list_song_arr = [];
        var list_dir_arr = [];
        files.forEach(function(filename) {
            let file_path = path.join(directory, filename);
            let stats = fs.statSync(file_path);
            if (stats.isFile()) {
                if (is_music_file(filename)) {
                    list_song_arr.push(file_path);
                }
            } else if (stats.isDirectory()) {
                list_dir_arr.push(file_path);
            }
        });

        if (list_song_arr.length > 0) {
            worker.init(workerscript, callback);
            worker.postMessage(make_data(list_song_arr));
        }
        if (list_dir_arr.length == 0) {
            return;
        }
        list_dir_arr.forEach(function(filename) {
            fs.stat(filename, function(err, stats) {
                if (err) throw err;
                if (stats.isDirectory()) {
                    read_directory(filename, callback);
                }
            });
        });
    });
}

export default {
    importsongfiles(callback, fileExts) {
        let dialog = remote.dialog;
        dialog.showOpenDialog({
            title: "导入歌曲",
            filters: [{ name: 'audios', extensions: fileExts }],
            properties: ['openFile', 'multiSelections']
        }, function(files) {
            if (files) {
                worker.init(workerscript, callback);
                worker.postMessage(make_data(files));
                //spliceFilesAndNotify(files, callback);
                // let song_array = generate_songinfo(files);
                // callback(song_array);
            }
        });
    },
    importdirectorysongfiles(callback, fileExts) {
        let dialog = remote.dialog;
        dialog.showOpenDialog({
            title: "导入歌曲",
            filters: [{ name: 'audios', extensions: fileExts }],
            properties: ['openDirectory']
        }, function(folders) {
            if (folders) {
                let music_folder = folders[0];
                read_directory(music_folder, callback);
            }
        });
    }
}