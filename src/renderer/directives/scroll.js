let scrollCallback = function(callback, el) {
    if (el.scrollHeight - el.clientHeight - el.scrollTop <= 300) {
        callback()
    }
}

let callbackWarpped

export default {
    bind: function(el, binding, vnode) {
        callbackWarpped = scrollCallback.bind({}, binding.value, el)
        if (el) {
            el.addEventListener("scroll", callbackWarpped)
        }
    },
    unbind: function() {
        //  if (el) { el.removeEventListener("scroll", callbackWarpped) }
    }
}