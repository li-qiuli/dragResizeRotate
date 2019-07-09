import {
    observable,
    autorun,

} from "mobx";
const mobx = require('mobx')
const _ = require('lodash')
const {
    modeChoice: md,
    markerChoice: mk,
    move,
    resize,
    rotate
} = require('drag-resize-rotate');
import $ from 'jquery'

// * [${图形},${图形的父级元素},图行className,${旋转元素},旋转元素className]

var EpubDRR = function (DOM) {
    this.el = $(`.${DOM}`);
    this._preventMouse = false //值为true时touch时不触发mouse事件
    let that = this
    this._initCenter = centerfun(DOM)
    this._initSize = [this.el.outerWidth(), this.el.outerHeight()]
    this._commonRotate = 0

    this._numberValue = observable({
        el: this.el,
        size: this._initSize,
        center: this._initCenter,
        rotate: this._commonRotate,
    })

    //值改变时调用  渲染DOM
    autorun(
        function operateDOMRender() {
            const {
                el: el,
                rotate: rx,
                size: [sx, sy],
                center: [cx, cy],
            } = that._numberValue;

            let cssName = {
                transform: `translate(-50%, -50%) translate(${cx}px,${cy}px) rotate(${rx}deg)`,
                width: `${sx}px`,
                height: `${sy}px`,
                transformOrigin: `center` //center
            }
            el.css(cssName)
        }
    )
}

EpubDRR.prototype = {
    constructor: EpubDRR,
    epubDrag: function (value, op) {
        this.mouseDrag(value, op)
        this.touchDrag(value, op)
    },
    mouseDrag: function (value, op) {
        let DOM = value
        let that = this;
        DOM.mousedown((event) => {
            if(this._preventMouse) return;
            let center = JSON.parse(JSON.stringify(
                mobx.toJS(that._numberValue.center)
            ))
            let startPointT = [event.clientX, event.clientY]

            const move2 = (ev) => {
                that.computedDrag(startPointT, center, ev)
                return false
            }
            const end = () => {
                $(window).unbind('mousemove')
                $(window).unbind('mouseup')
            }

            $(window).mousemove(move2)
            DOM.mouseup(end)
            return false
        })
        return {
            destroy: () => {
                DOM.unbind('mousedown')
            },
        };
    },
    touchDrag: function (value, op) {
        let DOM = value
        let option = op
        let that = this
        DOM[0].addEventListener('touchstart', function (event) {
            this._preventMouse = true

            //开始点
            let touchCenter = JSON.parse(JSON.stringify(
                mobx.toJS(that._numberValue.center)
            ))
            let startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

            if (event.target.className == option) {
                const move2 = (ev) => {
                    if (ev.target.className == option) {
                        that.computedDrag(startPointT, touchCenter, ev.changedTouches[0])
                    }
                }
                const end = () => {
                    DOM[0].removeEventListener('touchmove', end)
                }

                DOM[0].addEventListener('touchmove', move2, false)
                DOM[0].addEventListener('touchend', end, false)
            }
        }, false)
        return {
            destroy: () => DOM.removeEventListener('touchstart'),
        }
    },
    epubResize: function (dom, obj) {
        let arr = _.merge(arrResize, obj)
        this.mouseResize(dom, arr)
        this.touchResize(dom, arr)

    },
    mouseResize: function (dom, arr) {
        let DOM = dom
        let that = this
        for (let i = 0; i < arr.length; i++) {
            $(arr[i].name).mousedown(function (event) {
                if (this._preventMouse) return;
                let startPointT = [event.clientX, event.clientY]
                let center = JSON.parse(JSON.stringify(
                    mobx.toJS(that._numberValue.center)
                ))

                const startPos = {
                    center: center,
                    rotate: that._commonRotate,
                    size: that._initSize //initSize
                }

                const move1 = (eve) => {
                    that.computeResize(startPos, startPointT, eve, arr[i].direction)
                    return false
                }
                const end = () => {
                    DOM.unbind('mousemove')
                }
                DOM.mousemove(move1)
                DOM.mouseup(end)
                return false
            })
        }
        return {
            destroy: () => {
                for (let i = 0; i < arr.length; i++) {
                    $(arr[i].name).unbind('mousedown')
                }
            }
        }
    },
    touchResize: function (dom, arr) {
        let DOM = dom
        let that = this
        for (let i = 0; i < arr.length; i++) {
            $(arr[i].name)[0].addEventListener('touchstart', function (event) {
                this._preventMouse = true

                let touchCenter = JSON.parse(JSON.stringify(
                    mobx.toJS(that._numberValue.center)
                ))
                let startPos = {
                    center: touchCenter,
                    rotate: that._commonRotate,
                    size: that._initSize //initSize
                }
                let startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]
                if (event.target.className == arr[i].classNames) {
                    const move1 = (ev) => {
                        that.computeResize(startPos, startPointT, ev.changedTouches[0], arr[i].direction)

                    }
                    const end = () => {
                        $(arr[i].name)[0].removeEventListener('touchmove', move1)
                    }
                    $(arr[i].name)[0].addEventListener('touchmove', move1)
                    $(arr[i].name)[0].addEventListener('touchend', end)
                }
            }, false)
        }
    },
    epubRotate: function (dom1, dom2, option) {
        this.mouseRotate(dom1, dom2, option)
        this.touchRotate(dom1, dom2, option)

    },
    mouseRotate: function (dom1, dom2, option) {
        let DOM1 = dom1;
        let DOM2 = dom2;
        let that = this
        DOM1.mousedown(function (event) {
            if (this._preventMouse) return;
            let center = JSON.parse(JSON.stringify(
                mobx.toJS(that._numberValue.center)
            ))

            let startPos = {
                center: center,
                rotate: that._commonRotate
            }
            let startPointT = [event.clientX, event.clientY]

            const move1 = (ev) => {
                that.computeRotate(startPos, startPointT, ev)
                return false
            }
            const end = () => {
                DOM2.unbind('mousemove')
            }
            DOM2.mousemove(move1)
            DOM2.mouseup(end)
            return false
        })
        return {
            destroy: () => {
                DOM1.unbind('mousedown')
            }
        }
    },
    touchRotate: function (dom1, dom2, option) {
        let DOM1 = dom1
        let DOM2 = dom2
        let options = option
        let that = this
        DOM1[0].addEventListener('touchstart', function (event) {
            this._preventMouse = true
            let startPointT = []

            let touchCenter = JSON.parse(JSON.stringify(
                mobx.toJS(that._numberValue.center)
            ))
            let startPosR = {
                center: touchCenter,
                rotate: that._commonRotate
            }
            startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

            if (event.target.className == options) {
                const move1 = (ev) => {
                    that.computeRotate(startPosR, startPointT, ev.changedTouches[0])
                }
                const end = () => {
                    DOM1[0].removeEventListener('touchmove', end)
                }

                DOM1[0].addEventListener('touchmove', move1)
                DOM1[0].addEventListener('touchend', end)
            }
        }, false)
    },

    computedDrag: function (startPointT, center, ev) {
        let opt1 = {
            startPos: {
                center: center
            },
            opts: {
                startPoint: startPointT,
                movePoint: [ev.clientX, ev.clientY],
            },
        }
        const result = move(opt1)
        this._numberValue.center = result.center
    },
    computeResize: function (startPos, startPointT, eve, value) {
        let movePoint = [eve.clientX, eve.clientY]
        const opt3 = {
            startPos,
            opts: {
                startPoint: startPointT,
                movePoint: movePoint,
                mode: md.ratio,
                marker: value
            },
        };
        const result = resize(opt3) //====>center   size

        Object.assign(this._numberValue, result)
        this._initSize = result.size //initSize
    },
    computeRotate: function (startPos, startPointT, ev) {
        let movePoint = [ev.clientX, ev.clientY]
        const opt2 = {
            startPos,
            opts: {
                startPoint: startPointT,
                movePoint,
            },
        };
        let result = rotate(opt2)
        this._numberValue.rotate = result.rotate
        this._commonRotate = result.rotate
    },
}

