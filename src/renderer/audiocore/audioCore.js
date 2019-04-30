'use-strict'
import pathUtils from '../pathUtils/pathUtils.js'

let audioCore = null;
let player = null;
let empty_download_op = false; //因为暂停所有下载的过程比较缓慢，可能会导致卡顿，所以这里做个特殊的处理
let initCount = 0;
let stopCount = 0;

let downloadtasks = [];

//play callback
function OpenCallback(player, result) {
    console.log('open callback result is: ' + result);

    if (0 == result) {
        if (player) {
            // console.log(eventBus)
            eventBus.$emit('playingstart');
            player.Play();
        }
    } else {
        console.log('playsong occurs error');
        eventBus.$emit('playingerror');
    }
}

function SeekCallback(player, result) {
    console.log('seek callback result is: ' + result);

    if (0 == result) {
        console.log('seek success')
    } else {
        console.log('seek error')
    }
}

function PlayCompleteCallback(player, result) {
    console.log('song playing complete');
    player.Stop();
    eventBus.$emit('playingended');
}

function ErrorCallback(player, result) {
    console.log('playing occurs error, error is: ' + result);
    player.Stop();
    eventBus.$emit('playingerror');
}

function CacheCompleteCallback(player, result) {
    console.log('CacheCompleteCallback result:' + result);
}

function StatusChangeCallback(player, result) {
    console.log('StatusChangeCallback result:' + result);
    // buffering
    if (4 == result) {
        if (player != null) {
            console.log('StatusChangeCallback buffering');
            // player.Pause();
        }
    } else if (5 == result) {
        if (player != null) {
            console.log('StatusChangeCallback bufferend');
            // player.Play();
        }
    } else {}

}

function getDownloadTaskIndex(task) {
    let index = -1;
    for (let i = 0; i < downloadtasks.length; i++) {
        let download_task = downloadtasks[i];
        if (task.songid == download_task.songid) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        console.log('can not find download task');
    }
    return index;
}

//download callback
function ProgressChangedCallback(task, cur, total) {
    if (empty_download_op) {
        return;
    }

    let index = getDownloadTaskIndex(task);
    if (index == -1) {
        return;
    }
    let percent = Math.round((cur / total) * 100);

    // console.log('current download progress index is: ' + index + ' percent is: ' + percent)
    eventBus.$emit('downloadprogresschanged', { 'songid': task.songid, 'percent': percent })
}

function CacheErrorCallback(task, error) {
    let index = getDownloadTaskIndex(task);
    if (index == -1) {
        return;
    }

    console.log('download occurs error: ' + error)
    eventBus.$emit('downloaderror', { 'songid': task.songid, 'error': error })
}

function CacheFinishedCallback(task, cached, path) {
    let index = getDownloadTaskIndex(task);
    if (index == -1) {
        return;
    }
    let download_task = downloadtasks[index];
    let fileName = download_task.fileName;
    console.log('CacheFinishedCallback cached:' + cached + ' path ' + path);

    eventBus.$emit('downloadfinished', { 'songid': task.songid, 'cached': cached, 'fileName': fileName, 'path': path });
}

function isDownloadTaskExist(songid) {
    let index = -1;
    for (let i = 0; i < downloadtasks.length; i++) {
        let download_task = downloadtasks[i];
        if (songid == download_task.songid) {
            index = i;
            break;
        }
    }

    return index;
}

