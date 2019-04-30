const hasOwnProperty = Object.prototype.hasOwnProperty;
const {shell} = require('electron')
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
};

function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
};

export function toObject(arr) {
  var res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
};

// 第三方告知打开新窗口--因为直接调用window.open无法修改窗口大小
window.openFromThirdParty  = function(url){
  console.log('url= '+url);
  shell.openExternal(url)
}
