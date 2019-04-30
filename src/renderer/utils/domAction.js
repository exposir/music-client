import Vue from 'vue';
const isServer = Vue.prototype.$isServer;
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
export default {
    addClass(el, cls) {
        if (!el) return;
        var curClass = el.className;
        var classes = (cls || '').split(' ');

        for (var i = 0, j = classes.length; i < j; i++) {
            var clsName = classes[i];
            if (!clsName) continue;

            if (el.classList) {
                el.classList.add(clsName);
            } else {
                if (!hasClass(el, clsName)) {
                    curClass += ' ' + clsName;
                }
            }
        }
        if (!el.classList) {
            el.className = curClass;
        }
    },
    removeClass(el, cls) {
        if (!el || !cls) return;
        var classes = cls.split(' ');
        var curClass = ' ' + el.className + ' ';

        for (var i = 0, j = classes.length; i < j; i++) {
            var clsName = classes[i];
            if (!clsName) continue;

            if (el.classList) {
                el.classList.remove(clsName);
            } else {
                if (hasClass(el, clsName)) {
                    curClass = curClass.replace(' ' + clsName + ' ', ' ');
                }
            }
        }
        if (!el.classList) {
            el.className = trim(curClass);
        }
    },
    hasClass(el, cls) {
        if (!el || !cls) return false;
        if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
        if (el.classList) {
            return el.classList.contains(cls);
        } else {
            return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
        }
    },
    siblingsDom(elem) {
        let result = []
        let n = elem.parentNode.firstChild
        for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
                result.push(n)
            }
        }
        return result
    },
    camelCase(name) {
        return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).replace(MOZ_HACK_REGEXP, 'Moz$1');
    },
    getStyle(element, styleName) {
        if (isServer) return;
        if (!element || !styleName) return null;
        styleName = this.camelCase(styleName);
        if (styleName === 'float') {
            styleName = 'cssFloat';
        }
        try {
            var computed = document.defaultView.getComputedStyle(element, '');
            return element.style[styleName] || computed ? computed[styleName] : null;
        } catch (e) {
            return element.style[styleName];
        }
    },
    setStyle(element, styleName, value) {
        if (!element || !styleName) return;
        if (typeof styleName === 'object') {
            for (var prop in styleName) {
                if (styleName.hasOwnProperty(prop)) {
                    setStyle(element, prop, styleName[prop]);
                }
            }
        } else {
            styleName = this.camelCase(styleName);
            if (styleName === 'opacity' && ieVersion < 9) {
                element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
            } else {
                element.style[styleName] = value;
            }
        }
    }
}