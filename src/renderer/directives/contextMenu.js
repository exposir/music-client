import MessageBox from 'components/messageBox/main.js'
//该文件已废弃
export default {
    bind: (el, binding, vnode) => {
        el.addEventListener('contextmenu', (event) => {

            let songArray = binding.value.songArray
            let list_type = el.dataset.listtype;
            let listid = el.dataset.listid;
            let select_index_array = el.dataset.selectindexs

            let type = binding.value.type;

            let clientX = event.clientX
            let clientY = event.clientY
            let positionData = {
                'clientX': clientX,
                'clientY': clientY
            }

            if (!songArray && type != 'downloading_submenu') {
                // let list_title = binding.value.list_title
                let list_title = el.dataset.listtitle
                    // console.log('list_title:' + list_title)

                let list_id = el.dataset.listid

                let url = el.dataset.url
                eventBus.$emit('goPage', url)
                MessageBox.leftBarContext(type, list_id, list_title, positionData)
            }

        })

    },
    update: () => {},
    unbind: (el) => {
        // el.removeEventListener(contextMenuType)
    }
}

let siblingsDom = (elem) => {
    let result = []
    let n = elem.parentNode.firstChild
    for (; n; n = n.nextSibling) {
        if (n.nodeType === 1 && n !== elem) {
            result.push(n)
        }
    }
    return result
}