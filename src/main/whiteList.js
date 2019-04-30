/**
 * 新开窗口 白名单
 * 白名单当前窗口打开，其他都外跳到默认浏览器打开
 **/
// import domAction from '../../utils/domAction'
const whitelist = [
    '/recommend', //首页--刚打开页面时
    '/mvpage', //mv页面
    '/lyrpage', //歌词页面
    '/graph.qq.com/oauth2.0/show?which=Login&display=pc', //qq登录
    '/open.weixin.qq.com/connect/qrconnect?appid=', //微信登录
    '/api.weibo.com/oauth2/authorize?response_type=code&client_id=617532605', //微博登录
];

const login_third = [
    '/graph.qq.com/oauth2.0/show?which=Login&display=pc', //qq登录
    '/open.weixin.qq.com/connect/qrconnect?appid=', //微信登录
    '/api.weibo.com/oauth2/authorize?response_type=code&client_id=617532605', //微博登录
]

export default {
    isInWhitelist(url) {
        for (var i = 0; i < whitelist.length; i++) {
            if (url.indexOf(whitelist[i]) > -1) {
                return true;
            }
        }
        return false;
    },

    isLoginUrl(url) {
        for (var i = 0; i < login_third.length; i++) {
            if (url.indexOf(login_third[i]) > -1) {
                return true;
            }
        }
        return false;
    }
}