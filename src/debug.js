let debugs = {}
function debug(func, arg, arg2) {
    if (func === true) return debugs[arg] && debugs[arg].show
    else if (arg || (func === 'error' && arg === undefined)) return console.log.bind(console, func)
    if (debugs[func]) debugs[func].n++
    else {
        debugs[func] = { n: 1 }
        Object.keys(debugs).forEach(k => {
            if (k !== func && func.startsWith(k) && debugs[k].show) debugs[func].show = true
        })
    }
    if (debugs[func].show) {
        return console.log.bind(console, func)//console.log.bind(window.console)
    }
    else return function () { }
}
export { debug }