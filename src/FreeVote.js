import React, { Component } from 'react'
import { Navbar, Nav, Modal } from 'react-bootstrap'
import Register from './Register'
import Contact from './Contact'
import Unsubscribe from './Unsubscribe'
import { ajax } from './ajax'
import { debug } from './debug'
//import logo from './tick.svg'
class FreeVote extends Component {
  state = { nav: 'home', message: null, version: 1 }
  componentDidMount() {
    const url = window.location.search
    debug('FreeVote', true)({ state: this.state, url })
    if (url && url.startsWith('?mail=')) {
      // R=register
      const type = url.substr(6, 1), token = url.substr(7)
      if (type === 'C' || type === 'V' || type === 'M') this.setState({ modal: 'contact', token: token, type: type })
      else if (type === 'X') this.setState({ modal: 'unsubscribe', token: token })
      else if (type === 'R') ajax({ req: 'confirm', token: token }).then(r => {
        if (r.error) this.setState({ message: { type: 'danger', text: 'Error: ' + r.error } })
        else this.setState({ message: { type: 'success', text: 'Registration confirmed.' } })
      })
      else if (type === 'U') ajax({ req: 'update', token: token }).then(r => {
        if (r.error) this.setState({ message: { type: 'danger', text: 'Error: ' + r.error } })
        else this.setState({ message: { type: 'success', text: 'Details updated.' } })
      })
    }
    if (url) window.history.pushState("object or string", "Title", "/")
  }
  componentDidUpdate() {
    if (this.message && !this.scrolled) {
      this.message.scrollIntoView()
      this.scrolled = true
    }
  }
  close = (m, token) => {
    // message may be e - so treat e as null
    debug('close')({ m, token })
    if (m && m.text) this.setState({ modal: null, message: m, token: token })
    else this.setState({ modal: null, message: null, token: null })
    this.n()
    this.scrolled = false // for message
  }
  render() {
    const m = this.state.modal,
      modal = {
        about: <About close={this.close} />,
        unsubscribe: <Unsubscribe token={this.state.token} close={this.close} />,
        join: <Register close={this.close} />,
        contact: <Contact close={this.close} token={this.state.token} type={this.state.type} />
      },
      message = this.state.message, token = this.state.token

    return <div><FVNav nav={m => this.setState({ modal: m })} />
      <div className="navbarSpacer"></div>
      <div id="page" className='container'>
        <Message message={message} close={message && message.close ? message.close : () => this.setState({ message: null })} />
        <Home n={this.state.n} nav={m => this.setState({ modal: m })} />
        <Message message={message} close={message && message.close ? message.close : () => this.setState({ message: null })} />
        {m && modal[m] ? modal[m] : null}
        {token ? <div id='token' hidden>{token}</div> : null}
      </div>
    </div>
  }
}

class Message extends Component {
  render() {
    const message = this.props.message
    return message ? <div name="alert" className={"alert alert-dismissible alert-" + message.type}>
      <button type="button" className="close" onClick={this.props.close} data-dismiss="alert">&times;</button>
      <strong>{message.text}</strong></div> : <br />
  }
}

