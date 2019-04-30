import { session } from 'electron'
export default{
    webRequest() {
        const filter = {
            urls: ['http://music.baidu.com/*']
        }
        
        session.defaultSession.webRequest.onCompleted(filter, (details, callback) => {
            console.log('webRequest start');
            console.log(details)


            session.defaultSession.cookies.get({url: 'http://music.baidu.com/'}, (error, cookies) => {
                console.log('cookies:')
                console.log(error, cookies)
                let responseHeader = ""
                cookies.forEach(function(item,index){
                    responseHeader+=[item.name]+'=' + item.value+";"
                })
                console.log('responseHeader start')
                console.log(responseHeader)
                mainWindow.webContents.send('setRequestHeader', responseHeader)
            })
            // const cookie = { name: 'token', value: 'dummy'}
            // session.defaultSession.cookies.set(cookie, (error) => {
            //     if (error) console.error(error)
            // })
            
            //callback({ cancel: false, requestHeaders: details.requestHeaders })

        });
        
    }

} 