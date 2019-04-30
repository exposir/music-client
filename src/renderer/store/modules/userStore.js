import * as types from '../mutation-types'
import settings from '../../dataoperation/settings/settings'
import * as Config from 'service/config.js'
import serviceCommon from 'service/common'
import userService from 'service/userService'
import commonFuns from 'components/commonFuns/common.js'
import gedanService from 'service/gedanService'
import constant from '../../constant.js'
import MessageBox from 'components/messageBox/main.js'
import agreeService from 'service/agreeService'

let ipc = require('electron').ipcRenderer

const state = {
    loginStatus: Boolean,
    loginUserInfo: {},
    userDiyList: [],
    userFavoriteDiyList: {},
    userFavoriteAlbumList: {},
    userFavoriteSingerList: {},
    userFavoriteSongList: {},
    all_favour_song_list: [],
    is_show_user_pop: false,
    get_favor_song_list_finished: false,
    payAutoInfo: {},
    current_favorite_page: -1, //当前收藏歌曲页
    favorite_pagesize: 50
}

const getters = {
    loginUserInfo: () => state.loginUserInfo,
    loginStatus: () => state.loginStatus,
    userDiyList: () => state.userDiyList,
    userFavoriteDiyList: () => state.userFavoriteDiyList,
    userFavoriteAlbumList: () => state.userFavoriteAlbumList,
    userFavoriteSingerList: () => state.userFavoriteSingerList,
    userFavoriteSongList: () => state.userFavoriteSongList,
    all_favour_song_list: () => state.all_favour_song_list,
    is_show_user_pop: () => state.is_show_user_pop,
    get_favor_song_list_finished: () => state.get_favor_song_list_finished,
    payAutoInfo: () => state.payAutoInfo,
}

