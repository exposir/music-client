import * as types from '../mutation-types'

const state = {
    contextMenuType: "",
    list_selected_lines: [],
    current_playlist_select_lines: [],
    list_selected_songsInfo: []
}

const getters = {
    contextMenuType: () => state.contextMenuType,
    ListSelectedLines: () => state.list_selected_lines,
    currentPlaylistSelectLines: () => state.current_playlist_select_lines,
    list_selected_songsInfo: () => state.list_selected_songsInfo
}

const actions = {
    setContextMenuType({ commit }, type) {
        commit(types.CONTEXTMENU_TYPE, type)
    },
    setListSelectedLines({ commit }, { arrLines, isCurrentPlaylist }) {
        commit(types.LIST_SELECTED_LINES, { arrLines, isCurrentPlaylist });
    },
    // setListSelectedSongsInfo({ commit }, arrSongsInfo) {
    //     commit(types.LIST_SELECTED_SONGSINFO, arrSongsInfo)
    // },
    emptyLinesSelected({ commit }) {
        let arrLines = [];
        let isCurrentPlaylist = true;
        commit(types.LIST_SELECTED_LINES, { arrLines, isCurrentPlaylist });
        isCurrentPlaylist = false;
        commit(types.LIST_SELECTED_LINES, { arrLines, isCurrentPlaylist });
    },
    updateLinesSelected({ commit }, { index, ctrlKey, shiftKey, isCurrentPlaylist, isRightButton }) {
        let arrLines = [];

        // console.log('isright button: ' + isRightButton + ' index is: ' + index);
        if (typeof isRightButton != 'undefined' && isRightButton) {
            if (isCurrentPlaylist) {
                if (state.current_playlist_select_lines.indexOf(index) == -1) {
                    arrLines.push(index);
                    commit(types.LIST_SELECTED_LINES, { arrLines, isCurrentPlaylist });
                }
            } else {
                if (state.list_selected_lines.indexOf(index) == -1) {
                    arrLines.push(index);
                    commit(types.LIST_SELECTED_LINES, { arrLines, isCurrentPlaylist });
                }
            }
        } else {
            if (ctrlKey) {
                // console.log('ctrlKey pushed!')
                if (isCurrentPlaylist) {
                    for (let i = 0; i < state.current_playlist_select_lines.length; i++) {
                        arrLines.push(state.current_playlist_select_lines[i]);
                    }
                } else {
                    for (let i = 0; i < state.list_selected_lines.length; i++) {
                        arrLines.push(state.list_selected_lines[i]);
                    }
                }
                let index_ret = arrLines.indexOf(index);
                if (index_ret != -1) {
                    arrLines.splice(index_ret, 1);
                } else {
                    arrLines.push(index);
                }
            } else if (shiftKey) { // shift键
                // console.log('shiftKey pushed!')
                let top_selected = 0;
                if (isCurrentPlaylist && state.current_playlist_select_lines.length > 0) {
                    top_selected = state.current_playlist_select_lines[0];
                } else if (!isCurrentPlaylist && state.list_selected_lines.length > 0) {
                    top_selected = state.list_selected_lines[0];
                }
                // console.log('top_selected is: ' + top_selected);
                if (top_selected <= index) {
                    for (let i = top_selected; i <= index; i++) {
                        arrLines.push(i);
                    }
                } else {
                    for (let i = index; i <= top_selected; i++) {
                        arrLines.push(i);
                    }
                }

            } else {
                arrLines.push(index);
                // console.log('mouse clicked index is: ' + index);
            }
            commit(types.LIST_SELECTED_LINES, { arrLines, isCurrentPlaylist });
        }
    },
    getSelectIndexs({ commit, dispatch }, param) {
        if (param.isCurrentPlaylist) {
            for (let i = 0; i < state.current_playlist_select_lines.length; i++) {
                param.indexArray.push(state.current_playlist_select_lines[i]);
            }
        } else {
            for (let i = 0; i < state.list_selected_lines.length; i++) {
                param.indexArray.push(state.list_selected_lines[i]);
            }
        }
    }
}

const mutations = {
    [types.CONTEXTMENU_TYPE](state, type) {
        state.contextMenuType = type
    },
    [types.LIST_SELECTED_LINES](state, { arrLines, isCurrentPlaylist }) {
        if (isCurrentPlaylist) {
            state.current_playlist_select_lines.splice(0, state.current_playlist_select_lines.length);
            for (let i = 0; i < arrLines.length; i++) {
                state.current_playlist_select_lines.push(arrLines[i]);
            }

            if (state.current_playlist_select_lines.length > 1) {
                state.current_playlist_select_lines.sort(function(a, b) {
                    return a - b;
                })
            }

        } else {
            state.list_selected_lines.splice(0, state.list_selected_lines.length);
            for (let i = 0; i < arrLines.length; i++) {
                state.list_selected_lines.push(arrLines[i]);
            }
            if (state.list_selected_lines.length > 1) {
                state.list_selected_lines.sort(function(a, b) {
                    return a - b;
                })
            }

            let arr_empty = [];
            state.list_selected_lines = state.list_selected_lines.concat(arr_empty);
        }
        // console.log(state.list_selected_lines)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}