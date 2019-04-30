import * as types from '../mutation-types'
import settings from '../../dataoperation/settings/settings'
import settingKey from '../../dataoperation/settings/settingsKey'
import constant from '../../constant.js'
import pathUtils from '../../pathUtils/pathUtils.js'

let default_shortcut = [{ accelerator_key: 'Ctrl+shift+M', desc: 'shortcut_minimode' }, //迷你模式
    { accelerator_key: 'Ctrl+Alt+W', desc: 'shortcut_minimize' }, //最小化
    // { accelerator_key: 'CmdOrCtrl+Alt+E', desc: 'shortcut_desklyric' }, //桌面歌词
    { accelerator_key: 'Ctrl+shift+X', desc: 'shortcut_playpause' }, //播放/暂停
    { accelerator_key: 'Ctrl+shift+L', desc: 'shortcut_playprev' }, //播放上一首
    { accelerator_key: 'Ctrl+shift+R', desc: 'shortcut_playnext' }, //播放下一首
    { accelerator_key: 'Ctrl+shift+U', desc: 'shortcut_volume_up' }, //增大音量
    { accelerator_key: 'Ctrl+shift+D', desc: 'shortcut_volume_down' }, //减小音量
    { accelerator_key: 'Ctrl+Alt+S', desc: 'shortcut_volume' }, //开/关音量
    { accelerator_key: 'Ctrl+Alt+F', desc: 'shortcut_fast_forward' }, //快进
    { accelerator_key: 'Ctrl+Alt+R', desc: 'shortcut_rewind' } //快退
];

//封装一些需要对界面即时有影响的设置的逻辑，比如自动播放，音量，循环模式之类的
const state = {
    playMode: 'loop',
    volume: '50',
    autoplay: '1',
    isMuted: '0',
    displayInfo: '',
    lastPlayMode: '',
    defaultPlayer: '1',
    closeMode: '1', //0:退出到托盘 1:直接退出
    shortCuts: [], //快捷键
    downloadFolder: '', //下载目录
    cacheFolder: '', //缓存目录
    cacheSize: '1000', //缓存大小
    download_lyric_with_song: '1', //下载歌曲的时候同步下载歌词
    enableGlobalShortCut: '1'
}

const getters = {
    playMode: () => state.playMode,
    volume: () => state.volume,
    autoplay: () => state.autoplay,
    defaultPlayer: () => state.defaultPlayer,
    isMuted: () => state.isMuted,
    displayInfo: () => state.displayInfo,
    lastPlayMode: () => state.lastPlayMode,
    closeMode: () => state.closeMode,
    shortCuts: () => state.shortCuts,
    downloadFolder: () => state.downloadFolder,
    cacheFolder: () => state.cacheFolder,
    cacheSize: () => state.cacheSize,
    downloadLyricWithSong: () => state.download_lyric_with_song,
    enableGlobalShortCut: () => state.enableGlobalShortCut
}