const actions = {
    TpassLogin({ commit, dispatch }) {
        let opts = {
            tpl: 'baidu_music',
            isClient: 1,
            staticPage: "file://pass_jump_v3.html",
            target: 'pop',
            sms: 1,
            regLink: 1,
            otherLoginStyle: 1,
            u: 'http://music.taihe.com?tpl=baidu_music&client=1'
        }
        if (require('electron').remote.getCurrentWindow().getSize()[1] < 500) {
            eventBus.$emit('isMiniMode', false)
            ipc.send('asynchronous-message', 'main-window')
        }

        TPASS.login(opts, function() {})
        window.pcclientLoginCallBack = function() {
            if (Config.DEBUG) { console.log('login success') }
            TPASS.close()
            dispatch('login')
        }

    },
    async getLoginUserInfo({ commit, dispatch }) {
        try {
            let jsondata = await userService.getUserBaseInfo()
            if (Config.DEBUG) { console.log(`get user base Info taiheAPI: ${JSON.stringify(jsondata)}`) }
            if (jsondata.error_code == 22000) {
                let loginUserInfo = jsondata.result;
                commit(types.LOGIN_USER_INFO, loginUserInfo)
                dispatch('setLoginStatus', { 'loginStatus': true })
                dispatch('getPayAutoInfo', { 'sign_scene': 'vip' }) //是否签约连续包月
            } else if (jsondata.error_code == 22452) {
                dispatch('setLoginStatus', { 'loginStatus': false })
            }
        } catch (err) {
            console.log(err)
        }
    },
    setLoginStatus({ commit, dispatch }, paramsJson) {
        let loginStatus = paramsJson.loginStatus
        if (loginStatus) {
            console.log('user has login on!')
            eventBus.$emit('getDR', true)
            dispatch('startClientInitUserAllFavourSongsList', { 'data': { 'pn': 0, 'rn': 100 }, 'isDone': false })
        }
        commit(types.LOGIN_STATUS, loginStatus)
        if (!loginStatus) {
            //退出登录时清空收藏歌曲列表
            commit(types.EMPTY_FAVOR_SONG_LIST);
        }
    },
    login({ commit, dispatch }) {
        try {
            dispatch('setLoginStatus', { 'loginStatus': true })
            dispatch('getLoginUserInfo')
            dispatch('getUserDiyList', { "source": 0, "type": 10, "offset": 0 })
            dispatch('getUserDiyList', { "source": 0, "type": 0, "offset": 0 })
            dispatch('getUserDiyList', { "source": 1, "type": 0, "offset": 0 })
            dispatch('getUserDiyList', { "source": 2, "type": 0, "offset": 0 })
            dispatch('getUserFavourSongList', { 'pn': 0, 'rn': state.favorite_pagesize })
            dispatch('getPayAutoInfo', { 'sign_scene': 'vip' }) //是否签约连续包月
        } catch (err) {

        }
    },
    logout({ commit, dispatch }) {
        try {
            dispatch('setLoginStatus', { 'loginStatus': false })
        } catch (err) {

        }
    },

    async getUserDiyList({ commit }, paramsJson) {
        try {
            let jsondata = await userService.getUserDiyList(paramsJson)
            if (jsondata.error_code == 22000) {
                if (paramsJson.type === 10) {
                    //自建歌单
                    let diyList = jsondata.result;
                    commit(types.USER_DIY_LIST, diyList)
                } else if (paramsJson.type === 0 && paramsJson.source === 0) {
                    let favoriteDiyList = jsondata.result
                    commit(types.USER_FAVORITE_DIY_LIST, favoriteDiyList)
                } else if (paramsJson.type === 0 && paramsJson.source === 1) {
                    let favoriteAlbumList = jsondata.result
                    favoriteAlbumList.listinfo.forEach((value, index) => {
                        favoriteAlbumList.listinfo[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                    })
                    commit(types.USER_FAVORITE_ALBUM_LIST, favoriteAlbumList)
                } else if (paramsJson.type === 0 && paramsJson.source === 2) {
                    let favoriteSingerList = jsondata.result
                    commit(types.USER_FAVORITE_SINGER_LIST, favoriteSingerList)
                }
            }
        } catch (err) {
            console.log('getUserDiyList store error')
        }

    },
    //收藏单曲列表(我喜欢的单曲列表) 采用分页
    //注：跟客户端启动时递归拉取不用一个state (因为用同一个state,递归拉取需要时间，喜欢单曲页面会出现空白)
    async getUserFavourSongList({ commit, dispatch }, paramsJson) {
        try {
            // if (!state.loginStatus) {
            //     dispatch('TpassLogin')
            //     return false
            // }
            let page = paramsJson.pn / paramsJson.rn;
            // console.log(paramsJson);
            let pagesize = paramsJson.rn;
            let jsondata = await userService.getUserFavourSongList(paramsJson)
            if (jsondata.error_code === 22000) {
                let favoriteSongList = jsondata
                let songList = jsondata.result
                    // console.log('current favor song list count is: ' + songList.length)
                    // console.log(JSON.stringify(songList))
                if (Array.isArray(songList) && songList.length > 0) {
                    songList.forEach((value, index) => {
                        songList[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                        songList[index].listid = constant.favorite_songlist_id;
                        songList[index].copy_type = 1;
                        songList[index].del_status = 0;
                    })
                    favoriteSongList.result = songList
                        // console.log(songList.length);
                    commit(types.USER_FAVORITE_SONG_LIST, { favoriteSongList, page, pagesize })

                } else {
                    favoriteSongList.result = []
                    commit(types.USER_FAVORITE_SONG_LIST, { favoriteSongList, page, pagesize })
                }


            }
        } catch (error) {

        }
    },
    //歌单、专辑、歌手的收藏（单曲收藏不用此接口）
    async addFavorite({ commit, dispatch }, paramsJson) {
        try {
            if (!state.loginStatus) {
                dispatch('TpassLogin')
                    // return false
                return Promise.reject()
            }
            let jsondata = await userService.addFavorite(paramsJson)
            if (jsondata.error_code === 22000) {
                commonFuns.createTips('收藏成功', 'success')
                let data = { 'type': 0, 'source': paramsJson.source, "offset": 0 }
                dispatch('getUserDiyList', data)
            } else {
                commonFuns.createTips('收藏失败', 'warning')
            }
        } catch (e) {

        }
    },
    //取消收藏 歌单、专辑、歌手的收藏（单曲收藏不用此接口）
    async deleteFavorite({ commit, dispatch }, { paramsJson, isJump = false }) {
        try {
            if (!state.loginStatus) {
                dispatch('TpassLogin')
                return false
            }
            let jsondata = await userService.deleteFavorite(paramsJson)
            if (jsondata.error_code === 22000) {
                commonFuns.createTips('成功取消收藏', 'success')
                let data = { 'type': 0, 'source': paramsJson.source, "offset": 0 }
                dispatch('getUserDiyList', data)
                if (isJump) {
                    eventBus.$emit('goBack', true)
                } else { //左侧收藏列表里取消收藏
                    let source = paramsJson.source //0 歌单 1专辑
                    let list_id = paramsJson.list_id
                    if (source == 0) {
                        dispatch('getGedanInfo', {
                            "list_id": list_id,
                            "withcount": "1"
                        })
                    } else {
                        dispatch('getAlbumInfo', {
                            'album_id': list_id
                        })
                    }
                }
            } else {
                commonFuns.createTips('取消收藏失败', 'warning')
            }
        } catch (e) {

        }
    },
    //收藏单曲
    async addSongFavorites({ commit, dispatch }, { songsData, isFavoured }) {
        try {
            if (!state.loginStatus) {
                dispatch('TpassLogin')
                isFavoured = false;
                return false
            }

            let songIds = []
            let songsData_copy = [];

            songsData.forEach((song) => {
                let songid = commonFuns.getSongId(song)
                songIds.push(songid);
                songsData_copy.push(commonFuns.deepCopyObj(song));
            })
            let songIdsStr = songIds.join(',')
            let jsondata = await userService.addSongFavorites({ 'songId': songIdsStr })
            if (jsondata.error_code === 22000) {
                if (require('electron').remote.getCurrentWindow().getSize()[1] != 50) {
                    commonFuns.createTips('收藏成功', 'success')
                }
                isFavoured = true

                //收藏单曲 需要更新ALL_FAVOUR_SONG_LIST (可以同时收藏多首歌曲)
                let allFavourSongs = songsData_copy,
                    is_modify = 'add'

                dispatch('updateAllFavorSonglist', { allFavourSongs, is_modify })

            } else {
                if (jsondata.error_code == 22322) {
                    if (require('electron').remote.getCurrentWindow().getSize()[1] != 50) {
                        commonFuns.createTips('收藏成功', 'success')
                    }
                    isFavoured = true
                } else {
                    commonFuns.createTips('收藏失败', 'warning')
                }
            }
        } catch (e) {

        }
    },
    //取消 收藏单曲
    async delSongFavorites({ commit, dispatch, rootState }, { songsData, isFavoured, options = {} }) {
        try {
            // console.log(options)
            if (!state.loginStatus) {
                dispatch('TpassLogin')
                isFavoured = true;
                return false
            }
            let songIds = []
            songsData.forEach((song) => {
                let songid = commonFuns.getSongId(song)
                songIds.push(songid)
            })
            let songIdsStr = songIds.join(',')
            let jsondata = await userService.delSongFavorites({ 'songId': songIdsStr })
            if (jsondata.error_code === 22000) {
                if (require('electron').remote.getCurrentWindow().getSize()[1] != 50) {
                    commonFuns.createTips('成功取消收藏', 'success')
                }
                if (state.all_favour_song_list.length == songsData.length) {
                    //删除最后一首收藏的时候api会出错，所以这里做个特殊处理吧
                    commit(types.EMPTY_FAVOR_SONG_LIST);
                } else {
                    isFavoured = false

                    //取消收藏单曲 需要更新ALL_FAVOUR_SONG_LIST (可以同时收藏多首歌曲)
                    let allFavourSongs = songsData,
                        is_modify = 'del'

                    dispatch('updateAllFavorSonglist', { allFavourSongs, is_modify })

                    let paramsJson = {
                        'pn': state.current_favorite_page * state.favorite_pagesize,
                        'rn': state.favorite_pagesize
                    }
                    dispatch('getUserFavourSongList', paramsJson);

                    //同步的删除正在播放列表里面的歌曲
                    let song = rootState.root_currentPlayingSong;
                    let cur_id = commonFuns.getSongId(song);
                    let cur_list_id = "";
                    if (song.hasOwnProperty('listid')) {
                        cur_list_id = song.listid;
                    }

                    let isSwitchPlaying = false;
                    let idArrs = songIds;
                    let fromList = constant.favorite_songlist_id;
                    for (let i = 0; i < songIds.length; i++) {
                        let id = songIds[i];
                        if (cur_list_id == constant.favorite_songlist_id && cur_id == id) {
                            isSwitchPlaying = true;
                            break;
                        }
                    }
                    dispatch('deleteCurrentPlaylistSongsByID', { idArrs, fromList, isSwitchPlaying });
                }


            } else {
                commonFuns.createTips('取消收藏失败')
            }
        } catch (e) {

        }
    },
    async startClientInitUserAllFavourSongsList({ commit, dispatch }, paramsJson) {
        if (Array.isArray(state.all_favour_song_list) && state.all_favour_song_list.length < 1) {
            let pageSize = 100,
                page = paramsJson.page ? paramsJson.page : 1,
                allFavourSongs = paramsJson.allFavourSongs ? paramsJson.allFavourSongs : [],
                data = paramsJson.data
            let jsondata = await userService.getUserFavourSongList(data)
            if (jsondata.error_code == 22000) {
                // console.log(JSON.stringify(jsondata))
                let songList = jsondata.result
                if (Array.isArray(songList)) {
                    Array.forEach(songList, (value, index) => {
                        songList[index].authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)

                    })
                }

                if (!jsondata.havemore) { //没有更多了
                    if (jsondata.total < pageSize) { //只有一页
                        allFavourSongs = jsondata.result
                    } else {
                        allFavourSongs = [].concat(allFavourSongs, songList)
                    }
                    console.log('get all favour songs is done')
                    paramsJson.isDone = true
                    let is_modify = 'refresh';
                    commit(types.ALL_FAVOUR_SONG_LIST, { allFavourSongs, is_modify })
                } else {

                    allFavourSongs = [].concat(allFavourSongs, songList)
                    page++
                    let offset = (page - 1) * pageSize
                    paramsJson = { 'data': { 'pn': offset, 'rn': pageSize }, 'page': page, 'allFavourSongs': allFavourSongs }
                    dispatch('startClientInitUserAllFavourSongsList', paramsJson)
                }
            }

        } else {
            paramsJson.isDone = true
        }

    },
    //新建自建歌单
    async addSonglist({ commit, dispatch }, paramsJson) {
        try {
            paramsJson.isSuccess = false;
            paramsJson.isDone = false;
            const jsondata = await gedanService.addList(paramsJson)
            if (jsondata.error_code == 22000) {
                // console.log('add new list success! res is: ' + JSON.stringify(jsondata));
                let listid = jsondata.result.list_id;

                let listinfo = {};
                let time = Date.parse(new Date());
                listinfo.create_time = time;
                listinfo.update_time = time;
                listinfo.list_title = paramsJson.title;
                listinfo.list_id = listid;
                listinfo.listen_num = 0;
                listinfo.song_num = 0;
                listinfo.username = state.loginUserInfo.username;
                listinfo.userid = state.loginUserInfo.userid;
                listinfo.list_pic = "";
                listinfo.list_pic_large = "";
                listinfo.list_pic_small = "";
                listinfo.list_pic_huge = "";
                listinfo.list_pic_middle = "";

                commit(types.ADD_NEW_DIY_LIST, listinfo);

                paramsJson.list_id = listid;
                paramsJson.isSuccess = true;
                paramsJson.isDone = true;
                // console.log(paramsJson)
            } else if (paramsJson.ret_code === 22231) {
                commonFuns.createTips('名称中含有黄反词', 'error');
            } else {
                commonFuns.createTips('添加歌单失败', 'error')
            }
        } catch (err) {
            console.log('add new list occurs error: ' + err);
            paramsJson.isDone = true;
        }
    },
    //删除自建歌单
    async deleteSonglist({ commit, dispatch }, paramsJson) {
        try {
            paramsJson.isDone = false
            const jsondata = await gedanService.delList(paramsJson)
            if (jsondata.error_code == 22000) {
                commit(types.DEL_DIY_LIST, paramsJson.list_id);
                paramsJson.isDone = true;
                console.log(paramsJson)
            }
        } catch (err) {

        }
    },
    //新建自建歌单并添加歌曲
    async addSongListAndSongs({ commit, dispatch }, paramsJson) {
        try {
            paramsJson.isSuccess = false;
            paramsJson.isDone = false;
            console.log(paramsJson)
            const jsondata = await gedanService.addSongListAndSongs(paramsJson)
            if (jsondata.error_code == 22000) {
                console.log('add new list success! res is: ' + JSON.stringify(jsondata));
                let listid = jsondata.result.list_id;

                let listinfo = {};
                let time = Date.parse(new Date());
                listinfo.create_time = time;
                listinfo.update_time = time;
                listinfo.list_title = paramsJson.title;
                listinfo.list_id = listid;
                listinfo.listen_num = 0;
                listinfo.song_num = 0;
                listinfo.username = state.loginUserInfo.username;
                listinfo.userid = state.loginUserInfo.userid;
                listinfo.list_pic = "";
                listinfo.list_pic_large = "";
                listinfo.list_pic_small = "";
                listinfo.list_pic_huge = "";
                listinfo.list_pic_middle = "";

                commit(types.ADD_NEW_DIY_LIST, listinfo);

                paramsJson.list_id = listid;
                paramsJson.isSuccess = true;
                paramsJson.isDone = true;
                // console.log(paramsJson)
                commonFuns.createTips('添加成功', 'success')
            } else if (paramsJson.ret_code === 22231) {
                commonFuns.createTips('名称中含有黄反词', 'error');
            } else {
                commonFuns.createTips('添加歌单失败', 'error')
            }
        } catch (err) {
            console.log('add new list occurs error: ' + err);
            paramsJson.isDone = true;
        }
    },
    //修改歌单信息
    async modifyListBaseInfo({ commit, dispatch }, paramsJson) {
        try {
            paramsJson.isDone = false;
            const jsondata = await gedanService.modifyListInfo(paramsJson)

            paramsJson.ret_code = jsondata.error_code;
            if (jsondata.error_code == 22000) {
                // console.log('modify list info success! res is: ' + JSON.stringify(jsondata));
                let listinfo = paramsJson

                commit(types.MODIFY_DIY_TITLE, listinfo)
                paramsJson.isDone = true;
                return Promise.resolve()
            } else {
                if (jsondata.error_code == 22231) {
                    commonFuns.createTips('内容含有黄反', 'error')
                } else {
                    commonFuns.createTips('内容不符合要求', 'error')
                }

                return Promise.reject()
            }
        } catch (err) {
            paramsJson.isDone = true;
        }
    },
    updateAllFavorSonglist({ commit }, { allFavourSongs, is_modify = '' }) {
        commit(types.ALL_FAVOUR_SONG_LIST, { allFavourSongs, is_modify })
            // eventBus.$emit('favoritesongchanged');

    },
    matchSongIsFavour({ commit, dispatch }, paramsJson) {
        let songList = state.all_favour_song_list
        let song_id = paramsJson.song_id
        paramsJson.is_match = false
        if (state.loginStatus && Array.isArray(songList) && songList.length > 0) {
            songList.map(function(item, index) {
                let id = commonFuns.getSongId(item);
                if (id == song_id) {
                    // if (Config.DEBUG) { console.log(song_id + ' is matched') }
                    paramsJson.is_match = true
                }
            })
        }
    },
    setShowLoginUserPop({ commit }, isShow) {
        commit(types.ISSHOW_LOGIN_USER_POP, isShow)
    },
    isSongFavored({ commit, dispatch }, param) {
        let songInfo = param.song;
        let is_match = param.is_match;
        if (!songInfo) {
            param.is_match = false;
            return;
        }

        let songid = commonFuns.getSongId(songInfo);
        if (!songid || songid.indexOf('_local') > -1) {
            param.is_match = false;
            return;
        }

        let list_id = "";
        if (songInfo.hasOwnProperty('listid')) {
            list_id = songInfo.listid;
            // console.log(list_id)
            if (list_id == 'favorite_songlist') {
                param.is_match = true;
                return;
            }
        }

        let matchSongData = {
            'is_match': false,
            'song_id': songid
        }

        dispatch('matchSongIsFavour', matchSongData)
        param.is_match = matchSongData.is_match;;
    },
    //单点售卖付费弹层
    showSaleSongMessageBox({ commit, dispatch }, songinfoJson) {
        try {
            if (!state.loginStatus) {
                dispatch('TpassLogin')
                return false
            }
            let resource_type_ext = songinfoJson.resource_type_ext ? songinfoJson.resource_type_ext : 3
            if (clientConfigs.get_payment_state() == '1') {

                if (resource_type_ext == 5 || resource_type_ext == 6) {
                    let type = '歌曲';
                    if (resource_type_ext == 6) type = '专辑';
                    let msg = type + '将于' + songinfoJson.publishtime + '发布，别忘了过来听哦。';
                    MessageBox.tips('提示', msg, {
                        'cancelButtonText': '取消',
                        'confirmButtonText': '确定',
                        'customClass': 'hasPay',
                        'showCancelButton': false,
                        'showConfirmButton': false
                    })
                } else {
                    // let message = '当前歌曲为付费歌曲，购买后即可无限畅想~！';
                    // if (resource_type_ext == 4) { //专辑
                    // message = '购买专辑后即可无限唱享全部歌曲~！'
                    // }
                    // console.log('showSaleSongMessageBox: ' + JSON.stringify(songinfoJson))
                    // MessageBox.pay(message, songinfoJson, {
                    //     confirmButtonText: '支持该歌手',
                    //     type: 'sale',
                    //     callback: action => {
                    //         let url = songinfoJson.buy_url
                    //         shell.openExternal(url);
                    //     }
                    // })
                    let album_id = songinfoJson.album_id ? songinfoJson.album_id : '';
                    let song_id = commonFuns.getSongId(songinfoJson);
                    let data = {
                        type: '',
                        typeid: '',
                        from: 'web',
                        deviceName: 'mac'
                    };
                    if (resource_type_ext == 3 && song_id) {
                        data.type = 'song';
                        data.typeid = song_id;
                    }
                    if (resource_type_ext == 4 && album_id) {
                        data.type = 'album';
                        data.typeid = album_id;
                    }
                    let bdPay = new BdPay(data);
                    bdPay.show();
                }
            } else {
                message = '该歌曲暂时无法播放或下载';
                commonFuns.createTips(message)
            }
        } catch (e) {

        }
    },
    //全球付费弹层
    showOpenVipMessageBox({ commit, dispatch }) {
        try {
            if (!state.loginStatus) {
                dispatch('TpassLogin')
                return false
            }

            if (clientConfigs.get_payment_state() == '1') {
                // let message = "应唱片公司要求，当前歌曲需付费使用，开通VIP会员可自由畅享哦！"
                // MessageBox.pay(message, songinfoJson, {
                //     confirmButtonText: '立即开通VIP',
                //     type: 'vip',
                //     callback: action => {
                //         let url = 'http://music.taihe.com/vip/payment/cloud?type=up&level=comm&pst=pay_plaza'
                //         shell.openExternal(url);
                //     }
                // })
                let data = {
                    type: 'vip',
                    typeid: '',
                    from: 'web',
                    deviceName: 'mac'
                };
                let bdPay = new BdPay(data);
                bdPay.show();
            } else {
                message = '该歌曲暂时无法播放或下载';
                commonFuns.createTips(message)
            }
        } catch (e) {}
    },
    //是否签约连续包月
    async getPayAutoInfo({ commit, dispatch }, paramsJson) {
        console.log('是否签约连续包月');
        try {
            const jsondata = await agreeService.getAgreeInfo(paramsJson)
            console.log(jsondata);
            if (jsondata.error_code == 22000) {
                commit(types.PAY_AUTO_INFO, jsondata)
            }
        } catch (err) {
            paramsJson.isDone = true;
        }
    },
    //修改个人信息
    async modifyUserBaseInfo({ commit, dispatch }, paramsJson) {
        try {
            const jsondata = await userService.modifyUserInfo(paramsJson)
            console.log(jsondata)

            if (jsondata.error_code == 22000) {
                commonFuns.createTips("保存成功", "success");
                // 需要接口联调
                dispatch('getLoginUserInfo')
                    // console.log('modify list info success! res is: ' + JSON.stringify(jsondata));
                    // let listinfo = paramsJson
                    // paramsJson.isDone = true;
                    // commit(types.MODIFY_DIY_TITLE, listinfo)
                return Promise.resolve()
            } else {
                if (jsondata.error_code == 22708) {
                    commonFuns.createTips('用户昵称重复', 'error');
                } else {
                    //其他提示
                }
                return Promise.reject()
            }
        } catch (err) {
            // paramsJson.isDone = true;
        }
    },
}
const mutations = {
    [types.LOGIN_USER_INFO](state, loginUserInfo) {
        state.loginUserInfo = loginUserInfo
    },
    [types.LOGIN_STATUS](state, loginStatus) {
        state.loginStatus = loginStatus
    },
    [types.USER_DIY_LIST](state, diyList) {
        state.userDiyList = diyList
    },
    [types.USER_FAVORITE_DIY_LIST](state, favoriteDiyList) {
        state.userFavoriteDiyList = favoriteDiyList
    },
    [types.USER_FAVORITE_ALBUM_LIST](state, favoriteAlbumList) {
        state.userFavoriteAlbumList = favoriteAlbumList
    },
    [types.USER_FAVORITE_SINGER_LIST](state, favoriteSingerList) {
        state.userFavoriteSingerList = favoriteSingerList
    },
    //注：isappend='del' favoriteSongList传要删除的歌曲列表
    //注：isappend='add' favoriteSongList传要添加的歌曲列表（歌曲信息包括song_id,title,author,album_title)
    [types.USER_FAVORITE_SONG_LIST](state, { favoriteSongList, page, pagesize }) {
        state.userFavoriteSongList = favoriteSongList;
        state.current_favorite_page = page;
        state.favorite_pagesize = pagesize;
    },
    [types.ALL_FAVOUR_SONG_LIST](state, { allFavourSongs, is_modify }) {
        // console.log('favor song count is: ' + allFavourSongs.length);
        // console.log('modify favor is_modify is: ' + is_modify + ' favor songs is: ' + allFavourSongs.length)
        if (is_modify === 'add' || is_modify === 'refresh') {
            for (let i = 0; i < allFavourSongs.length; i++) {
                let song = allFavourSongs[i];
                song.copy_type = 1;
                song.del_status = 0;
                song.listid = constant.favorite_songlist_id;
                if (song.hasOwnProperty('author') && song.hasOwnProperty('all_artist_id')) {
                    let authorLinksArr = serviceCommon.getAuthorsLinksArr(song.author, song.all_artist_id)
                    song.authorLinksArr = authorLinksArr
                }

                if (!song.authorLinksArr) {
                    song.authorLinksArr = [];
                }
            }
        }

        if (is_modify === 'add') {
            let allSongsList = state.all_favour_song_list
            let concatSongList = [].concat(allFavourSongs, allSongsList)
            state.all_favour_song_list = concatSongList
        } else if (is_modify === 'del') {
            let songList = state.all_favour_song_list
            allFavourSongs.forEach((val) => {
                let val_id = commonFuns.getSongId(val)
                songList.map(function(item, index) {
                    let item_id = commonFuns.getSongId(item)
                    if (item_id == val_id) {
                        // console.log(index)
                        songList.splice(index, 1)
                    }
                })
            })
            state.all_favour_song_list = songList
        } else {
            state.all_favour_song_list = allFavourSongs;
            state.get_favor_song_list_finished = true;
            // console.log(state.get_favor_song_list_finished)
        }

        eventBus.$emit('favoritesongchanged');
    },
    [types.ADD_NEW_DIY_LIST](state, listinfo) {
        state.userDiyList.listinfo.splice(0, 0, listinfo);
    },
    [types.MODIFY_DIY_TITLE](state, listinfo) {
        state.userDiyList.listinfo.map((val) => {
            if (val.list_id == listinfo.list_id) {
                val.list_title = listinfo.title
            }
        })
    },
    [types.DEL_DIY_LIST](state, list_id) {
        for (let i = 0; i < state.userDiyList.listinfo.length; i++) {
            let item = state.userDiyList.listinfo[i]
            if (item.list_id == list_id) {
                state.userDiyList.listinfo.splice(i, 1);
            }
        }
    },
    [types.ISSHOW_LOGIN_USER_POP](state, isShow) {
        state.is_show_user_pop = isShow
    },
    [types.EMPTY_FAVOR_SONG_LIST](state) {
        state.get_favor_song_list_finished = false;
        state.all_favour_song_list.splice(0, state.all_favour_song_list.length)
        state.userFavoriteSongList = {};
    },
    [types.PAY_AUTO_INFO](state, info) {
        state.payAutoInfo = info;
    }
}
export default {
    state,
    getters,
    actions,
    mutations
}