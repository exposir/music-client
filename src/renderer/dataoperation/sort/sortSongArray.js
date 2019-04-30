'use-strict'

export default {
    //按歌曲的名称来降序排列
    sortBySongTitle_desc(songArray) {
        songArray.sort(function (a, b) {
            let a_title = a.title;
            let b_title = b.title;

            return a_title.localeCompare(b_title);
        })
    },

    //按歌曲的名称来升序排列
    sortBySongTitle_asce(songArray) {
        songArray.sort(function (a, b) {
            let a_title = a.title;
            let b_title = b.title;

            return b_title.localeCompare(a_title);
        })
    },

    //按歌手的名称来降序排列
    sortByAuthor_desc(songArray) {
        songArray.sort(function (a, b) {
            if (!a.hasOwnProperty('author') && !b.hasOwnProperty('author')) {
                return 0;
            }
            let a_author = a.author;
            let b_author = b.author;

            return a_author.localeCompare(b_author);
        })
    },

    //按歌手的名称来升序排列
    sortByAuthor_asce(songArray) {
        songArray.sort(function (a, b) {
            if (!a.hasOwnProperty('author') && !b.hasOwnProperty('author')) {
                return 0;
            }
            let a_author = a.author;
            let b_author = b.author;

            return b_author.localeCompare(a_author);
        })
    },

    //按专辑的名称来降序排列
    sortByAlbum_desc(songArray) {
        songArray.sort(function (a, b) {
            if (!a.hasOwnProperty('album_title') || b.hasOwnProperty('album_title')) {
                return 0;
            }
            let a_album = a.album_title;
            let b_album = b.album_title;

            return a_album.localeCompare(b_album);
        })
    },

    //按专辑的名称来升序排列
    sortByAlbum_asce(songArray) {
        songArray.sort(function (a, b) {
            if (!a.hasOwnProperty('album_title') || b.hasOwnProperty('album_title')) {
                return 0;
            }
            let a_album = a.album_title;
            let b_album = b.album_title;

            return b_album.localeCompare(a_album);
        })
    },

    //按歌曲的长度来降序排列
    sortByDuration_desc(songArray) {
        songArray.sort(function (a, b) {
            if (!a.hasOwnProperty('file_duration') || b.hasOwnProperty('file_duration')) {
                return 0;
            }
            let a_duration = a.file_duration;
            let b_duration = b.file_duration;

            return a_duration.localeCompare(b_duration);
        })
    },

    //按歌曲的长度来升序排列
    sortByDuration_asce(songArray) {
        songArray.sort(function (a, b) {
            if (!a.hasOwnProperty('file_duration') || b.hasOwnProperty('file_duration')) {
                return 0;
            }
            let a_duration = a.file_duration;
            let b_duration = b.file_duration;

            return b_duration.localeCompare(a_duration);
        })
    },
}