const centerfun = (dom) => {
    let d = document.getElementsByClassName(dom)[0].style.transform.match(/translate\(.*?(\))/g)[1]
    let translate = d.match(/\d+(.\d+)?/g)
    let centerX = parseFloat(translate[0])
    let centerY = parseFloat(translate[1])
    let center = [centerX, centerY]
    return center
}

let arrResize = [{
    direction: mk.leftTop,
}, {
    direction: mk.rightTop,
}, {
    direction: mk.leftBottom,
}, {
    direction: mk.rightBottom,
}]

module.exports = EpubDRR;



// import EpubDRR from './EpubDRR'
// import $ from 'jquery'

let arrResizes = [{
    name: '.drr-stick-tl',
    classNames: 'drr-stick drr-stick-tl'
}, {
    name: '.drr-stick-tr',
    classNames: 'drr-stick drr-stick-tr'
}, {
    name: '.drr-stick-bl',
    classNames: 'drr-stick drr-stick-bl'
}, {
    name: '.drr-stick-br',
    classNames: 'drr-stick drr-stick-br'
}]
// window.addEventListener('mousemove', () => {
//     console.warn(11111)
// });
// * [${图形},${图形的父级元素},图行className,${旋转元素},旋转元素className]
const test = new EpubDRR('drag')
test.epubDrag($('.drag'), 'dragPic image')
test.epubResize($('#root-wrapper'), arrResizes)
test.epubRotate($('.drr-stick-ro'), $('#root-wrapper'), 'drr-stick drr-stick-ro')