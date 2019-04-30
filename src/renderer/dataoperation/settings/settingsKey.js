'use strict'

//所有的设置相关的字段名称都要定义在这里，然后外面使用这个名字来存储和读取设置的值

let setting_key = {
    volume: "volume",
    autoplay: "autoplay",
    playmode: "playmode",
    currentplay_song: "currentplay_song",
    currentplay_song_index: "currentplay_song_index",
    isMuted: 'isMuted',
    displayInfo: 'displayInfo',
    closemode: 'closemode',
    cacheFolder: 'cacheFolder',
    cacheSize: 'cacheSize',
    downloadFolder: 'downloadFolder',
    download_lyric_with_song: 'download_lyric_with_song',
    defaultPlayer: 'defaultPlayer',
    enableShortcut: 'enableShortcut'
}

export default setting_key;