const actions = {
    setPlayMode({ commit, dispatch }, mode) {
        settings.set_setting_value(settingKey.playmode, mode)
        commit(types.PLAY_MODE, mode)
        dispatch('reGenerationOrderPlayList');
    },
    getPlayMode({ commit }) {
        let mode = settings.get_setting_value(settingKey.playmode)
        if (constant.playModeArray.indexOf(mode) == -1) {
            mode = constant.defaultPlayMode
        }
        commit(types.PLAY_MODE, mode)
    },
    getShortcutState({ commit }) {
        let state = settings.get_setting_value(settingKey.enableShortcut)
        if (state == null || state == "" || typeof state == "undefined") {
            state = '1'
        }
        commit(types.ENABLE_SHORTCUT, state)
    },
    setShortcutState({ commit }, state) {
        settings.set_setting_value(settingKey.enableShortcut, state)
        commit(types.ENABLE_SHORTCUT, state)
    },
    getDefaultPlayer({ commit }) {
        let state = settings.get_setting_value(settingKey.defaultPlayer)
        if (state == null || state == "" || typeof state == "undefined") {
            state = '0'
        }
        commit(types.DEFAULI_PLAYER, state)
    },
    setDefaultPlayer({ commit }, state) {
        settings.set_setting_value(settingKey.defaultPlayer, state)
        commit(types.DEFAULI_PLAYER, state)
    },
    setVolume({ commit }, volume) {
        settings.set_setting_value(settingKey.volume, volume)
        commit(types.VOLUME, volume)
    },
    getVolume({ commit }) {
        let volume = settings.get_setting_value(settingKey.volume)
        if (volume == null || volume == "" || typeof volume == "undefined") {
            volume = '20'
        }
        commit(types.VOLUME, volume)
    },
    setAutoPlay({ commit }, autoplay) {
        settings.set_setting_value(settingKey.autoplay, autoplay)
        commit(types.AUTO_PLAY, autoplay)
    },
    getAutoPlay({ commit, dispatch }) {
        let autoplay = settings.get_setting_value(settingKey.autoplay)
        if (autoplay == null || autoplay == "" || typeof autoplay == "undefined") {
            autoplay = '0'
        }
        console.log('current auto play state is: ' + autoplay)
        commit(types.AUTO_PLAY, autoplay)
    },
    setIsMuted({ commit }, isMuted) {
        settings.set_setting_value(settingKey.isMuted, isMuted)
        commit(types.IS_MUTED, isMuted)
    },
    getIsMuted({ commit }) {
        let isMuted = settings.get_setting_value(settingKey.isMuted)
        if (isMuted === null || isMuted === "" || typeof isMuted === "undefined") {
            isMuted = '0'
        }
        commit(types.IS_MUTED, isMuted)
    },
    setDisplayInfo({ commit }, param) {
        settings.set_setting_value(settingKey.displayInfo, JSON.stringify(param))
        commit(types.DISPLAY_INFO, param)
    },
    getDisplayInfo({ commit }) {
        let paramStr = settings.get_setting_value(settingKey.displayInfo)
        let param
        if (paramStr === null || paramStr === "" || typeof paramStr === "undefined" || paramStr === 'undefined') {
            param = {
                type: 'others'
            }
        } else {
            param = JSON.parse(paramStr)
        }
        commit(types.DISPLAY_INFO, param)
    },
    setLastPlayModel({ commit }, mode) { //播放"电台"和"私人电台"时，播放模式需要改为loop,所以需要记录当前的播放模式
        commit(types.LAST_PLAY_MODE, mode)
    },
    getCloseMode({ commit }) {
        let mode = settings.get_setting_value(settingKey.closemode);
        if (mode == null || mode == "" || typeof mode == "undefined") {
            mode = '1'
        }
        commit(types.CLOSE_MODE, mode);
    },
    setCloseMode({ commit }, mode) {
        if (mode != '1' && mode != '0') {
            mode = '1'
        }
        settings.set_setting_value(settingKey.closemode, mode);

        commit(types.CLOSE_MODE, mode)
    },
    getShortCuts({ commit }) {
        let shortcuts = [];
        for (let i = 0; i < default_shortcut.length; i++) {
            let default_item = default_shortcut[i];
            let item = {};
            item.desc = default_item.desc;

            let value = settings.get_setting_value(default_item.desc);
            // console.log('desc: ' + item.desc + '   value is: ' + value)
            if (value == null || typeof value == "undefined") {
                value = default_item.accelerator_key;
            }

            item.accelerator_key = value;
            shortcuts.push(item);
        }
        console.log(shortcuts);

        commit(types.GET_SHORTCUTS, shortcuts);
        eventBus.$emit('shortcut_ready')
    },
    resetShortcutDefault({ commit }) {
        let shortcuts = [];
        for (let i = 0; i < default_shortcut.length; i++) {
            let default_item = default_shortcut[i];
            commit(types.MODIFY_SHORTCUT_ITEM, default_item);
            settings.set_setting_value(default_item.desc, default_item.accelerator_key)
        }
    },
    modifyShortcutItem({ commit }, shortcut_item) {
        commit(types.MODIFY_SHORTCUT_ITEM, shortcut_item);
        settings.set_setting_value(shortcut_item.desc, shortcut_item.accelerator_key)
    },
    saveShortCuts({}) {
        for (let i = 0; i < state.shortCuts.length; i++) {
            let item = state.shortCuts[i];
            settings.set_setting_value(item.desc, item.accelerator_key);
        }
    },
    getDownloadFolder({ commit }) {
        let folder = settings.get_setting_value(settingKey.downloadFolder);
        if (folder == null || folder == "" || typeof folder == "undefined") {
            folder = pathUtils.getMusicFolder();
        }
        console.log('download folder is: ' + folder)
        commit(types.DOWNLOAD_FOLDER, folder);
    },
    setDownloadFolder({ commit }, folder) {
        commit(types.DOWNLOAD_FOLDER, folder);
        settings.set_setting_value(settingKey.downloadFolder, folder);
    },
    getCacheFolder({ commit }) {
        let folder = settings.get_setting_value(settingKey.cacheFolder);
        if (folder == null || folder == "" || typeof folder == "undefined") {
            folder = pathUtils.getCacheFolder();
            // console.log('22222-' + folder + '-2222222222222')
        }
        console.log('cache folder is: ' + folder)
        commit(types.CACHE_FOLDER, folder);
    },
    setCacheFolder({ commit, dispatch }, folder) {
        commit(types.CACHE_FOLDER, folder);
        settings.set_setting_value(settingKey.cacheFolder, folder);
        dispatch('setAudioCoreCacheFolder', folder)
    },
    getCacheSize({ commit }) {
        let size = settings.get_setting_value(settingKey.cacheSize);
        if (size == null || size == "" || typeof size == "undefined") {
            size = '1000';
        }
        let size_int = Number(size)
        console.log('cache size is: ' + size_int)
        commit(types.CACHE_SIZE, size_int);
    },
    setCacheSize({ commit, dispatch }, size) {
        commit(types.CACHE_SIZE, size);
        settings.set_setting_value(settingKey.cacheSize, size);
        dispatch('setAudioCoreCacheSize', size);
    },
    getDownloadLyricWithSong({ commit }) {
        let value = settings.get_setting_value(settingKey.download_lyric_with_song);
        if (value == null || value == "" || typeof value == "undefined") {
            value = '1';
        }
        commit(types.DOWNLOAD_LYRIC_WITH_SONG, value);
    },
    setDownloadLyricWithSong({ commit }, value) {
        commit(types.DOWNLOAD_LYRIC_WITH_SONG, value);
        settings.set_setting_value(settingKey.download_lyric_with_song, value);
    }
}

