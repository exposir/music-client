const { session } = require('electron')
export default {
    getCookies(cookie = {}, callback) {
        session.defaultSession.cookies.get(cookie, (error, cookies) => {
            callback(error, cookies)
        })
    },
    removeCookies(url, name, callback) {
        session.defaultSession.cookies.remove(url, name, callback)
    },
    setCookies(cookieName, cookieValue) {
        const cookie = { url: 'http://music.baidu.com', name: cookieName, value: cookieValue }
        session.defaultSession.cookies.set(cookie, (error) => {
            if (error) {
                console.log(error)
            }
        })
    }
}