
import downloader from './downloader.js'
import { existsSync, unlinkSync } from "fs";

let DownloadManager = function () {
    this.downloaders = [];
};

//new_download:是否要强制重新下载
//identifier:标识calllback通知的是哪个下载
DownloadManager.prototype.download = function (url, filePath, identifier, new_download, progressCallBack, endCallBack) {
    let dl_file = filePath + '.mtd';
    url = url.toString(); //make sure url is string

    if (existsSync(filePath)) {
        unlinkSync(filePath);
    }
    
    if (existsSync(dl_file)) {
        console.log('dl_file exist is: ' + dl_file);
        if (new_download) {
            console.log('begin a new download and del old file!')
            unlinkSync(dl_file);
        } else {
            filePath = dl_file;
        }
    }

    let dl = new downloader(filePath, url, identifier);
    this.downloaders.push(dl);
    dl.start(progressCallBack, endCallBack);

    return dl;
};

DownloadManager.prototype.getDownloaderCount = function(){
    // console.log('DownloadManager.prototype.getDownloaderCount')
    return this.downloaders.length;
};

DownloadManager.prototype.stop = function (identifier) {
    return this.removeDownloadByIdentifier(identifier, false);
};

DownloadManager.prototype.remove = function (identifier, isDelFile) {
    return this.removeDownloadByIdentifier(identifier, isDelFile);
};

DownloadManager.prototype.removeDownloadByIdentifier = function (identifier, isDelFile) {
    let dlFound = false;

    for (let i = 0; i < this.downloaders.length; i++) {
        let dl = this.downloaders[i];

        if (dl.identifier === identifier) {
            if (isDelFile) {
                dl.destroy();
            } else {
                dl.stop();
            }

            this.downloaders.splice(i, 1);

            dl = null;
            dlFound = true;

            break;
        }
    }

    return dlFound;
};

export default DownloadManager;