export const TING_API = "http://musicapi.taihe.com/v1/restserver/ting?";
export const QIANQIAN_API = "http://api.qianqian.com/";
// export const TING_API = "http://192.168.2.229:8888/v1/restserver/ting?";
// export const TING_API = "http://192.168.3.242:8888/v1/restserver/ting?";
// const requestHeader = localStorage.getItem('requestHeader');
export const requestData = {
    method: 'GET',
    mode: 'cors',
    credentials: "include",
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
        // "Set-Cookie":requestHeader
    }
};

export const requestDataNoCache = {
    method: 'GET',
    mode: 'cors',
    credentials: "include",
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-cache"
    }
};

export const qianqianRequestData = {
    method: 'GET',
    mode: 'cors',
    credentials: "include",
    headers: {
        'Content-Type': "application/json;charset=UTF-8",
        'Accept': 'application/json'
    }
};

export const CLICK_REPORT = "http://click.qianqian.com/v.gif?pid=337&"
export const DEBUG = true