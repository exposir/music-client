import {Menu} from 'electron'
export default{
    createDefaultMenu() {
        if (Menu.getApplicationMenu() || process.platform !== 'darwin') return

        const template = [{
                label: '千千音乐',
                submenu: [{
                        label: '关于千千音乐',
                        role: 'about'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: '隐藏千千音乐',
                        role: 'hide'
                    },
                    {
                        label: '隐藏其他',
                        role: 'hideothers'
                    },
                    {
                        label: '显示全部',
                        role: 'unhide'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: '退出千千音乐',
                        role: 'quit'
                    }
                ]
            },
            {
                label: '编辑',
                submenu: [{
                        label: '撤销',
                        role: 'undo'
                    },
                    {
                        label: '恢复',
                        role: 'redo'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: '剪切',
                        role: 'cut'
                    },
                    {
                        label: '复制',
                        role: 'copy'
                    },
                    {
                        label: '粘贴',
                        role: 'paste'
                    },
                    {
                        label: '全选',
                        role: 'selectall'
                    }
                ]
            }
            // {
            // label: 'View',
            // submenu: [
            //     {
            //     role: 'reload'
            //     },
            //     {
            //     role: 'forcereload'
            //     }
            // ]
            // }
        ]

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
}