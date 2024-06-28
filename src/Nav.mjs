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
            home: { nav: 'Home', href: 'home', tip: 'home page' },
            about: { popup: 'About', href: 'about', tip: 'about' }
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
        this.path = 'home'
        const p = this.pages[this.path]
        debug({ p })
        this.page = p.page ? p.page() : this.O(p.nav)
        this.render(this.page, 'page')
        history.pushState(null, null, this.path === 'home' ? '/' : `/${this.path}`);
    }
}
export default Nav
export { nav, debug, error }