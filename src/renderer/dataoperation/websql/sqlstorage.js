'use strict'

import constant from "../../constant.js"

let db = null;

function get_current_db() {
    db = openDatabase("songlist.db", "1.0", "songlist", 4096 * 4096);
    // console.log(db);
    if (!db) {
        alert("websql can not be support!");
        return false;
    }
    return true;
}

function add_data(listid, json_songinfo, callback) {
    let sql_statement = "INSERT OR REPLACE INTO " + listid +
        " (songid, songtitle, author, album, detail) " +
        "VALUES (?,?,?,?,?)";

    let json_obj = JSON.parse(json_songinfo);

    //存储的时候把列表的属性也添加进去,但是当前正在播放列表不能
    //当前正在播放列表的歌曲其实是属于其他的列表，如果修改了ID就会找不到原来的id
    // if (listid !== constant.current_play_list_id) {
    //     json_obj.listid = listid;
    //     json_songinfo = JSON.stringify(json_obj);
    // }

    let songid = '';
    if (json_obj.hasOwnProperty('song_id')) {
        songid = json_obj.song_id.toString();
    } else if (json_obj.hasOwnProperty('songid')) {
        songid = json_obj.songid.toString();
    }

    let author = '';
    if (json_obj.hasOwnProperty('author')) {
        author = json_obj.author;
    }

    let album_title = '';
    if (json_obj.hasOwnProperty('album_title')) {
        album_title = json_obj.album_title;
    }

    db.transaction(function(tx) {
        tx.executeSql(
            sql_statement, [songid,
                json_obj.title,
                author,
                album_title,
                json_songinfo
            ],
            function(tx, result) {
                if (typeof callback != 'undefined') {
                    callback(true);
                }
            },
            function(tx, error) {
                if (typeof callback != 'undefined') {
                    callback(false);
                }
                console.log("insert data failed, error is: " + error);
            });
    });
}

export function insert_songinfo(listid, json_songinfo, callback) {
    if (!Array.isArray(json_songinfo) || json_songinfo.length <= 0) {
        console.log("songinfo can not be empty");
        return;
    }
    if (!get_current_db()) {
        return;
    }
    if (!listid || listid.length <= 0) {
        listid = constant.history_list_id;
    }
    let sql_statement = "CREATE TABLE IF NOT EXISTS " + listid +
        "(songid TEXT PRIMARY KEY, \
          songtitle TEXT,\
          author TEXT,\
          album TEXT,\
          detail TEXT)";
    //判断是否需要创建一个table
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [], function(tx, result) {
            for (let i = 0; i < json_songinfo.length; i++) {
                //添加属性表示该歌曲属于哪一个表
                let json_str = JSON.stringify(json_songinfo[i]);
                add_data(listid, json_str, callback);
            }
        }, function(tx, error) {
            console.log("create table failed, table name is: " + listid);
        });
    });
}

export function query_all(listid, callback) {
    if (!listid || listid.length <= 0) {
        listid = constant.history_list_id;
    }
    let sql_statement = "SELECT * FROM " + listid;
    if (!get_current_db()) {
        return;
    }
    db.transaction(function(tx) {
        let json_obj_array = [];
        tx.executeSql(sql_statement, [], function(ts, data) {
            if (data) {
                for (let i = 0; i < data.rows.length; i++) {
                    let obj = JSON.parse(data.rows.item(i).detail);
                    //用来指出这首歌曲来源于哪个列表,当前播放列表的不能添加这个属性，
                    //否则下次就无法判断该歌曲属于哪个列表
                    if (listid !== constant.current_play_list_id) {
                        obj.listid = listid;
                    }
                    json_obj_array.push(obj);
                }
                callback(listid, json_obj_array);
            }
        }, function(tx, err) {
            callback(listid, json_obj_array);
        });
    });
}

export function query_by_songid(listid, songid, callback) {
    if (!listid || listid.length <= 0) {
        listid = constant.history_list_id;
    }
    if (!get_current_db()) {
        return;
    }
    if (typeof songid == 'number') {
        songid = songid.toString();
    }
    let sql_statement = "SELECT * FROM " + listid + " WHERE songid = ?";
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [songid], function(ts, data) {
            if (data) {
                let json_obj_array = [];
                for (var i = 0; i < data.rows.length; i++) {
                    var obj = JSON.parse(data.rows.item(i).detail);
                    if (listid !== constant.current_play_list_id) {
                        obj.listid = listid;
                    }
                    json_obj_array.push(obj);
                }
                callback(listid, json_obj_array);
            }
        });
    });
}

export function query_by_name(listid, querytext, callback) {
    if (!listid || listid.length <= 0) {
        listid = constant.history_list_id;
    }
    if (!get_current_db()) {
        return;
    }
    let sql_statement = "SELECT * FROM " + listid + " WHERE songtitle like ? OR author like ? OR album like ?";
    let querytext_format = "%" + querytext + "%";
    db.transaction(function(tx) {
        let json_obj_array = [];
        tx.executeSql(sql_statement, [querytext_format, querytext_format, querytext_format], function(ts, data) {
            if (data) {
                for (let i = 0; i < data.rows.length; i++) {
                    let obj = JSON.parse(data.rows.item(i).detail);
                    if (listid !== constant.current_play_list_id) {
                        obj.listid = listid;
                    }
                    json_obj_array.push(obj);
                }
                callback(listid, json_obj_array);
            }
        }, function(ts, error) {
            console.log('query list failed, id is: ' + listid);
            callback(listid, json_obj_array);
        });
    });
}

export function delete_by_songid(listid, array_id, complete) {
    if (!listid || listid.length <= 0) {
        listid = constant.history_list_id;
    }

    if (!get_current_db()) {
        return;
    }

    let sql_statement = "DELETE FROM " + listid + " WHERE songid = ?";
    let nLoop = 0;
    let del_success = [];
    for (let i = 0; i < array_id.length; i++) {
        db.transaction(function(tx) {
            let id = array_id[i].toString();
            tx.executeSql(sql_statement, [id], function(tx, result) {
                nLoop++;
                del_success.push(id);
                if (nLoop === array_id.length) {
                    if (typeof complete != 'undefined') {
                        complete(del_success);
                    }
                }
            }, function(tx, error) {
                console.log('del failed, id is: ' + id);
                nLoop++;
                if (nLoop === array_id.length) {
                    if (typeof complete != 'undefined') {
                        complete(del_success);
                    }
                }
            });
        });
    }
}

export function update_by_songid(listid, songid, json_songinfo) {
    if (!listid || listid.length <= 0) {
        listid = constant.history_list_id;
    }
    if (!get_current_db() || !songid) {
        return;
    }
    //表示该歌曲属于哪一个表
    songid = songid.toString();
    // console.log(json_songinfo)
    let songinfo_str = JSON.stringify(json_songinfo);
    let sql_statement = "UPDATE " + listid + " SET songtitle = ?, author = ?, album = ?, detail = ? WHERE songid = ?";
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [json_songinfo.title,
            json_songinfo.author,
            json_songinfo.album_title,
            songinfo_str,
            songid
        ], function(tx, result) {}, function(tx, error) {
            console.log("update songinfo failed, id is:" + songid);
        });
    });
}

export function delete_songlist(listid) {
    if (!listid || listid.length <= 0) {
        listid = "default_list";
    }
    if (!get_current_db()) {
        return;
    }
    let sql_statement = "drop table " + listid;
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [], function(tx, result) {}, function(tx, error) {});
    });
}

export default { insert_songinfo, query_all, query_by_songid, query_by_name, delete_by_songid, update_by_songid, delete_songlist }