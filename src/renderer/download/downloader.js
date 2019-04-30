
import { unlink, existsSync } from "fs";
import mtd from "zeltice-mt-downloader";
import * as error_types from './downloadError.js'

let Download = function (filePath, url, identifier) {
    this.status = error_types.DOWNLOAD_RESULT_NOT_START;
    this.url = url;
    // console.log('download url is: ' + this.url);
    this.identifier = identifier; //callback的时候传递出去
    this.filePath = filePath;
    this.options = {};
    this.meta = {};
    this.downloader = null;
};

Download.prototype.setMeta = function (meta) {
    this.meta = meta;

    return this;
};

Download.prototype.setStatus = function (status) {
    this.status = status;

    return this;
};

//获取已经下载的文件大小
Download.prototype.getDownloadedSize = function () {
    if (!this.meta.threads) { return 0; }

    let downloaded = 0;
    this.meta.threads.forEach(function (thread) {
        downloaded += thread.position - thread.start;
    });

    return downloaded;
};

Download.prototype.getTotalFileSize = function () {
    if (!this.meta.threads) { return 0; }

    let totalSize = this.meta.threads[this.meta.threads.length - 1].end - this.meta.threads[0].start;
    return totalSize
};

Download.prototype.calDownloadPercent = function () {
    let downloaded = this.getDownloadedSize();
    let total = this.getTotalFileSize();

    let percent_float = downloaded * 100 / total;
    let percent = parseInt(percent_float);
    return percent;
};

Download.prototype._destroyThreads = function () {
    if (this.meta.threads) {
        this.meta.threads.forEach(function (i) {
            if (i.destroy) {
                i.destroy();
            }
        });
    }
};

Download.prototype.stop = function () {
    this.setStatus(error_types.DOWNLOAD_RESULT_STOPPED);

    this._destroyThreads();
};

Download.prototype.destroy = function () {
    let self = this;

    this._destroyThreads();

    this.setStatus(error_types.DOWNLOAD_RESULT_DESTORYED);

    let filePath = this.filePath;
    let tmpFilePath = filePath;
    if (!filePath.match(/\.mtd$/)) {
        tmpFilePath += '.mtd';
    } else {
        filePath = filePath.replace(new RegExp('(.mtd)*$', 'g'), '');
    }

    unlink(filePath, function () {
        unlink(tmpFilePath, function () {
            console.log('downloading file deleted! file path is: ' + filePath + 'tmpfilePath is: ' + tmpFilePath);
        });
    });
};

Download.prototype.start = function (progressCallBack, endCallBack) {
    let self = this;

    let options = {
        count: 1,
        method: 'GET',
        port: 80,
        timeout: 5000,
        range: '0-100',
        // headers: {cookies: 'abc=pqr;'},
        onStart: (meta) => {
            self.meta = meta;
            // console.log(meta);
            let downloadPercent = self.calDownloadPercent();
            console.log('download start percent is: ' + downloadPercent);
            self.setStatus(error_types.DOWNLOAD_RESULT_DOWNLOADING);

            setTimeout(function () {
                if (self.status == error_types.DOWNLOAD_RESULT_DOWNLOADING) {
                    let downloadPercent = self.calDownloadPercent();
                   progressCallBack(downloadPercent, self.identifier);

                    setTimeout(function () {
                        let downloadPercent = self.calDownloadPercent();
                        progressCallBack(downloadPercent, self.identifier);
                    }, 1000);
                }
            }, 1000);
        },
        onEnd: (err) => {
            if (err) {
                console.log('on end occurs! error is: ' + err + ' status is: ' + self.status);
                if (self.status != error_types.DOWNLOAD_RESULT_STOPPED &&
                    self.status != error_types.DOWNLOAD_RESULT_DESTORYED) {
                    self.setStatus(error_types.DOWNLOAD_RESULT_ERROR);
                }
            }
            else {
                self.setStatus(error_types.DOWNLOAD_RESULT_FINISHED);
            }
            endCallBack(err, self.status, self.identifier);
        }
    }

    if (existsSync(this.filePath)) {
        console.log('resume download! file name is: ' + this.filePath);
        this.downloader = new mtd(this.filePath, this.url, options);
    } else {
        this.downloader = new mtd(this.filePath, this.url, options);
    }
    this.downloader.start();

    return this;
};

export default Download;