class Home extends Component {
  state = { v: 2 }
  render() {
    return <div>
      <h5>Economics</h5>
      <p>It is quite obvious to most people that we are making a mess of the planet.
        We are directly causing the mass extinction of much of the variety of life which makes Earth the wonderful place it is.
        The cause of this is quite simple; it is greed. Greed is an evolutionary trait which has an important role in less developed species.
        Our growth-based economic system is designed to exploit greed.
        In an era where consumption and population have grown out of control growth is the very last thing we should be driving.
        Economics must change.
      </p>
      <h5>Consumption</h5>
      <p>As a species we already consume at least double what the Earth can afford.
        The problem is a triple one of consumption, population and equality.
        We must reduce our environmental impact, while we get our population back under control.
        We must learn to have smaller families and each consume far less until we reach a sustainable level.
        Our current population means that in an equitable world every action must be multiplied by 7.8 billion to understand the potential impact.
      </p>
      <h5>Rationing</h5>
      <p>Most of us are not willing to ration our lives while we see others taking far more.
        We are however happy to ration and share provided it is fair.
        We should be free to use and share rations as we prefer, but rationing must be fair.
        It cannot be one rule for some and a different rule for others.
        Environmental scientists can advise on the limits and priorities.
        We must then democratically agree, monitor and refine rations which apply to everyone.
      </p>
      <h5>Will rationing be bad?</h5>
      <p>Not necessarily.
        We enjoy consuming, travelling and hoarding.
        We associate excess wealth with success not failure.
        We are however trapped in wage slavery. Our growth-based economics is highly destructive, unequal and inefficient.
        Removing greed from our lives will change them, but it will not necessarily make them worse.
        Freeing ourselves will potentially enable us to focus on things of real value (family, friends, health, sport, education, science and the arts) and deliver far more time to enjoy life’s simple pleasures.
        The UK was at its healthiest during war-time rationing, an era which also saw the establishment of universal education, welfare and healthcare.
        Do we really need to celebrate success with greed, feeling our lives are deficient unless we have more than others?
      </p>
      <h5>So how do we change?</h5>
      <p>Effort must be focussed on efficiency, sustainability and sharing. The current growth-based economics must be replaced with ration-based economics.
      </p><p>
        Covid has shown how quickly we can act when we need to.
        The current system only continues because we repeatedly vote for it. The system will only change when we vote to change it.
        To enable this we should also consider upgrading from representative democracy to genuine democracy.
        Our 13th century political system is of historic interest but it is no longer fit for purpose in the 21st century.
        If everyone is expected to play their part it is essential that everyone has a democratic say.
      </p>
      <h5>Are we ready?</h5>
      <p>Time will tell. If you would like to see this change then simply <span className='btn-link' onClick={() => this.props.nav('join')}>add</span> yourself to the email list.
      </p>
    </div>
  }
}
//The list currently has < b > { this.props.n || 0 }</b > people on it.A long way to go before this is a democratic majority.Every vote is however one step closer to a fair and sustainable future.
//          <a href="#" className="navbar-left"><img src={logo} height="50" alt="AgileLogo"/></a>

class FVNav extends Component {
  state = { in: false }
  n = () => {
    ajax({ req: 'count' }).then(r => {
      if (r.n !== this.state.n) debug('registered', true)({ n: r.n })
    })
  }
  render() {
    return (<Navbar id='nav' bg="dark" variant="dark" expand="lg" fixed="top">
      <div className='container'>
        <Navbar.Brand href="#home" ><img src="/tick.svg" onMouseEnter={this.n} width="32" height="32" style={{ verticalAlign: 'bottom' }} alt="FreeVote.uk" /> FreeVote.uk</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto"></Nav>
          <Nav className="justify-content-end">
            <Nav.Link id="join" href="#join" onClick={(e) => { e.preventDefault(); this.props.nav('join') }}>Join</Nav.Link>
            <Nav.Link id="about" href="#about" onClick={(e) => { e.preventDefault(); this.props.nav('about') }}>About</Nav.Link>
            <Nav.Link id="contact" href="#contact" onClick={(e) => { e.preventDefault(); this.props.nav('contact') }}>Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>)
  }
  // <Nav className="justify-content-end">
}

class About extends Component {
  render() {
    return (
      <Modal name="about" animation={false} show={true} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>About</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>The world is a wonderful place which we must learn to share and look after. Rationing is the only way to deliver a fair, sustainable, secure and enjoyable life for all.</p>
          <p>FreeVote.uk was created by <a href="https://www.linkedin.com/in/eddarnell/">Ed Darnell</a>. It has no commercial or political affiliation. If you would like to help, please join.</p>
        </Modal.Body>
      </Modal>)
  }
}


export default FreeVote