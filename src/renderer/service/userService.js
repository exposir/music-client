import * as Config from './config.js'
import Common from './common.js'

//接口
export default {
    getUserBaseInfo(data) {
        // console.log(JSON.stringify(data));
        let jsondata = {
            "method": "baidu.ting.ugccenter.getUserBaseInfo",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    //获取用户收藏（包括歌单、艺人、专辑 专题）、自建歌单
    getUserDiyList(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.userList",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    //获取用户 云收藏的单曲
    getUserFavourSongList(data) {
        let jsondata = {
            "method": "baidu.ting.favorite.getCollectSong",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    //收藏 (歌单、专辑、艺人)
    addFavorite(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.addFavoriteDiy",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    //取消收藏 (歌单、专辑、艺人)
    deleteFavorite(data) {
        let jsondata = {
            "method": "baidu.ting.ugcdiy.deleteFavoriteDiy",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    //收藏 单曲
    addSongFavorites(data) {
        let jsondata = {
            "method": "baidu.ting.favorite.addSongFavorites",
            "isNeedPassEncode": false,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    },
    //取消收藏 单曲
    delSongFavorites(data) {
        let jsondata = {
                "method": "baidu.ting.favorite.delCollectSong",
                "isNeedPassEncode": false,
                "data": data
            }
            // console.log(JSON.stringify(data));
        return Common.asyncFetchData(jsondata)
    },
    // //匹配单曲收藏
    async getallFavourSongs(paramjson) {
        let jsondata = await this.getUserFavourSongList(paramjson)
            // console.log(jsondata)
        if (jsondata.error_code === 22000) {
            return jsondata
        }
    },
    modifyUserInfo(data) {
        let jsondata = {
            "method": "baidu.ting.ugccenter.userInfoUpdate",
            "isNeedPassEncode": true,
            "data": data
        }
        return Common.asyncFetchData(jsondata)
    }
}