export default {
    initAudiCore(param) {
        if (process.platform == 'darwin' || audioCore != null) {
            return;
        }

        console.log('audiocore init begin.....')
        audioCore = require('./audiocore.node')
        console.log(audioCore)

        audioCore.InitCommonModule(param.cacheFolder, param.cacheSize, 337);
        console.log('audiocore init ended......')
            // console.log('process address is: ' + process.cwd());
    },

    initPlayer() {
        if (process.platform == 'darwin') {
            return;
        }

        player = null;
        player = new audioCore.SoundCore();
        player.SetOpenCallback(OpenCallback);
        player.SetSeekCallback(SeekCallback);
        player.SetPlayCompleteCallback(PlayCompleteCallback);
        player.SetErrorCallback(ErrorCallback);
        player.SetStatusChangeCallback(StatusChangeCallback);
        player.SetDiscreteDataCompleteCallback(CacheCompleteCallback);
        // initCount++;
        // console.log('111111111-' + initCount + '-1111111111111')
    },

    uninitAudioCore() {
        if (process.platform == 'darwin') {
            return;
        }

        console.log('audiocore unint begin.....')
        if (player) {
            player.Stop();
        }
        player = null;
        audioCore.UnInitCommonModule();
        console.log('audiocore unint ended.....')
    },

    newDownload(url, songid, fileName, isStart) {
        if (process.platform == 'darwin') {
            return;
        }
        if (!isStart) {
            return;
        }
        let index = isDownloadTaskExist(songid);

        if (index != -1) {
            console.log('p2p task already exists, new download need release it..............')
            let task = downloadtasks[index];
            if (task.p2p_task) {
                task.p2p_task.StopTask();
                task.p2p_task = null;
            }
            task = null;
            downloadtasks.splice(index, 1);
        }
        empty_download_op = false;

        let task = {};
        let p2p_task = new audioCore.DownloadTask(url);
        task.songid = songid;
        task.fileName = fileName;
        p2p_task.SetProgressChangedCallback(ProgressChangedCallback);
        p2p_task.SetCacheErrorCallback(CacheErrorCallback);
        p2p_task.SetCacheFinishedCallback(CacheFinishedCallback);
        p2p_task.songid = songid;
        task.p2p_task = p2p_task;

        console.log('new download task:' + fileName + ' songid is: ' + task.songid)
        downloadtasks.push(task);
        task.p2p_task.StartTask();
    },

    deleteDownloadTask(songid) {
        if (process.platform == 'darwin') {
            return;
        }

        // console.log('delete p2p download task................')
        for (let i = 0; i < downloadtasks.length; i++) {
            let task = downloadtasks[i];

            if (task.songid == songid) {
                if (task.p2p_task) {
                    console.log('delete p2p download task: ' + task.fileName)
                    task.p2p_task.StopTask();
                    task.p2p_task = null;
                }

                task = null;
                downloadtasks.splice(i, 1);
            }
        }
    },

    deleteAllDownloadTask() {
        empty_download_op = true;
        for (let i = 0; i < downloadtasks.length; i++) {
            let task = downloadtasks[i];
            if (task.p2p_task) {
                console.log('delete p2p download task: ' + task.fileName)
                task.p2p_task.StopTask();
                task.p2p_task = null;
            }

            task = null;
            downloadtasks.splice(i, 1);
        }
        console.log('delete all download task.....................')
    },

    playingSong(url, enablePredeploy) {
        if (process.platform == 'darwin') {
            return;
        }

        this.initPlayer();
        audioCore.EnablePredeploy(enablePredeploy);
        player.Open(url, "", -1, 0, -1)
    },
    play() {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            player.Play();
            eventBus.$emit('playing-start');
        }
    },
    pause() {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            player.Pause();
        }
    },
    stop() {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            player.Stop();
            // stopCount++;
            // console.log('2222222222-' + stopCount + "-22222222222222")
        }
    },
    getPlayPosition() {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            return player.GetPosition();
        }

        return 0;
    },
    setPlayPosition(position) {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            player.SetPosition(position);
        }
    },
    getDuration() {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            return player.GetDuration();
        }
        return 0;
    },
    setVolume(volume) {
        if (process.platform == 'darwin') {
            return;
        }
        if (player) {
            player.SetVolume(parseInt(volume));
        }
    },
    setMute() {
        if (process.platform == 'darwin') {
            return;
        }

        if (player) {
            player.SetVolume(0);
        }
    },
    getSupportFiles() {
        if (process.platform == 'darwin') {
            return '';
        }

        let playerext = new audioCore.SoundCore();
        let support_types = '';
        if (playerext) {
            support_types = playerext.FormatSupportedFileExts();
            // console.log(support_types)
            playerext = null;
        }

        return support_types;
    },
    getAudioTagInfo(files, tags) {
        if (process.platform == 'darwin') {
            return '';
        }

        console.log(files)
        if (player) {
            let tagInfo = {};
            for (let i = 0; i < files.length; i++) {
                tagInfo = player.GetAudioTagInfoFromFile(files[i]);
                tags.push(tagInfo);
            }
        } else {
            let playerext = new audioCore.SoundCore();
            let tagInfo = {};
            if (playerext) {
                for (let i = 0; i < files.length; i++) {
                    tagInfo = playerext.GetAudioTagInfoFromFile(files[i]);
                    console.log(tagInfo)
                    tags.push(tagInfo);
                }
            }
            playerext = null;
        }
    },
    setCacheFolder(cacheFolder) {
        if (process.platform == 'darwin') {
            return;
        }

        if (audioCore) {
            audioCore.SetCacheDirectory(cacheFolder);
        }
    },
    setCacheSize(size) {
        if (process.platform == 'darwin') {
            return;
        }

        if (audioCore) {
            audioCore.SetMaxCacheSize(size);
        }
    }
}