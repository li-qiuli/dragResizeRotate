
import { decorate, observable } from "mobx";
// dom 实例 缓存
// transform
// render function 手动的

// observerable data =>  event
// alloyfinger 

// new Allouy({
//     el:''
//     onSTart,
// })
import $ from 'jquery'
const {
    modeChoice: md,
    markerChoice: mk,
    move,
    resize,
    rotate
} = require('drag-resize-rotate');

//* 缩放
let arrResize = [{
    name: '.drr-stick-tl',
    direction: mk.leftTop,
    classNames:'drr-stick drr-stick-tl'
}, {
    name: '.drr-stick-tr',
    direction: mk.rightTop,
    classNames:'drr-stick drr-stick-tr'
}, {
    name: '.drr-stick-bl',
    direction: mk.leftBottom,
    classNames:'drr-stick drr-stick-bl'
}, {
    name: '.drr-stick-br',
    direction: mk.rightBottom,
    classNames:'drr-stick drr-stick-br'
}]

/**
 * *record rotate
 */
let commonRotate = 0


//TODO  new DRR(O1,rotate)                 //* 旋转  ！！！！div
//TODO  new DRR(R1,R2,R3,R4,Resize)        //* 缩放  ！！！！div
//TODO  new DRR(div,drag)                  //* 拖拽
//TODO   var DRR = function (el, option) {} 
 
/**
 * *get center
 */
const conmmonCenter = () => {
    let x = $('.drag').offset().left + $('.drag').outerWidth() / 2;
    let y = $('.drag').offset().top + $('.drag').outerHeight() / 2
    let touchCenter = [x, y]
    return touchCenter
}




//*拖拽（移动）
const epubDrag = (dom,classNames) => {
    let startPointT = []
    let touchCenter = []
    dom[0].addEventListener('touchstart', function (event) {
    // $('.drag')[0].addEventListener('touchstart', function (event) {
        //开始点
        event.stopPropagation();
        touchCenter = conmmonCenter()
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
                    operateDOMRender(dom, result)
                }
            })
        }
    })
    // $('.drag')[0].addEventListener('touchend', function (event) {
    //     $('.drag')[0].addEventListener('touchstart', function () {})
    //     $('.drag')[0].addEventListener('touchmove', function () {})
    // })
}

//*缩放（移动）
const epubResize = (arrResize,dom2) => {
    let touchCenter = []
    let startPointT = []
    for (let i = 0; i < arrResize.length; i++) {
        $(arrResize[i].name)[0].addEventListener('touchstart', function (event) {
            event.preventDefault()
            event.stopPropagation();
            touchCenter = conmmonCenter()
            let startPosT = {
                center: touchCenter,
                rotate: commonRotate,
                size: [dom2.outerWidth(), dom2.outerHeight()]
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
                    const result = resize(opt3)
                    operateDOMRender(dom2, result)
                })
            }
        })
    }
}

//*旋转(移动)
const epubRotate = (dom1,dom2,classNames) => {
    dom1[0].addEventListener('touchstart', function (event) {
        event.stopPropagation();
        let startPointT = []
        let touchCenter = conmmonCenter()

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
                result['center'] = touchCenter
                commonRotate = result.rotate
                operateDOMRender(dom2, result)
            })
        }
    })
}


// TODO drag-calc src

//*拖拽
const pcDrag = (dom1,dom2) => {
    dom1.mousedown(function (event) {
        let center = operateCenter(dom1)

        event.stopPropagation();
        let startPointT = [event.clientX,event.clientY]

        dom2.mousemove(function (ev) {
        // dom2.mousemove(function (ev) {
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
            operateDOMRender(dom1, move(opt1))
        })
    })
    dom1.mouseup(function (ev) {
        ev.stopPropagation();
        dom1.unbind("mousemove")
        dom2.unbind("mousemove")
    })
}

//*缩放
const pcResize = (arrResize,dom2,dom3) => {
    for (let i = 0; i < arrResize.length; i++) {
        $(arrResize[i].name).mousedown(function (event) {
            event.stopPropagation();

            let startPointT = [event.clientX, event.clientY]
            let center = operateCenter(dom2)

            const startPos = {
                center: center,
                rotate: commonRotate,
                size: [dom2.outerWidth(), dom2.outerHeight()]
            }

            dom3.mousemove(function (event) {
                event.stopPropagation();
                let movePoint = [event.clientX, event.clientY]
                const opt3 = {
                    startPos,
                    opts: {
                        startPoint: startPointT,
                        movePoint: movePoint,
                        mode: md.ratio,
                        marker: arrResize[i].direction
                    },
                };
                operateDOMRender(dom2, resize(opt3))
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

//*旋转
const pcRotate = (dom1,dom2,dom3) => {
    // //*旋转
    dom1.mousedown(function (event) {
        event.stopPropagation();
        let center = operateCenter(dom3)

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
                    startPoint:startPointT,
                    movePoint,
                },
            };
            let result = rotate(opt2)
            result['center'] = center
            operateDOMRender(dom3, result)
            commonRotate = rotate(opt2).rotate
        })
    })
    dom1.mouseup(function (event) {
        event.stopPropagation();
        dom2.unbind("mousemove")
    })

}

const operateCenter = (dom) => {
    let x = dom.offset().left + dom.outerWidth() / 2
    let y = dom.offset().top + dom.outerHeight() / 2
    let center = [x, y]
    return center
}

const operateDOMRender = (DOM, value) => {
    let param = {
        size: [DOM.outerWidth(), DOM.outerHeight()],
        center: [DOM.offset().left + DOM.outerWidth() / 2, DOM.offset().top + DOM.outerHeight() / 2],
        rotate: commonRotate
    };
    let result = Object.assign(param, value);
    const {
        size: [sx, sy],
        center: [cx, cy],
        rotate: rx,
    } = result;

    let cssName = {
        transform: `rotate(${rx}deg) translate(${cx-DOM.outerWidth()/2}px,${cy-DOM.outerHeight()/2}px)`,
        width: `${sx}px`,
        height: `${sy}px`,
        transformOrigin: `${cx}px ${cy}px`
    }
    DOM.css(cssName)
}

let c=navigator.userAgent
if (/Macintosh/.test(c)) {
    pcDrag($('.drag'), $('#root-wrapper'))
    pcResize(arrResize,$('.drag'),$('#root-wrapper'))
    pcRotate($('.drr-stick-ro'),$('#root-wrapper'),$('.drag'))
} else {
    //拖拽
    epubDrag($('.drag'),'dragPic image')
    // 缩放
    epubResize(arrResize,$('.drag'),$('#root-wrapper'))
    //旋转
    epubRotate($('.drr-stick-ro'),$('.drag'),'drr-stick drr-stick-ro')
}
