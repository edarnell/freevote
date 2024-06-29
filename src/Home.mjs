import html from './html/Home.html'
import Html, { debug, error } from './Html.mjs'
import vote from './icon/vote.svg'

class Home extends Html {
    constructor() {
        super()
        this.id = 'home'
    }
    html = (name, param) => {
        return html
    }
    image = (n, p) => {
        if (n === 'vote') return ({ class: '', src: vote })
    }
    rendered = () => {
        //debug('Home loaded')
        //this.dl('vote')
    }
    dl = (n) => {
        const svg = this.q(`[id="Img_${n}"]`)
        if (!svg) return debug('No such element: ' + n)
        svg.addEventListener('click', () => {
            const c = document.createElement('canvas')
            c.width = svg.clientWidth
            c.height = svg.clientHeight
            const ctx = c.getContext('2d')
            ctx.drawImage(svg, 0, 0, c.width, c.height)
            const png = c.toDataURL('image/png')
            // Create an <a> element for triggering the download
            const dl = document.createElement('a')
            dl.href = png
            dl.download = n + '.png' // Set the download file name
            document.body.appendChild(dl)
            dl.click()
            document.body.removeChild(dl)
        })
    }
}
export default Home
