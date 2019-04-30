import domAction from 'utils/domAction.js'
export default {
    setScrollBarStatus() {
        let mainMusicWrapperDom = document.querySelector('.mainMusicWrapper')
        if (mainMusicWrapperDom) {
            let mainMusicWrapperHeight = domAction.getStyle(mainMusicWrapperDom, 'height')

            let mainHeaderDom = mainMusicWrapperDom.querySelector('.main-menu-box')
            let mainHeaderDomTotalHeight = domAction.getStyle(mainHeaderDom, 'height')


            let mainWrapperHeight = parseFloat(mainMusicWrapperHeight) - parseFloat(mainHeaderDomTotalHeight) 
            console.log('mainWrapperHeight: ' + mainWrapperHeight)

            let scrollBarBodyDom = document.querySelector('.scrollBarBody')
            domAction.setStyle(scrollBarBodyDom, 'height', mainWrapperHeight + 'px')
        }

    },
    scrollToActivePosition() {
        //滚动到当前选中的歌曲的位置
        let scrollBarBody = document.querySelector('.scrollBarBody')
        let i = 0
        let timer = setInterval(() => {
            i++
            if (scrollBarBody) {
                let activeSongLiDom = scrollBarBody.querySelector('.choseme')
                if (activeSongLiDom) {
                    let index = parseInt(activeSongLiDom.dataset.index)
                    let _height = domAction.getStyle(activeSongLiDom, 'height')
                    let offsetTop = parseFloat(_height) * index

                    scrollBarBody.scrollTop = offsetTop
                    clearInterval(timer)
                } else {
                    if (i > 10) {
                        clearInterval(timer)
                    }
                }
            } else {
                scrollBarBody = document.querySelector('.scrollBarBody')
            }

        }, 500)
    }
}