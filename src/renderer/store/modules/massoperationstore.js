'use-strict'
import * as types from '../mutation-types'
import commonFuns from '../../components/commonFuns/common.js'

const state = {
    massoperation_select_lines: [] //批量操作选择的songinfo
}

const getters = {
    massOpSelectLines: () => state.massoperation_select_lines,
}

const actions = {
    updateSelectIndex({ commit, dispatch }, index) {
        commit(types.UPDATESELECTMASSITEM, index);
    },
    addItemsAndClearOld({ commit, dispatch }, index_arr) {
        commit(types.ADD_ITEMS_AND_CLEAR_OLD, index_arr);
    },
    emptyMassOperationList({ commit, dispatch }) {
        commit(types.EMPTY_MASSOPERATION_LIST);
    }
}

const mutations = {
    [types.UPDATESELECTMASSITEM](state, index) {
        let already_exist = false;
        for (let i = 0; i < state.massoperation_select_lines.length; i++) {
            let cur_index = state.massoperation_select_lines[i];
            if (cur_index == index) {
                already_exist = true;
                state.massoperation_select_lines.splice(i, 1);
                break;
            }
        }

        if (!already_exist) {
            state.massoperation_select_lines.push(index);
        }
    },
    [types.EMPTY_MASSOPERATION_LIST](state) {
        state.massoperation_select_lines.splice(0, state.massoperation_select_lines.length);
    },
    [types.ADD_ITEMS_AND_CLEAR_OLD](state, index_arr) {
        state.massoperation_select_lines.splice(0, state.massoperation_select_lines.length);
        state.massoperation_select_lines = index_arr;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}