import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
//import playList from './modules/playList'
import * as types from './mutation-types'
import currentPlaylist from './modules/currentPlayinglist'
import historyList from './modules/historySonglist'
import localList from './modules/localSonglist'
import downloadingList from './modules/downloadingSonglist'
import downloadedList from './modules/downloadedSonglist'
import settingMap from './modules/settingMapping'
import massOpStore from './modules/massoperationstore'

import recommendStore from './modules/recommendStore'
import bangdanStore from './modules/bangdanStore'
import searchStore from './modules/searchStore'
import gedanStore from './modules/gedanStore'
import radioStore from './modules/radioStore'
import singerStore from './modules/singerStore'
import albumStore from './modules/albumStore'
import contextMenu from './modules/contextMenuStore'
import localFocusimages from './modules/localFocusimages'
import userStore from './modules/userStore'
import mvStore from './modules/mvStore'
import audioCoreStore from './modules/audioCoreStore.js'
import newRecommendAlbumStore from './modules/newRecommendAlbumStore.js'
import commonFuns from '../components/commonFuns/common.js'


Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
    state: {
        //由于暂时不知道在vue组件中怎么使用rootState的数据，所以这里暂时写上一个
        //如果以后找到解决的方式可以替换掉module里面的数据
        root_currentPlayingSong: {},
    },
    actions: {
        updateRootCurrentPlayingSong({ commit, dispatch }, song) {
            // console.log('updateRootCurrentPlayingSong list id= ' + song.listid);
            if (song) {
                commit(types.UPDATE_ROOT_CURRENT_PLAYING_SONG, song);
                eventBus.$emit('playingsongchanged');
            }
        },
        getCurrentPlayingSongListId({ commit, dispatch, rootState }, param) {
            if (rootState.root_currentPlayingSong.hasOwnProperty('listid')) {
                param.listid = rootState.root_currentPlayingSong.listid;
            }
            param.songid = commonFuns.getSongId(rootState.root_currentPlayingSong);
            if (rootState.root_currentPlayingSong.hasOwnProperty('title')) {
                param.title = rootState.root_currentPlayingSong.title;
            }

        }
    },
    getters: {
        root_currentPlayingSong: () => state.root_currentPlayingSong,
    },
    mutations: {
        [types.UPDATE_ROOT_CURRENT_PLAYING_SONG](state, song) {
            state.root_currentPlayingSong = null;
            if (song) {
                let json_str = JSON.stringify(song);

                state.root_currentPlayingSong = JSON.parse(json_str);
                // console.log('root_currentPlayingSong list id is: ' + song.listid)
            } else {
                state.root_currentPlayingSong = {};
            }
        },
    },
    modules: {
        //playList
        currentPlaylist,
        historyList,
        localList,
        downloadingList,
        downloadedList,
        settingMap,
        searchStore,
        gedanStore,
        contextMenu,
        localFocusimages,
        recommendStore,
        bangdanStore,
        singerStore,
        albumStore,
        userStore,
        massOpStore,
        mvStore,
        audioCoreStore,
        radioStore,
        newRecommendAlbumStore
    },
    strict: debug
})

export default store