'use-strict'
const fs = require('fs');
const path = require('path');
import pathUtils from '../pathUtils/pathUtils.js'

const splitReg = /\n|\r/;
const arReg = /\[ar:(.+)\]/;
const tiReg = /\[ti:(.+)\]/;
const alReg = /\[al:(.+)\]/;
const byReg = /\[by:(.+)\]/;
const offsetReg = /\[offset:.+\]/;
const timeReg = /\[\d+:\d+(\.\d+)?\]/g;

function dealTime(time) {
    let arr = time.split(':');
    if (arr.length != 2) {
        //console.log('time format is ilega, time is: ' + time);
        return 0;
    }

    let first_val = parseInt(arr[0]);
    let last = arr[1];
    let arr_dot = last.split('.');
    if (isNaN(first_val) || arr_dot.length > 2) {
        //console.log('time format is ilega, time is: ' + time);
        return 0;
    }

    // let is_frist_minute = (arr_dot.length == 2);
    // if (arr_dot.length == 1 && arr_dot) 
    let second_time = parseInt(arr_dot[0]);
    if (isNaN(second_time)) {
        console.log('time format is ilega, time is: ' + time);
        return 0;
    }
    let third_time = 0;
    if (arr_dot.length == 2) {
        let milsecond = parseInt(arr_dot[1]);
        if (isNaN(milsecond)) {
            console.log('time format is ilega, time is: ' + time);
            return 0;
        } else {
            third_time = milsecond;
        }
    }

    let total_time = 0; //总的时间，单位毫秒
    if (arr_dot.length == 2) {
        if (second_time >= 60 || third_time >= 1000) {
            console.log('time format is ilega, time is: ' + time);
            return 0;
        }
        total_time = first_val * 60 * 1000;
        total_time += second_time * 1000;
        total_time += third_time * 1000 / 100;
    } else {
        total_time = first_val * 60 * 1000;
        total_time += second_time * 1000;
    }

    return total_time;
}

function getTimeAndText(text_line, lrc_obj) {
    // console.log(text_line)
    let match = text_line.match(timeReg);
    if (!match || match.length <= 0) {
        //至少应该能匹配到一个时间
        console.log('')
        return false;
    }

    let len = text_line.length;
    let last_time_index = text_line.lastIndexOf("]");
    //console.log('last time index is :' + last_time_index + 'text is: ' + text_line);
    if (last_time_index >= len) {
        console.log('this text has only time, content is: ' + text_line);
        return false;
    }

    let lyric_text = '';
    if (last_time_index < len) {
        lyric_text = text_line.substring(last_time_index + 1, len);
    }

    //每一行可能会有多个时间，但是文本只有一个，所以这两个时间的文本是一样的
    for (let i = 0; i < match.length; i++) {
        let time_str = match[i];
        time_str = time_str.substring(1, time_str.length - 1);
        let time_milsecond = dealTime(time_str);
        if (time_milsecond > 0) {
            //还需要加上offset才可以
            time_milsecond += lrc_obj.offset;

            let obj = {};
            // console.log('time is: ' + time_milsecond + ' lyric is: ' + lyric_text)
            obj.time = time_milsecond;
            obj.lyric = lyric_text;
            lrc_obj.array_lyric.push(obj);
        }
    }

    return true;
}

export default {
    getLyricContent(title, singer, callback) {
        let lyricFolder = pathUtils.getLyricFolder();
        let lyricName = title + '-' + singer + '.lrc';
        if (singer.length <= 0) {
            lyricName = title + '.lrc';
        }
        let lyricPath = path.join(lyricFolder, lyricName);
        if (!fs.existsSync(lyricPath)) {
            console.log('lyric file not exist!');
            callback(null);
            return;
        }
        console.log('lrc file is: ' + lyricPath)

        fs.readFile(lyricPath, 'utf-8', function(err, data) {
                if (err) {
                    console.log('read lrc file failed, error is: ' + err);
                    callback(null);
                    return;
                }

                let lrc_obj = {}; //js对象是引用类型？这个貌似需要验证一下
                lrc_obj.title = title;
                lrc_obj.author = singer;
                lrc_obj.album = '';
                lrc_obj.by = '';
                lrc_obj.offset = 0;
                lrc_obj.isPureText = false;
                lrc_obj.array_lyric = []; //数组中的每一个元素都是一个json对象,格式为{'time':100,'lyric':'geci'}
                lrc_obj.array_pure_text = []; //纯文本歌词数组

                let array_text = data.split(splitReg);

                for (let i = 0; i < array_text.length; i++) {
                    let text_line = array_text[i];
                    let len = text_line.length;
                    if (len <= 0) {
                        //console.log('this line is not ilegal, content is: ' + text_line);
                        continue;
                    }

                    if (text_line.match(timeReg) != null) {
                        // console.log(text_line);
                        getTimeAndText(text_line, lrc_obj);
                    } else if (text_line.match(tiReg) != null) {
                        //貌似不用处理
                        lrc_obj.title = title;
                    } else if (text_line.match(arReg) != null) {
                        lrc_obj.author = singer;
                    } else if (text_line.match(alReg) != null) {
                        lrc_obj.album = '';
                    } else if (text_line.match(byReg) != null) {
                        let by = '[by:';
                        let sub_len = by.length;
                        let content = text_line.substring(sub_len + 1, len - 2);
                        lrc_obj.by = content;
                    } else if (text_line.match(offsetReg) != null) {
                        let by = '[offset:';
                        let sub_len = by.length;
                        let content = text_line.substring(sub_len + 1, len - 2);
                        let offset = parseInt(content);
                        if (isNaN(offset)) {
                            lrc_obj.offset = 0;
                        } else {
                            lrc_obj.offset = offset;
                        }
                    } else {
                        lrc_obj.array_pure_text.push(text_line);
                    }
                }
                // console.log(lrc_obj);
                if (lrc_obj.array_lyric.length > 1) {
                    lrc_obj.array_lyric.sort(function(a, b) {
                        return a.time - b.time;
                    })
                }

                if (lrc_obj.array_pure_text.length > 1 && lrc_obj.array_lyric.length <= 0) {
                    lrc_obj.isPureText = true;
                    console.log('this song lyric is pure text!');
                }
                // console.log(lrc_obj);
                callback(lrc_obj);
            })
            //fs.close();
    }
}