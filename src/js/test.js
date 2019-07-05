import {
    observable,
    autorun
} from "mobx";
const {
    modeChoice: md,
    markerChoice: mk,
    move,
    resize,
    rotate
} = require('drag-resize-rotate');
import $ from 'jquery'

let c = navigator.userAgent

// * [${图形},${图形的父级元素},图行className,${旋转元素},旋转元素className]

var EpubDRR = function (DOM) {
    this.c = `.${DOM}`
    this.el = $(this.c);

    this.imgDOM = DOM
    let that = this
    this._initCenter = this.centerfun()
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
        let DOM = value
        let option = op
        let that = this;

        if (/Macintosh/.test(c)) {
            DOM.mousedown(function (event) {
                let center = that.centerfun()
                event.stopPropagation();
                let startPointT = [event.clientX, event.clientY]
                DOM.mousemove(function (ev) {

                    ev.stopPropagation();
                    ev.preventDefault()
                    const opt1 = {
                        startPos: {
                            center: center
                        },
                        opts: {
                            startPoint: startPointT,
                            movePoint: [ev.clientX, ev.clientY],
                        },
                    };
                    const result = move(opt1)
                    that._numberValue.center = result.center
                })
            })
            DOM.mouseup(function (ev) {
                ev.stopPropagation();
                DOM.unbind("mousemove")
            })
            DOM.mouseleave(function (ev) {
                ev.stopPropagation();
                DOM.unbind("mousemove")
            })
        } else {
            let startPointT = []
            let touchCenter = []
            let that = this
            DOM[0].addEventListener('touchstart', function (event) {
                //开始点
                event.stopPropagation();
                touchCenter = that.centerfun()
                startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

                if (event.target.className == option) {
                    DOM[0].addEventListener('touchmove', function (ev) {
                        ev.stopPropagation();
                        if (ev.target.className == option) {
                            const opt1 = {
                                startPos: {
                                    center: touchCenter
                                },
                                opts: {
                                    startPoint: startPointT,
                                    movePoint: [ev.changedTouches[0].clientX, ev.changedTouches[0].clientY],
                                },
                            };
                            const result = move(opt1)
                            that._numberValue.center = result.center
                        }
                    })
                }
            })
        }
    },
    epubResize: function (dom, obj) {
        let DOM = dom
        let that = this

        let arr = []
        arr = this.mergeArrObj(obj)
        if (/Macintosh/.test(c)) {
            for (let i = 0; i < arr.length; i++) {
                $(arr[i].name).mousedown(function (event) {
                    event.stopPropagation();
                    let startPointT = [event.clientX, event.clientY]
                    let center = that.centerfun()
                    const startPos = {
                        center: center,
                        rotate: that._commonRotate,
                        size: that._initSize //initSize
                    }
                    DOM.mousemove(function (eve) {
                        eve.stopPropagation();
                        let movePoint = [eve.clientX, eve.clientY]
                        const opt3 = {
                            startPos,
                            opts: {
                                startPoint: startPointT,
                                movePoint: movePoint,
                                mode: md.ratio,
                                marker: arr[i].direction
                            },
                        };
                        const result = resize(opt3) //====>center   size
                        Object.assign(that._numberValue, result)
                        that._initSize = result.size //initSize
                    })
                })
            }
            for (let i = 0; i < arr.length; i++) {
                $(arr[i].name).mouseup(function (event) {
                    DOM.unbind("mousemove")
                })
                DOM.mouseup(function (event) {
                    event.stopPropagation();
                    DOM.unbind("mousemove")
                })
                DOM.mouseleave(function (event) {
                    event.stopPropagation();
                    DOM.unbind("mousemove")
                })
            }
        } else {
            let touchCenter = []
            let startPointT = []
            for (let i = 0; i < arr.length; i++) {
                $(arr[i].name)[0].addEventListener('touchstart', function (event) {
                    event.preventDefault()
                    event.stopPropagation();
                    touchCenter = that.centerfun()
                    let startPosT = {
                        center: touchCenter,
                        rotate: that._commonRotate,
                        size: that._initSize //initSize
                    }
                    startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]
                    if (event.target.className == arr[i].classNames) {
                        $(arr[i].name)[0].addEventListener('touchmove', function (ev) {
                            const opt3 = {
                                startPos: startPosT,
                                opts: {
                                    startPoint: startPointT,
                                    movePoint: [ev.changedTouches[0].clientX, ev.changedTouches[0].clientY],
                                    mode: md.ratio,
                                    marker: arr[i].direction
                                },
                            };

                            const result = resize(opt3) //====>center   size
                            that._numberValue.center = result.center
                            that._numberValue.size = result.size
                            that._initSize = result.size
                        })
                    }
                })
            }
        }
    },
    epubRotate: function (dom1, dom2, option) {
        let DOM1 = dom1
        let DOM2 = dom2
        let options = option

        let that = this
        if (/Macintosh/.test(c)) {
            DOM1.mousedown(function (event) {
                event.stopPropagation();
                let center = that.centerfun()

                let startPos = {
                    center: center,
                    rotate: that._commonRotate
                }
                let startPointT = [event.clientX, event.clientY]
                DOM2.mousemove(function (ev) {
                    let movePoint = [ev.clientX, ev.clientY]
                    ev.stopPropagation();
                    const opt2 = {
                        startPos,
                        opts: {
                            startPoint: startPointT,
                            movePoint,
                        },
                    };
                    let result = rotate(opt2)
                    that._numberValue.rotate = result.rotate
                    that._commonRotate = result.rotate
                })
            })
            DOM1.mouseup(function (event) {
                event.stopPropagation();
                DOM2.unbind("mousemove")
            })
            that.el.mouseup(function (ev) {
                ev.stopPropagation();
                DOM2.unbind("mousemove")
            })
        } else {
            DOM1[0].addEventListener('touchstart', function (event) {
                event.stopPropagation();
                let startPointT = []
                let touchCenter = that.centerfun()

                let startPosR = {
                    center: touchCenter,
                    rotate: that._commonRotate
                }
                startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

                if (event.target.className == options) {
                    DOM1[0].addEventListener('touchmove', function (ev) {
                        const opt2 = {
                            startPos: startPosR,
                            opts: {
                                startPoint: startPointT,
                                movePoint: [ev.changedTouches[0].clientX, ev.changedTouches[0].clientY],
                            },
                        };
                        const result = rotate(opt2)
                        that._numberValue.rotate = result.rotate
                        that._commonRotate = result.rotate

                    })
                }
            })
        }

    },
    centerfun: function () {
        let d = document.getElementsByClassName(this.imgDOM)[0].style.transform.match(/translate\(.*?(\))/g)[1]
        let c = d.match(/\d+(.\d+)?/g)
        let centerX = parseFloat(c[0])
        let centerY = parseFloat(c[1])
        let center = [centerX, centerY]
        return center
    },
    //合并数组对象
    mergeArrObj: function (value2) {
        let arrResize = [{
            direction: mk.leftTop,
        }, {
            direction: mk.rightTop,
        }, {
            direction: mk.leftBottom,
        }, {
            direction: mk.rightBottom,
        }]
        let arr = []
        for (let i = 0; i < arrResize.length; i++) {
            for (let j = 0; j < value2.length; j++) {
                if (i == j) {
                    arr.push(Object.assign(arrResize[i], value2[j]))
                }
            }
        }
        return arr
    }
}
module.exports = EpubDRR;


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
// * [${图形},${图形的父级元素},图行className,${旋转元素},旋转元素className]
const test = new EpubDRR('drag')
test.epubDrag($('.drag'), 'dragPic image')
test.epubResize($('#root-wrapper'), arrResizes)
test.epubRotate($('.drr-stick-ro'), $('#root-wrapper'), 'drr-stick drr-stick-ro')