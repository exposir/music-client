const fs = require('fs');
import domAction from '../../utils/domAction'
import reportService from '../../service/reportService';
import constant from '../../constant';
export default {
    createTips(str, type, time) {
        time = time ? time : 1000;
        type = type ? type : "hide";
        let tipsDoms = document.querySelectorAll('.tipsbox')
        if (tipsDoms) {
            tipsDoms.forEach((itemDom, index) => {
                document.body.removeChild(itemDom)
            })

        }

        let div = document.createElement("div");
        div.setAttribute("class", "tipsbox twocenter");
        div.innerHTML = '<span><i class="' + type + '"></i>' + str + '</span>';


        document.body.appendChild(div);


        // console.log(domAction.getStyle(div, 'width'))
        let div_width = parseFloat(domAction.getStyle(div, 'width'))
        let marginLeft = -(div_width / 2)
            // console.log(marginLeft)
        domAction.setStyle(div, 'margin-left', marginLeft + 'px')


        setTimeout(function() {
            div.setAttribute("class", "tipsbox twocenter hide");
        }, time);

        setTimeout(function() {
            try {
                document.body.removeChild(div);
            } catch (err) {

            }

        }, time + 300);
    },
    confirmDialog(title, content, sureconte, callback) {
        title ? title : "";
        sureconte ? sureconte : "确认";
        let str = '<div class="confirmDialogBox twocenter" id="confirmDialogBox"><div class="detailbox">' +
            '<div class="content twocenter"><span class="twocenterimg"></span>' + content + '</div>' +
            '<div class="btnsbox"><span class="surebtn">' + sureconte + '</span><span class="close cancelbtn">取消</span></div>' +
            '</div></div>';
        $("body").append(str);
        $("#confirmDialogBox .surebtn").on("click", function() {
            $("#confirmDialogBox").remove();
            callback(1);
            return;
        });
        $("#confirmDialogBox .cancelbtn").on("click", function() {
            $("#confirmDialogBox").remove();
            callback(0);
            return;
        });
        $("#confirmDialogBox .closebtn").on("click", function() {
            $("#confirmDialogBox").remove();
            callback(0);
            return;
        });
    },
    getStrByts(str, needflag, maxanum) {
        if (needflag) {
            needflag = true;
        } else {
            needflag = false;
        }
        if (maxanum) {
            maxanum = maxanum;
        } else {
            maxanum = 170;
        }
        let count = 0;
        let strAndEllipsis = "";
        let numi = 0;
        let flag = false;

        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) >= 0x4e00 && str.charCodeAt(i) <= 0x9fa5) { //判断是否是汉字,汉字的话,在utf-8中占3个字节
                count += 2;
            } else {
                count += 1; //其他的都是字母或者数字,占据一个字节
            }
            if (count >= maxanum) {
                numi = i;
                strAndEllipsis = str.substring(0, (numi - 3)) + '...';
                flag = true;
                return { "needflag": flag, "str": strAndEllipsis }
            }
        }
        if (count < maxanum) {
            strAndEllipsis = str;
            flag = false;
        }
        // if(needflag){
        //     return flag;
        // }else{
        //     return strAndEllipsis;
        // }
        return { "needflag": flag, "str": strAndEllipsis }
    },
    getStringLength(str, maxanum = 20) {
        let count = 0;
        for (let i = 0; i < str.length; i++) {
            // if (str.charCodeAt(i) >= 0x4e00 && str.charCodeAt(i) <= 0x9fa5) { //判断是否是汉字,汉字的话,在utf-8中占3个字节
            //     count += 2;
            // } else {
            count += 1; //其他的都是字母或者数字,占据一个字节
            // }

        }

        if (count >= maxanum) {
            return false
        } else {
            return true
        }
    },
    getSongId(songInfo) {
        let songid = "";
        // console.log('songinfo is: ' + JSON.stringify(songInfo))
        if (!songInfo || typeof songInfo === 'undefined') {
            return songid;
        }
        if (songInfo.hasOwnProperty('songid')) {
            songid = songInfo.songid;
        } else if (songInfo.hasOwnProperty('song_id')) {
            songid = songInfo.song_id;
        }

        return songid;
    },
    isSongOffline(songInfo) {
        if (!songInfo) {
            return true;
        }

        let copy_type = 1;
        let del_status = 0;
        if (songInfo.hasOwnProperty('copy_type')) {
            copy_type = parseInt(songInfo.copy_type);
        }
        if (songInfo.hasOwnProperty('del_status')) {
            del_status = parseInt(songInfo.del_status);
        }

        if (copy_type == 0 ||
            del_status == 1) {
            return true;
        }

        return false;
    },
    isSongCanDownload(songInfo) {
        let songid = this.getSongId(songInfo);
        // console.log('song info is: ' + JSON.stringify(songInfo))
        if (songid.length <= 0 || songid.indexOf('_local') !== -1) {
            return false;
        }

        // if (songInfo.hasOwnProperty('listid')) {
        //     let listid = songInfo.listid;
        //     if (listid == constant.downloaded_songlist_id) {
        //         return false;
        //     }
        // }

        let copy_type = 1;
        let del_status = 0;
        if (songInfo.hasOwnProperty('copy_type')) {
            copy_type = parseInt(songInfo.copy_type);
        }
        if (songInfo.hasOwnProperty('del_status')) {
            del_status = parseInt(songInfo.del_status);
        }

        if (copy_type == 0 ||
            copy_type == 3 ||
            del_status == 1) {
            // console.log('copy_type is: ' + copy_type + ' del status is: ' + del_status)
            return false;
        }

        if (!songInfo.title || songInfo.title.length <= 0) {
            return false;
        }

        return true;
    },
    isLocalSong(songInfo) {
        let songid = this.getSongId(songInfo);
        if (songid.length <= 0) {
            return false;
        }

        if (songid.indexOf('_local') !== -1) {
            return true;
        }

        if (songInfo.hasOwnProperty('file_path')) {
            if (fs.existsSync(songInfo.file_path)) {
                return true;
            }
        }

        return false;
    },
    getSongBitrates(songInfoObj, param) {
        let file_bitrates = [];
        if (songInfoObj) {
            if (songInfoObj.hasOwnProperty('all_rate')) {
                file_bitrates = songInfoObj.all_rate.split(',');
            } else if (songInfoObj.hasOwnProperty('bitrate')) {
                file_bitrates = songInfoObj.bitrate.split(',');
            }
        }
        if (file_bitrates.length <= 0) {
            console.log('this song do not has bitrate info: ' + JSON.stringify(this.songInfoObj));
            return;
        }

        for (let i = 0; i < file_bitrates.length; i++) {
            if (file_bitrates[i] === 'flac') {
                param.sq.push(file_bitrates[i]);
                file_bitrates.splice(i, 1);
                break;
            }
        }

        file_bitrates = file_bitrates.sort((a, b) => b - a);

        for (let i = 0; i < file_bitrates.length; i++) {
            let val_int = parseInt(file_bitrates[i]);
            let rate = file_bitrates[i];
            if (val_int > 320) {
                param.sq.push(rate);
            } else if (val_int > 128 && val_int <= 320) {
                param.hq.push(rate);
            } else {
                param.normal.push(rate);
            }
        }
    },
    deepCopyObj(obj) {
        let json_str = JSON.stringify(obj);
        let new_obj = JSON.parse(json_str);
        return new_obj;
    },
    getSelectSongArray(index_arr, data) {
        let songArray = [];
        for (let i = 0; i < index_arr.length; i++) {
            let index = index_arr[i];
            if (index < 0 || index >= data.length) {
                continue;
            }

            let song = data[index];
            songArray.push(song);
            // console.log(songArray)
        }

        return songArray;
    },
    calculateAttr() {
        let clientX = event.currentTarget.offsetLeft
        let clientY = event.clientY + 24
            // let clientY = event.currentTarget.offsetTop
        if (location.href.indexOf('bangdan') > 1) {
            clientX += 360
        } else if (location.href.indexOf('gedan') > 1) {
            clientX += 358
        } else if (location.href.indexOf('singer') > 1) {
            clientX += 342
        } else if (location.href.indexOf('album') > 1) {
            clientX += 352
        } else {
            clientX += 156
        }
        let clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
        if (clientWidth > 1306) {
            clientX += (clientWidth - 1306) / 2;
        }
        let data = {
            'clientX': clientX,
            'clientY': clientY
        }
        return data;
    },
    //判断版本号
    checkVersion(str) {
        let tmp = str.toString().replace(/v/, '');
        let requireVer = tmp.split('.');
        let currentVer = require('electron').remote.app.getVersion().toString().replace(/v/, '').split('.');
        //判断两个版本号长度，为较短的一个末位补0
        let Max_len = Math.max(requireVer.length, currentVer.length);
        if (requireVer.length != Max_len) {
            requireVer.push("0");
        }
        if (currentVer.length != Max_len) {
            currentVer.push("0");
        }
        // 判断当前版本号与输入版本号大小关系
        for (let i = 0; i < Max_len; i++) {
            if (parseInt(currentVer[i]) > parseInt(requireVer[i])) {
                return 'Gt'
            } else if (parseInt(currentVer[i]) < parseInt(requireVer[i])) {
                return 'Lt'
            }
        }
        return 'Eq'
    },
    // 设置缓存
    setCookie(name, value, expire, path) {
        expire = expire || 10 * 12 * 30 * 24 * 60 * 60 * 1000;
        console.log(expire);
        path = path || '/';
        let date = new Date();
        date.setTime(date.getTime() + expire);
        document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=" + path;
    },
    // 读取缓存
    getCookies(name) {
        let re = "(?:; )?" + encodeURIComponent(name) + "=([^;]*);?";
        re = new RegExp(re);
        if (re.test(document.cookie)) {
            return decodeURIComponent(RegExp.$1);
        }
        return '';
    },
    sortBitrateArray(file_bitrates) {
        let has_flac = false;
        for (let i = 0; i < file_bitrates.length; i++) {
            if (file_bitrates[i] == 'flac') {
                has_flac = true;
                file_bitrates.splice(i, 1);
                break;
            }
        }

        let sort_rates = file_bitrates.sort((a, b) => {
            a = parseInt(a);
            b = parseInt(b);
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        });

        if (has_flac) {
            sort_rates.push('flac');
        }
        // console.log(sort_rates)

        return sort_rates;
    },
    getSpecifyRate(rates_array, isMax) {
        // console.log(rates_array);
        let sort_array = this.sortBitrateArray(rates_array);
        if (isMax) {
            let index = rates_array.indexOf(sort_array[sort_array.length - 1]);
            return index;
        } else {
            let index = rates_array.indexOf(sort_array[0]);
            return index;
        }

    },
    //提取选链结果的播放地址，并排序,返回要播放的地址
    extractSongFileLink(songInfoJson, isVip) {
        let playLinkInfo = {};
        let fileLinkUrl = songInfoJson.songurl.url;
        if (fileLinkUrl.length <= 0) {
            console.log('can not find any show link in api result');
            return playLinkInfo;
        }

        let bitrates = songInfoJson.songinfo.bitrate;
        let file_bitrates = bitrates.split(',');
        if (file_bitrates.length <= 0) {
            console.log('can not find bitrate info in api result');
        }
        file_bitrates = this.sortBitrateArray(file_bitrates);
        // console.log('bitrate is: ' + file_bitrates);

        let aac_rates = [];
        let aac_indexs = [];

        let mp3_rates = [];
        let mp3_indexs = [];
        for (let i = 0; i < fileLinkUrl.length; i++) {
            let linkInfo = fileLinkUrl[i];
            // console.log(linkInfo)
            let format = linkInfo.file_format;
            // console.log('file format is: ' + format)
            let rate = linkInfo.file_bitrate;

            if (process.platform == 'darwin' && format == 'flac') {
                //mac不支持flac播放
                continue;
            }

            if (format == 'flac' && fileLinkUrl.length > 1) {
                //目前的播放核心播放flac还是有些问题，暂时屏蔽掉
                continue;
            }

            if (format == 'aac') {
                aac_rates.push(rate);
                aac_indexs.push(i)
            } else {
                mp3_rates.push(rate);
                mp3_indexs.push(i);
            }
        }

        let playIndex = 0;
        if (aac_rates.length > 0) {
            let index = 0;
            if (isVip) {
                index = this.getSpecifyRate(aac_rates, true);
            } else {
                index = this.getSpecifyRate(aac_rates, false);
            }
            playIndex = aac_indexs[index];
        } else {
            // console.log(mp3_rates)
            // console.log(mp3_indexs)
            let index = 0;
            if (isVip) {
                index = this.getSpecifyRate(mp3_rates, true);
            } else {
                let sort_array = this.sortBitrateArray(mp3_rates);
                let index = sort_array.findIndex(function(element) {
                    let int_val = parseInt(element);
                    return int_val <= 128;
                });
                if (index == -1) {
                    index = 0;
                }
            }
            playIndex = mp3_indexs[index];
        }

        let fileLinkInfo = fileLinkUrl[playIndex];
        playLinkInfo.file_bitrate = fileLinkInfo.file_bitrate;
        playLinkInfo.file_format = fileLinkInfo.file_format;
        playLinkInfo.show_link = fileLinkInfo.show_link;
        playLinkInfo.file_link = fileLinkInfo.file_link;
        playLinkInfo.format = fileLinkInfo.file_format;
        playLinkInfo.bitrate = fileLinkInfo.file_bitrate;
        playLinkInfo.hash = fileLinkInfo.hash;
        playLinkInfo.size = fileLinkInfo.file_size;

        return playLinkInfo;
    },
    getExtraPlayInfo(playLinkInfo) {
        //PC版的播放核心需要的信息如下
        //p2p://size:4682264:format:mp3:bitrate:128:priority:1:hash:e035c612f4a59c9ac551eff854c9cf01868cce0f:url:http://xxx.mp3 
        let extraInfo = '';
        if (playLinkInfo.hasOwnProperty('size')) {
            console.log('size is: ' + playLinkInfo.size)
            extraInfo += 'size:' + playLinkInfo.size + ':';
        }
        if (playLinkInfo.hasOwnProperty('format') && playLinkInfo.format.length > 1) {
            extraInfo += 'format:' + playLinkInfo.format + ':';
            console.log('format is: ' + playLinkInfo.format)
        }
        if (playLinkInfo.hasOwnProperty('bitrate')) {
            extraInfo += 'bitrate:' + playLinkInfo.bitrate + ':';
            console.log('bitrate is: ' + playLinkInfo.bitrate)
        }
        if (playLinkInfo.hasOwnProperty('hash') && playLinkInfo.hash.length > 1) {
            extraInfo += 'priority:1:';
            extraInfo += 'hash:' + playLinkInfo.hash + ':';
        }
        console.log('extra show link is: ' + extraInfo);

        if (extraInfo.length > 1) {
            extraInfo = 'p2p://' + extraInfo;
        }

        return extraInfo;
    },
    formatDownloadUrl(bitrateInfo) {
        let url = '';
        if (bitrateInfo.hasOwnProperty('file_size')) {
            url += 'size:' + bitrateInfo.file_size + ':';
        }
        if (bitrateInfo.hasOwnProperty('file_extension') && bitrateInfo.file_extension.length > 1) {
            url += 'format:' + bitrateInfo.file_extension + ':';
        }
        if (bitrateInfo.hasOwnProperty('file_bitrate')) {
            url += 'bitrate:' + bitrateInfo.file_bitrate + ':';
        }
        if (bitrateInfo.hasOwnProperty('hash') && bitrateInfo.hash.length > 1) {
            url += 'priority:2:';
            url += 'hash:' + bitrateInfo.hash + ':';
        }

        if (url.length > 1) {
            url = 'p2p://' + url;
        }

        url += 'url:' + bitrateInfo.file_link;

        // console.log('download url is: ' + url);
        return url;
    },
    extrctFileNameFromPath(filepath) {
        let pos = filepath.lastIndexOf("\\");
        let fileName = filepath.substring(pos + 1);
        return fileName;
    },
    isSongArrayHasLossless(songArray) {
        if (songArray.length <= 0) {
            return false;
        }

        let hasLossless = false;
        for (let i = 0; i < songArray.length; i++) {
            let item = songArray[i];
            // console.log('current song is: ' + item.title);
            let biaoshi = item.biaoshi;
            // console.log('current song biaoshi is: ' + biaoshi);
            let biaoshi_Arr = biaoshi.split(',');
            // console.log(biaoshi_Arr);
            if (biaoshi_Arr.indexOf('lossless') > -1) {
                hasLossless = true;
                break;
            }
        }
        return hasLossless;
    },
    // 百度统计
    crmStatistics(source, tagName, type) {
        let btnType = type ? type : 'click'
            //crm埋点
        reportService.clickReport({
            'type': btnType,
            'page': source,
            'pos': tagName
        });
    }
}