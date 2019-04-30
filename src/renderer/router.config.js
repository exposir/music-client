//公用基础组件
import album from './components/public/album.vue'
import gedan from './components/public/gedan.vue'
import singer from './components/public/singer.vue'
import bangdan from './components/public/bangdan.vue'
import empty from './components/empty/jump_empty'
import offline from './components/empty/offline'
import massOperator from './components/public/mass-operation.vue'

//左侧列表组件
// import dynamicMain from './components/dynamic/dynamicMain.vue'
import munative from './components/munative/munative.vue'
import muaudition from './components/munative/muaudition.vue'
import muwindow from './components/musicwindow/musicwindow.vue'
import favourSinger from './components/user/favourSinger.vue'
import favourAlbum from './components/user/favourAlbum.vue'
import favourCollectionSong from './components/user/favourCollectionSong.vue'
import favourGendan from './components/user/favourGedan.vue'
import downloaded from './components/user/download/downLoaded.vue'
import downloading from './components/user/download/downloading.vue'
import mvvideo from './components/mvvideo/mvWindow.vue'
import collection from './components/user/collection.vue'
import localCollection from './components/user/localCollection.vue'
import privateRadio from './components/user/privateRadio.vue'

// 音乐窗组件
import recommend from './components/musicwindow/recommend.vue'
import bangdanIndex from './components/musicwindow/bangdanIndex.vue'
import gedanIndex from './components/musicwindow/gedanIndex.vue'
import radioIndex from './components/musicwindow/radioIndex.vue'
import singerIndex from './components/musicwindow/singerIndex.vue'
import singerIndexList from './components/musicwindow/singerIndexList.vue'
import searchList from './components/search/searchList'

//音乐视频组件
import mvRecommend from './components/mvvideo/mvRecommend.vue'
import mvBigman from './components/mvvideo/mvBigman.vue'
import mvReplay from './components/mvvideo/mvReplay.vue'
import mvList from './components/mvvideo/mvList.vue'

//顶部右侧组件
import setup from './components/basicset/newSetup.vue'

//编辑组件
import editGedan from './components/edit/editGedan.vue'
import editPerson from './components/edit/editPerson.vue'

import newSongIndex from './components/musicwindow/newSongIndex.vue'

export default {
    // mode: 'history',
    routes: [
        { path: '/music/public/album/:id/:type?', component: album },
        { path: '/music/public/gedan/:id/:type?/:cate?', component: gedan },
        { path: '/music/public/singer/:id/:tinguid/:type?', component: singer }, //若无tinguid，默认传0
        { path: '/music/public/bangdan/:id', component: bangdan },
        { path: '/music/public/massop/', component: massOperator },
        // { path: '/dynamic-main', component: dynamicMain },
        { path: '/search/:type/:keyword/:page', component: searchList },
        //{ path: '/my/local/:songid', component: munative }, //本地歌曲
        { path: '/my/history/:songid', component: muaudition }, //播放历史
        {
            path: '/my/collection',
            component: collection,
            children: [
                { path: '/favourCollectionSong', component: favourCollectionSong },
                { path: '/favourGedan', component: favourGendan },
                { path: '/favourSinger', component: favourSinger },
                { path: '/favourAlbum', component: favourAlbum },
                { path: '/', redirect: '/favourCollectionSong' }
            ]
        },
        {
            path: '/my/localanddownload',
            component: localCollection,
            children: [
                { path: '/my/local/:songid', component: munative },
                { path: '/my/downloaded/:songid', component: downloaded },
                { path: '/my/downloading/', component: downloading },
                { path: '/', redirect: '/my/local/0' }
            ]
        },
        {
            path: '/muwindow',
            component: muwindow,
            children: [
                { path: '/recommend', component: recommend },
                { path: '/bangdanIndex', component: bangdanIndex },
                { path: '/gedanIndex/:channelname/:ordertype', component: gedanIndex },
                { path: '/radioIndex', component: radioIndex },
                { path: '/newSongIndex/:labelindex', component: newSongIndex },
                {
                    path: '/singerIndex',
                    component: singerIndex,
                    children: [
                        { path: '/singerlist', component: singerIndexList },
                        { path: '/singerIndex', redirect: '/singerlist' }
                        // {path:'*',redirect:'/recommend/gedanIndex/singerlist/abc/0/area/0/sex/0/offset/0'}
                    ],
                },
                { path: '/gedanIndex/:catename', component: gedanIndex },
                { path: '/muwindow', redirect: '/recommend' }
            ]
        },
        {
            path: '/mvvideo',
            component: mvvideo,
            children: [
                { path: '/mvRecommend', component: mvRecommend },
                { path: '/mvBigman', component: mvBigman },
                { path: '/mvReplay', component: mvReplay },
                { path: '/mvList', component: mvList },
                { path: '/mvvideo', redirect: '/mvRecommend' }
            ]
        },
        { path: '/privateRadio', component: privateRadio },
        { path: '/my/favorite/singer/', component: favourSinger },
        //{ path: '/my/downloaded/:songid', component: downloaded },
        //{ path: '/my/downloading/', component: downloading },
        { path: '/editGedan', component: editGedan },
        { path: '/editPerson', component: editPerson },
        { path: '/setup', component: setup },
        { path: '/404/', component: empty },
        { path: '/offline/', component: offline },
        { path: '*', redirect: '/muwindow' }

    ],
    // scrollBehavior(to, from, savedPosition) {
    //     console.log('scrollBehavior')
    //     return savedPosition || { x: 0, y: 0 }
    // }
}