'use strict'

export default {

    set_setting_value: (key, value) => {
        let local_storage = window.localStorage;
        if (!local_storage) {
            console.log("current browser do not support local storage");
        } else {
            local_storage.setItem(key, value);
        }
    },

    get_setting_value: (key) => {
        let local_storage = window.localStorage;
        let value = "";
        if (!local_storage) {
            console.log("current browser do not support local storage");
        } else {
            value = local_storage.getItem(key);
        }
        return value;
    },

    remove_setting_item: (key) => {
        let local_storage = window.localStorage;
        if (!local_storage) {
            console.log("current browser do not support local storage");
        } else {
            local_storage.removeItem(key);
        }
    },

    clear_settings: () => {
        let local_storage = window.localStorage;
        if (!local_storage) {
            console.log("current browser do not support local storage");
        } else {
            local_storage.clear();
        }
    }

}