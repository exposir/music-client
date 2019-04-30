import * as types from '../mutation-types'
import serviceCommon from 'service/common'
import albumService from 'service/albumService'

const state = {
    albumInfo: {}
}

const getters = {
    albumInfo: () => state.albumInfo
}

const actions = {
    async getAlbumInfo({ commit }, paramsJson) {
        try {
            let jsondata = await albumService.getAlbumInfo(paramsJson) 
                // paramsJson.offset = 0
                // paramsJson.limits = 1
                // const jsondata2 = await singerService.getAlbumInfo(paramsJson)
            let songList = jsondata.songlist,
                songdata = [],
                maxhot
            
            if (songList.length > 0) {
                maxhot = jsondata.songlist[0].hot
                songList.forEach((value, index) => {
                    let authorLinksArr = serviceCommon.getAuthorsLinksArr(value.author, value.all_artist_id)
                    value.authorLinksArr = authorLinksArr
                    jsondata.albumInfo.authorLinksArr = authorLinksArr;
                    songdata.push(value)
                })
            }

            let albumdata = {}
            albumdata.songlist = songList.length > 0 ?
                                    serviceCommon.computedSongHotLong(songdata, maxhot):
                                    songList;
            albumdata.albumInfo = jsondata.albumInfo
            albumdata.is_collect = jsondata.is_collect
                // console.log(JSON.stringify(albumdata));
            commit(types.ALBUM_INFO, albumdata)
        } catch (err) {

        }
    }

}
const mutations = {
    [types.ALBUM_INFO](state, albumdata) {
        state.albumInfo = albumdata
    }
}
export default {
    state,
    getters,
    actions,
    mutations
}