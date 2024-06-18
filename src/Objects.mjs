const debug = console.log.bind(console)
const error = console.error.bind(console)
import About from './About.mjs'

const cs = {
    About
}
class H {
    O = (n, ...args) => {
        let m = n.match(/^\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?\}$/)
        if (m) return this.O(m[1], ...args, m[2], m[3])
        else {
            const C = cs[n]
            if (!C) error({ O: { n, args } })
            return C ? new C(...args) : null
        }
    }
    OP = (n, ...args) => {
        m = n.match(/\{(.*)\}/)
    }
}

export default H