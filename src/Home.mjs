import html from './html/Home.html'
import Html, { debug } from './Html.mjs'

class Home extends Html {
    constructor() {
        super()
        this.id = 'home'
    }
    html = (name, param) => {
        return html
    }
}
export default Home