const mutations = {
    [types.PLAY_MODE](state, mode) {
        state.playMode = mode;
    },
    [types.VOLUME](state, volume) {
        state.volume = volume;
    },
    [types.AUTO_PLAY](state, autoplay) {
        state.autoplay = autoplay;
    },
    [types.IS_MUTED](state, isMuted) {
        state.isMuted = isMuted
    },
    [types.DISPLAY_INFO](state, param) {
        state.displayInfo = param
    },
    [types.LAST_PLAY_MODE](state, mode) {
        state.lastPlayMode = mode;
    },
    [types.GET_SHORTCUTS](state, shortCuts) {
        state.shortCuts = shortCuts
    },
    [types.DOWNLOAD_FOLDER](state, downloadFolder) {
        state.downloadFolder = downloadFolder;
    },
    [types.CACHE_FOLDER](state, cacheFolder) {
        state.cacheFolder = cacheFolder;
    },
    [types.CACHE_SIZE](state, cacheSize) {
        state.cacheSize = cacheSize;
    },
    [types.DOWNLOAD_LYRIC_WITH_SONG](state, value) {
        state.download_lyric_with_song = value;
    },
    [types.CLOSE_MODE](state, mode) {
        state.closeMode = mode;
    },
    [types.ENABLE_SHORTCUT](state, shortcut_state) {
        state.enableGlobalShortCut = shortcut_state;
    },
    [types.DEFAULI_PLAYER](state, default_player) {
        state.defaultPlayer = default_player;
    },
    [types.MODIFY_SHORTCUT_ITEM](state, shortcut_item) {
        for (let i = 0; i < state.shortCuts.length; i++) {
            let item = state.shortCuts[i];
            if (shortcut_item.desc == item.desc) {
                state.shortCuts.splice(i, 1, shortcut_item);
                break;
            }
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}