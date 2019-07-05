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

//* 缩放
let arrResize = [{
    name: '.drr-stick-tl',
    direction: mk.leftTop,
    classNames: 'drr-stick drr-stick-tl'
}, {
    name: '.drr-stick-tr',
    direction: mk.rightTop,
    classNames: 'drr-stick drr-stick-tr'
}, {
    name: '.drr-stick-bl',
    direction: mk.leftBottom,
    classNames: 'drr-stick drr-stick-bl'
}, {
    name: '.drr-stick-br',
    direction: mk.rightBottom,
    classNames: 'drr-stick drr-stick-br'
}]
let c = navigator.userAgent


//初始center
function centerfun() {
    let c = document.getElementsByClassName('drag')[0].style.transform.match(/\d+(.\d+)?/g)
    let centerX = parseFloat(c[c.length - 2]) + $('.drag').outerWidth() / 2
    let centerY = parseFloat(c[c.length - 1]) + $('.drag').outerHeight() / 2
    let center = [centerX, centerY]
    return center
}

var initCenter = centerfun()
let initSize = [$('.drag').outerWidth(), $('.drag').outerHeight()]
let commonRotate = 0

let numberValue = observable({
    el: $('.drag'),
    size: initSize,
    center: initCenter,
    rotate: commonRotate,
})

//值改变时调用  渲染DOM
autorun(
    function operateDOMRender() {
        const {
            el: el,
            rotate: rx,
            size: [sx, sy],
            center: [cx, cy],
        } = numberValue;
        let cssName = {
            transform: `translate(-50%, -50%) translate(${cx}px,${cy}px) rotate(${rx}deg)`,
            width: `${sx}px`,
            height: `${sy}px`,
            transformOrigin: `center` //center
        }
        el.css(cssName)
    }
)


var EpubDRR = function (el, el2, option) {
    this.el = el
    this.el2 = el2,
        this.option = option
}

EpubDRR.prototype = {
    constructor: EpubDRR,
    epubDrag: function () {
        if (/Macintosh/.test(c)) {
            let that = this;
            this.el.mousedown(function (event) {
                let center = initCenter
                event.stopPropagation();
                let startPointT = [event.clientX, event.clientY]
                that.el.mousemove(function (ev) {
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
                    numberValue.center = result.center
                    initCenter = result.center
                })
            })
            this.el.mouseup(function (ev) {
                ev.stopPropagation();
                that.el.unbind("mousemove")
                that.el2.unbind("mousemove")
            })
        } else {
            let startPointT = []
            let touchCenter = []
            let that = this
            this.el[0].addEventListener('touchstart', function (event) {
                //开始点
                event.stopPropagation();
                touchCenter = initCenter
                startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

                if (event.target.className == that.option) {
                    that.el[0].addEventListener('touchmove', function (ev) {
                        ev.stopPropagation();
                        if (ev.target.className == that.option) {
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

                            numberValue.center = result.center
                            initCenter = result.center
                        }
                    })
                }
            })
        }
    },
    epubResize: function () {
        let that = this
        if (/Macintosh/.test(c)) {
            for (let i = 0; i < arrResize.length; i++) {

                $(arrResize[i].name).mousedown(function (event) {
                    event.stopPropagation();
                    let startPointT = [event.clientX, event.clientY]
                    let center = initCenter
                    const startPos = {
                        center: center,
                        rotate: commonRotate,
                        size: initSize
                    }
                    that.el.mousemove(function (eve) {
                        eve.stopPropagation();
                        let movePoint = [eve.clientX, eve.clientY]
                        const opt3 = {
                            startPos,
                            opts: {
                                startPoint: startPointT,
                                movePoint: movePoint,
                                mode: md.ratio,
                                marker: arrResize[i].direction
                            },
                        };
                        const result = resize(opt3) //====>center   size
                        Object.assign(numberValue, result)
                        initSize = result.size
                        initCenter = result.center
                    })
                })
            }
            for (let i = 0; i < arrResize.length; i++) {
                $(arrResize[i].name).mouseup(function (event) {
                    that.el.unbind("mousemove")
                })
                that.el.mouseup(function (event) {
                    event.stopPropagation();
                    that.el.unbind("mousemove")
                })
            }
        } else {
            let touchCenter = []
            let startPointT = []
            for (let i = 0; i < arrResize.length; i++) {
                $(arrResize[i].name)[0].addEventListener('touchstart', function (event) {
                    event.preventDefault()
                    event.stopPropagation();
                    touchCenter = initCenter
                    let startPosT = {
                        center: touchCenter,
                        rotate: commonRotate,
                        size: initSize
                    }
                    startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

                    if (event.target.className == arrResize[i].classNames) {
                        $(arrResize[i].name)[0].addEventListener('touchmove', function (ev) {
                            const opt3 = {
                                startPos: startPosT,
                                opts: {
                                    startPoint: startPointT,
                                    movePoint: [ev.changedTouches[0].clientX, ev.changedTouches[0].clientY],
                                    mode: md.ratio,
                                    marker: arrResize[i].direction
                                },
                            };

                            const result = resize(opt3) //====>center   size
                            numberValue.center = result.center
                            numberValue.size = result.size

                            initSize = result.size
                            initCenter = result.center
                        })
                    }
                })
            }
        }
    },
    epubRotate: function () {
        let that = this
        if (/Macintosh/.test(c)) {
            that.el.mousedown(function (event) {
                event.stopPropagation();
                let center = initCenter

                let startPos = {
                    center: center,
                    rotate: commonRotate
                }
                let startPointT = [event.clientX, event.clientY]
                that.el2.mousemove(function (ev) {
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
                    numberValue.rotate = result.rotate
                    commonRotate = result.rotate
                })
            })
            that.el.mouseup(function (event) {
                event.stopPropagation();
                that.el2.unbind("mousemove")
            })
        } else {
            that.el[0].addEventListener('touchstart', function (event) {
                event.stopPropagation();
                let startPointT = []
                let touchCenter = initCenter

                let startPosR = {
                    center: touchCenter,
                    rotate: commonRotate
                }
                startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

                if (event.target.className == that.option) {
                    that.el[0].addEventListener('touchmove', function (ev) {
                        const opt2 = {
                            startPos: startPosR,
                            opts: {
                                startPoint: startPointT,
                                movePoint: [ev.changedTouches[0].clientX, ev.changedTouches[0].clientY],
                            },
                        };
                        const result = rotate(opt2)
                        numberValue.rotate = result.rotate
                        commonRotate = result.rotate

                    })
                }
            })
        }

    }
}

const test = new EpubDRR($('.drag'), $('#root-wrapper'), 'dragPic image')
test.epubDrag()

const test1 = new EpubDRR($('#root-wrapper'))
test1.epubResize()

const test2 = new EpubDRR($('.drr-stick-ro'), $('#root-wrapper'), 'drr-stick drr-stick-ro')
test2.epubRotate()