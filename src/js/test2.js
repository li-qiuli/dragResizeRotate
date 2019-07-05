//******（已封装 已用mobx） */
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




//初始center
function centerfun() {
    let c = document.getElementsByClassName('drag')[0].style.transform.match(/\d+(.\d+)?/g)
    let centerX = parseFloat(c[c.length - 2]) + $('.drag').outerWidth() / 2
    let centerY = parseFloat(c[c.length - 1]) + $('.drag').outerHeight() / 2
    let center = [centerX, centerY]
    return center
}

//初始center
function centerfun1() {
    let c = document.getElementsByClassName('drag')[0].style.transform.match(/\d+(.\d+)?/g)
    let centerX = parseFloat(c[c.length - 2])
    let centerY = parseFloat(c[c.length - 1])
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

//*拖拽  ======== 改变{center:[110, 240]}
const pcDrag = (dom1, dom2) => {
    dom1.mousedown(function (event) {
        let center = initCenter
        let initsize = [$('.drag').outerWidth(), $('.drag').outerHeight()]
        event.stopPropagation();
        let startPointT = [event.clientX, event.clientY]
        dom2.mousemove(function (ev) {

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
            // numberValue.translate = [result.center[0] - initsize[0] / 2, result.center[1] - initsize[1] / 2]
            initCenter = result.center

        })
    })
    dom1.mouseup(function (ev) {
        ev.stopPropagation();
        dom1.unbind("mousemove")
        dom2.unbind("mousemove")
    })
}

//*缩放 ===========改变 { size: [ 58.57864376269052, 29.28932188134526 ], center: [ 25, 25 ] }
const pcResize = (arrResize, dom2, dom3) => {

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
            dom3.mousemove(function (eve) {
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
                console.log(3333333, result)
                Object.assign(numberValue,result)
                initSize = result.size
                initCenter = result.center
            })
        })
    }
    for (let i = 0; i < arrResize.length; i++) {
        $(arrResize[i].name).mouseup(function (event) {
            dom3.unbind("mousemove")
        })
        dom3.mouseup(function (event) {
            event.stopPropagation();
            dom3.unbind("mousemove")
        })
    }
}

//*旋转 ========== 改变 { rotate: -60 }
const pcRotate = (dom1, dom2, dom3) => {
    dom1.mousedown(function (event) {
        event.stopPropagation();
        let center = initCenter

        let startPos = {
            center: center,
            rotate: commonRotate
        }
        let startPointT = [event.clientX, event.clientY]
        dom2.mousemove(function (ev) {
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
    dom1.mouseup(function (event) {
        event.stopPropagation();
        dom2.unbind("mousemove")
    })
}




//*拖拽（移动）======== 改变{center:[110, 240]}
const epubDrag = (dom, classNames) => {
    let startPointT = []
    let touchCenter = []
    let initsize = [$('.drag').outerWidth(), $('.drag').outerHeight()]
    dom[0].addEventListener('touchstart', function (event) {
        //开始点

        event.stopPropagation();
        touchCenter = initCenter
        startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

        if (event.target.className == classNames) {
            dom[0].addEventListener('touchmove', function (ev) {
                ev.stopPropagation();
                if (ev.target.className == classNames) {
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

//*缩放（移动）===========改变 { size: [ 58.57864376269052, 29.28932188134526 ], center: [ 25, 25 ] }
const epubResize = (arrResize, dom2) => {
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

//*旋转(移动) ========== 改变 { rotate: -60 }
const epubRotate = (dom1, dom2, classNames) => {
    dom1[0].addEventListener('touchstart', function (event) {
        event.stopPropagation();
        let startPointT = []
        let touchCenter = initCenter

        let startPosR = {
            center: touchCenter,
            rotate: commonRotate
        }
        startPointT = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]

        if (event.target.className == classNames) {
            dom1[0].addEventListener('touchmove', function (ev) {
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


let c = navigator.userAgent
if (/Macintosh/.test(c)) {
    pcDrag($('.drag'), $('#root-wrapper'))
    pcResize(arrResize, $('.drag'), $('#root-wrapper'))
    pcRotate($('.drr-stick-ro'), $('#root-wrapper'), $('.drag'))
} else {
    //拖拽
    epubDrag($('.drag'), 'dragPic image')
    // 缩放
    epubResize(arrResize, $('.drag'), $('#root-wrapper'))
    //旋转
    epubRotate($('.drr-stick-ro'), $('.drag'), 'drr-stick drr-stick-ro')
}