import html from './html/About.html'
import Html, { debug } from './Html.mjs'

class About extends Html {
    constructor() {
        super()
        this.id = 'about'
    }
    html = (name, param) => {
        return html
    }
}
export default About
