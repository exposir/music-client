importScripts('md5.js')

function basename(path) {
    let name = path.replace(/\\/g, '/');
    var i = name.lastIndexOf('/') + 1;
    return name.slice(i);
}

function generate_songinfo(files, local_songlist_id) {
    let songinfo_array = [];
    if ((typeof (files) == "undefined") ||
        (files.length <= 0)) {
        console.log("not import any song files!");
        return songinfo_array;
    }

    for (let i = 0; i < files.length; i++) {
        const filepath = files[i];
        let filebasename = basename(filepath);
        let pos = filebasename.lastIndexOf('.');
        let filename = filebasename;
        if (pos > 0)
            filename = filebasename.substr(0, pos);

        //console.log("import file name is: " + filename + "arr is: "+ arr);
        let id_md5 = md5(filepath) + "_local";
        console.log('local song id is: ' + id_md5 + ' name is: ' + filename);
        let songinfo = {};
        songinfo["song_id"] = id_md5;
        songinfo["title"] = filename;
        songinfo["show_link"] = 'file://' + filepath;
        songinfo["file_path"] = filepath;
        songinfo["author"] = "";
        songinfo["album_title"] = "";
        songinfo["listid"] = local_songlist_id;

        songinfo_array.push(songinfo);
    }

    return songinfo_array;
}

function spliceFilesAndNotify(files, local_songlist_id) {
    let songinfo_arr = generate_songinfo(files, local_songlist_id);
    postMessage(songinfo_arr);
    // let loop = true;
    // let start = 0;
    // let len = files.length;
    // let step = 20;
    // while (loop) {
    //     if ((len - start) <= step) {
    //         // console.log('end index is: ' + start)
    //         let new_arr = files.slice(start);
    //         setTimeout(() => {
    //             // console.log('loop end!')
    //             let songinfo_arr = generate_songinfo(new_arr, local_songlist_id);
    //             postMessage(songinfo_arr);
    //         }, 0)

    //         loop = false;
    //     } else {
    //         let new_arr = files.slice(start, start + step);
    //         // console.log('new arr len is: ' + new_arr.length);
    //         setTimeout(() => {
    //             // console.log('loop continue')
    //             let songinfo_arr = generate_songinfo(new_arr, local_songlist_id);
    //             postMessage(songinfo_arr);
    //         }, 0)
    //         start += step;
    //     }
    // }
}

onmessage = function (event) {
    var template = event.data;
    var listid = template[0].songlistid;
    var files = template[0].files;
    spliceFilesAndNotify(files, listid);
    console.log(' this is from worker thread ');
}
