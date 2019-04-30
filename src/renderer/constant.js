//这里要存储一些全局的变量，避免以后各地都使用字符串带来的问题

let constant = {
    history_list_id: "history",
    local_songlist_id: "local_songlist",
    current_play_list_id: "current_paly_list",
    downloaded_songlist_id: "downloaded_songlist",
    downloading_songlist_id: "downloading_songlist",
    favorite_songlist_id: "favorite_songlist",
    playModeArray: ['loop', 'random', 'single'],
    defaultPlayMode: 'loop',
    maxHistoryListSongCount: 500,
    maxPlayErrorCount: 5,
    maxDownloadingCount: 5,
    maxItemCountPerPage: 100,
}

export default constant;