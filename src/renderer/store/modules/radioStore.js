import * as types from '../mutation-types'
import constant from '../../constant.js'
import radioService from '../../service/radioService'
import serviceCommon from '../../service/common'
import commonFuns from '../../components/commonFuns/common.js'
import lyricParser from '../../lyric/lyricSearch.js'
import lyricContent from '../../lyric/localLyricParser.js'

const state = { 
    radioCategory: [],
    radioAllScene: [],
    radioSong: [],
    private_radio: {},
    current_playing_privateRadio: {
        lyric_array: []
    },
    playing_radio_info: {
        type: ""
    }
}


const getters = {
    radioCategory: () => state.radioCategory,
    radioAllScene: () => state.radioAllScene,
    radioSong: () => state.radioSong,
    playing_radio_info: () => state.playing_radio_info,
    private_radio: () => state.private_radio,
    current_playing_privateRadio: () => state.current_playing_privateRadio,
}

const actions = {
    async getRadioCategory({ commit }, paramsJson) {
        try {
            const jsondata = await radioService.getRadioCategory(paramsJson)
            if (jsondata.error_code == 22000) {
                let radioCategory = {}
                radioCategory = jsondata.result
                commit(types.RADIO_CATEGORY, radioCategory)
            }
        } catch (err) {

        }
    },
    async getRadioAllScene({ commit }, paramsJson) {
        try {
            const jsondata = await radioService.getRadioAllScene(paramsJson)
            if (jsondata.error_code == 22000) {
                let radioAllScene = []
                jsondata.data.forEach((value,index)=>{
                    radioAllScene[value.category_id] = value.items
                })
                commit(types.RADIO_ALL_SCENE, radioAllScene)
            }
        } catch (err) {

        }
    },
    async getRadioSongList({ commit }, paramsJson) {
        try {
            const jsondata = await radioService.getRadioSongList(paramsJson)
            if (jsondata.error_code == 22000) {
                let radioSong = jsondata.result
                commit(types.SCENE_SONG, radioSong)
            }
        } catch (err) {

        }
    },
    async setPlayingRadioInfo({ commit }, paramsJson){ 
        commit(types.PLAYING_RADIO_INFO, paramsJson)
    },
    async getPrivateRadio({ commit }, paramsJson){
        try {
            let { extra } = paramsJson
            delete paramsJson.extra
            const jsondata = await radioService.getPrivateRadio(paramsJson)
            if (jsondata.error_code == 22000) {
                let result = jsondata.data.songs
                if ( extra ) {
                    result.unshift( extra )
                }
                commit(types.PRIVATE_RADIO, result)
                return Promise.resolve( result ) 
            }
        } catch (err) {

        }
    },
    async setCurrentPlayingPrivateRadio({ commit }, paramsJson){
        let { lrclink, title, author } = paramsJson
        if ( !paramsJson.artist_list ) {
            let idArr = paramsJson.all_artist_id.split(","),
                authorArr = paramsJson.author.split(",")
            paramsJson.artist_list = []
            idArr.forEach((item, index)=>{
                paramsJson.artist_list.push({
                    artist_id: idArr[index],
                    artist_name: authorArr[index]
                })
            })
        }
        lrclink = "http://qukufile2.qianqian.com" + lrclink
        let lyric_array, isPureText
        if (lrclink && title && author) {                 
            lyricParser.getLyricFilePath(lrclink, title, author, true, function(file) {
                lyricContent.getLyricContent(title, author, (data) => {
                    lyric_array = data.array_lyric;
                    isPureText = data.isPureText;
                    if (isPureText) {
                        lyric_array = data.array_pure_text;
                    }
                    commit(types.CURRENT_PLAYING_PRIVATE_RADIO, { paramsJson, lyric_array})
                })
            })
        } else {
            lyric_array = []
            isPureText = false
            paramsJson.lyric_array = lyric_array
            commit(types.CURRENT_PLAYING_PRIVATE_RADIO, { paramsJson, lyric_array})
        }

        
    }
}

const mutations = {
    [types.RADIO_CATEGORY](state, radioCategory){
        state.radioCategory = radioCategory
    },
    [types.RADIO_ALL_SCENE](state, radioAllScene){
        state.radioAllScene = radioAllScene
    },
    [types.SCENE_SONG](state, sceneSong){
        state.radioSong = radioSong
    },
    [types.PLAYING_RADIO_INFO](state, paramsJson) {
        state.playing_radio_info = paramsJson;
    },
    [types.PRIVATE_RADIO](state, songs) {  
        state.private_radio = songs;
    },
    [types.CURRENT_PLAYING_PRIVATE_RADIO](state, {paramsJson, lyric_array}) {
        Object.assign( paramsJson, {lyric_array} )
        state.current_playing_privateRadio = paramsJson;
    },
}

export default {
    state,
    getters,
    actions,
    mutations
}