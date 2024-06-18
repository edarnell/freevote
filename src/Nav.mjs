import css from './css/combined.css'
import favicon from './icon/tick.svg'
import Html, { debug, error, dbg } from './Html.mjs'
import html from './html/Nav.html'
import manifest from '../public/manifest.json'
const version = manifest.version

var nav
class Nav extends Html {
    constructor() {
        super()
        this.pages = {
            about: { nav: 'About', href: 'about', tip: 'about' },
            why: { nav: 'Why', href: 'why', tip: 'why' },
            how: { nav: 'About', href: 'about', tip: 'about' },
            vote: { nav: 'Vote', href: 'vote', tip: 'vote' },
        }
        this.id = 'nav'
        this.init(css, favicon)
        import('./Objects.mjs').then(m => {
            const H = new m.default()
            this.O = H.O
            nav = this
            this.render(this, 'root')
        })
    }
    html = (n) => {
        return html
    }
    rendered = () => {
        this.path = 'about'
        const p = this.pages[this.path]
        debug({ p })
        this.page = p.page ? p.page() : this.O(p.nav)
        this.render(this.page, 'page')
        history.pushState(null, null, this.path === 'home' ? '/' : `/${this.path}`);
    }
}
export default Nav
export { nav, debug, error }