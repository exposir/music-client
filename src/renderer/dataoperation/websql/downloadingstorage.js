'use strict'

import constant from "../../constant.js"

let db = null;

function get_current_db() {
    db = openDatabase("songlist.db", "1.0", "songlist", 4096 * 4096);
    if (!db) {
        alert("websql can not be support!");
        return false;
    }
    return true;
}

function add_data(downloading_item, callback) {
    let listid = constant.downloading_songlist_id;
    let sql_statement = "INSERT OR REPLACE INTO " + listid +
        " (songid, detail) " +
        "VALUES (?,?)";

    // console.log('new downloading is: ' + downloading_item);
    let json_obj = JSON.parse(downloading_item);

    let songid = json_obj.songid;
    // console.log('insert new downloading id is: ' + songid);

    db.transaction(function(tx) {
        tx.executeSql(
            sql_statement, [songid,
                downloading_item
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
            });
    });
}

export function query_all_downloadings(callback) {
    let listid = constant.downloading_songlist_id;
    let sql_statement = "SELECT * FROM " + listid;
    if (!get_current_db()) {
        return;
    }
    db.transaction(function(tx) {
        let downloading_items = [];
        tx.executeSql(sql_statement, [], function(ts, data) {
            if (data) {
                for (let i = 0; i < data.rows.length; i++) {
                    let item = JSON.parse(data.rows.item(i).detail);
                    downloading_items.push(item);
                }
                callback(downloading_items);
            }
        }, function(tx, err) {
            callback(downloading_items);
        });
    });
}

export function insert_downloadings(downloadings, callback) {
    if (!Array.isArray(downloadings) || downloadings.length <= 0) {
        return;
    }
    if (!get_current_db()) {
        return;
    }
    let listid = constant.downloading_songlist_id;
    let sql_statement = "CREATE TABLE IF NOT EXISTS " + listid +
        "(songid TEXT PRIMARY KEY, \
          detail TEXT)";
    //判断是否需要创建一个table
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [], function(tx, result) {
            for (let i = 0; i < downloadings.length; i++) {
                let json_str = JSON.stringify(downloadings[i]);
                add_data(json_str, callback);
            }
        }, function(tx, error) {
            console.log("create table failed, table name is: " + listid);
        });
    });
}

export function update_downloading(downloading_item) {
    if (!get_current_db()) {
        return;
    }
    //表示该歌曲属于哪一个表
    let json_str = JSON.stringify(downloading_item);
    let songid = downloading_item.songid;
    let sql_statement = "UPDATE " + constant.downloading_songlist_id + " SET detail = ? WHERE songid = ?";
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [json_str,
            songid
        ], function(tx, result) {}, function(tx, error) {
            console.log('update downloading_item failed!');
        });
    });
}

export function del_downloadings(array_id, complete) {
    if (!get_current_db()) {
        return;
    }
    let sql_statement = "DELETE FROM " + constant.downloading_songlist_id + " WHERE songid = ?";
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
                // console.log('del failed, id is: ' + id);
                nLoop++;
            });
        });
    }
}

export function del_all_downloadings() {
    if (!get_current_db()) {
        return;
    }
    let sql_statement = "drop table " + constant.downloading_songlist_id;
    db.transaction(function(tx) {
        tx.executeSql(sql_statement, [], function(tx, result) {}, function(tx, error) {});
    });
}

export default { query_all_downloadings, insert_downloadings, update_downloading, del_downloadings, del_all_downloadings }