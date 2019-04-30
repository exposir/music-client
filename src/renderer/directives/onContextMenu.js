let setContextMenuPosition = (domObj, event) => {
    domObj.style.display = 'block'

    let clientX = event.clientX
    let clientY = event.clientY

    //右键菜单自身宽高
    let contextMenuBoxStyle = window.getComputedStyle(domObj, null)
    let contextMenuBoxWidth = parseFloat(contextMenuBoxStyle.width)
    let contextMenuBoxHeight = parseFloat(contextMenuBoxStyle.height)


    //左边导航的宽度
    let leftBox = document.getElementById('mainWindowLeftBox')
    let leftBoxStyle = window.getComputedStyle(leftBox, null)
    let leftBox_width = parseFloat(leftBoxStyle.width)

    //上面bar的高度
    let topBox = document.getElementById('BasicSet')
    let topBoxStyle = window.getComputedStyle(topBox, null)
    let topBox_height = parseFloat(topBoxStyle.height)

    // 音乐窗主区域
    let mainContentBox = document.getElementById('mainContent')
    let mainContentBoxStyle = window.getComputedStyle(mainContentBox, null)
    let mainContentBoxScrollTop = mainContentBox.scrollTop
    let mainContentBoxWidth = parseFloat(mainContentBoxStyle.width)
    let mainContentBoxHeight = parseFloat(mainContentBoxStyle.height)

    let offsetX = clientX - leftBox_width
    let offsetY = clientY - topBox_height + mainContentBoxScrollTop

    //判断右键菜单距离底部和右边距离
    let diff_width = mainContentBoxWidth - offsetX
    let diff_height = mainContentBoxHeight - offsetY

    if (diff_width < contextMenuBoxWidth) {
        offsetX = offsetX - contextMenuBoxWidth
    }

    if (diff_height < contextMenuBoxHeight) {
        offsetY = offsetY - contextMenuBoxHeight
    }
    domObj.style.left = offsetX + 'px'
    domObj.style.top = offsetY + 'px'
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

export default {
    bind: (el, binding, vnode) => {
        el.addEventListener('contextmenu', (event) => {
            let contextMenuType = binding.value.contextMenuType
            console.log(contextMenuType);
            // console.log(el.dataset.index);
            if (!el.classList.contains('active')) { //当前歌曲没有被选中的话 
                //右键单击则选中当前元素并清空其他兄弟元素的选中状态
                el.classList.add('active')
                let siblings = siblingsDom(el)
                siblings.forEach((elem) => {
                    elem.classList.remove('active')
                })

                //当前选中的sate值更新  
                let index = el.dataset.index
                    // console.log('rbutton clicked index is: ' + index);
                let ctrlKey = false;
                let shiftKey = false;
                let isCurrentPlaylist = true;
                let isRightButton = true;
                if (contextMenuType != 'currentPlayingListContextMenu') {
                    isCurrentPlaylist = false;
                }
                // console.log(vnode.context.$store.state.list_selected_lines);
                vnode.context.$store.dispatch('updateLinesSelected', { index, ctrlKey, shiftKey, isCurrentPlaylist, isRightButton });
                // let songArr = vnode.context.$store.state.currentPlaylist.current_playing_list[selectedIndex]
                // vnode.context.$store.dispatch('setCurrentPlayingSelectedSongList', songArr)

                if (contextMenuType === 'favourSongContextMenu') { //删除收藏的歌曲  需要songid
                    let songid = el.dataset.key
                }
            }

            vnode.context.$store.dispatch('setContextMenuType', contextMenuType)
            let contextMenuDom = document.getElementById(contextMenuType)
            if (contextMenuDom) {
                setContextMenuPosition(contextMenuDom, event)
            } else {
                let timer = setInterval(() => {
                    if (document.getElementById(contextMenuType)) {
                        clearInterval(timer)
                        contextMenuDom = document.getElementById(contextMenuType)
                        setContextMenuPosition(contextMenuDom, event)
                    }
                }, 100)
            }

        })

    },
    update: () => {},
    unbind: (el) => {
        // el.removeEventListener(contextMenuType)
    }
}