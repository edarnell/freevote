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
      <h5>Welcome to FreeVote.uk</h5>
      <p>Make Your Voice Heard</p>
      <p>In today's political landscape, many citizens feel disillusioned with the available choices.
        Traditional voting often feels like a compromise, where none of the candidates truly represent your values or opinions.
        If you’re looking for a way to express your dissatisfaction while still participating in the democratic process, FreeVote.uk is here to help.
      </p>
      <p>A FreeVote is a conscious decision to spoil your ballot as a form of protest against the current political system.
        By drawing a FreeVote.uk box on your ballot paper and marking it, you actively show your dissatisfaction with the system and parties presented.
        This action will be recorded as a spoilt ballot, ensuring your protest is noted in the official election statistics.</p>
      <ul>
        <li><strong>Express Dissatisfaction:</strong>
          A spoilt ballot is a clear message that none of the available options meet your standards or address your concerns.</li>
        <li><strong>Ensure Your Participation is Counted:</strong>
          Unlike abstaining from voting, a spoilt ballot is counted in the total number of votes cast, showing that you care about the democratic process but reject the given choices.</li>
        <li><strong>Promote Change:</strong>
          By increasing the number of spoilt ballots, we can draw attention to the need for political reform.</li>
      </ul>
      <p>Spoiling ballot papers as a form of protest is not a new phenomenon.
        Throughout history, voters have used this method to express dissatisfaction with the political options available to them.
        The practice has been documented in various democracies around the world, often as a response to perceived corruption, lack of choice, or political disillusionment.</p>
      <p>Renowned physicist Richard Feynman famously rejected politics,
        stating that he did not want to be involved in a system where he would have to compromise his integrity.
        Feynman's stance resonates with the ethos of spoiling ballots as a form of protest.
        He believed in questioning the status quo and standing by one's principles, even if it meant rejecting the conventional paths offered.
        This powerful message aligns with the spirit of FreeVote.uk, advocating for a system where the people, not the elites,
        dictate the terms of governance.</p>
      <h5>The Vision for True Democracy</h5>
      <p><strong>Beyond Historic Political Power Games</strong></p>
      <p>Traditional representative democracy, where elected officials make decisions on behalf of their constituents,
        is a relic of a time when direct communication and widespread participation were impractical.
        Today, with the advent of mobile phones and modern technology,
        we have the tools to transform our political system into a true democracy that accurately reflects the will of the people.</p>
      <ul>
        <li><strong>Direct Participation:</strong>
          In a true democracy, every citizen has the opportunity to directly declare their priorities and vote on issues that matter to them.
          Using secure, accessible technology, everyone can participate in the decision-making process without the need for intermediaries.</li>
        <li><strong>A Fun and Engaging Lower and Upper House:</strong>
          The historic institutions of the lower and upper house can be preserved as engaging, public forums.
          The lower house can be a place where the public gathers to debate and discuss issues in a lively and fun environment.
          These debates will be respectful, setting a positive example for children, not the ill-educated, direspectful behaviour currently seen.
          The upper house, composed of scientific advisors, can analyze these debates and provide educational insights.
          These houses serve more as a space for public engagement and education rather than actual decision-making bodies.</li>
        <li><strong>Informed Decision-Making:</strong>
          Recognizing that our animal DNA is inherently self-interested,
          scientific advisors will provide clear explanations of how different policies could impact individuals and society as a whole.
          This helps citizens make informed choices that consider both immediate benefits and long-term consequences.</li>
        <li><strong>One Person, One Vote:</strong>
          Every citizen has an equal vote on every issue, ensuring that the democratic process is truly representative of the people's will.
          The final decision-making happens through secure electronic systems, where each person’s vote is counted equally.</li>
        <li><strong>Supermajority Requirement:</strong>
          For any action to be enacted, it must receive the support of at least two-thirds of the electorate.
          This ensures that only policies with broad, substantial support are implemented,
          preventing the divisive and often unrepresentative outcomes seen in traditional party politics.
          Political parties, which often gain power with the support of a small fraction of the electorate,
          would no longer dominate the political landscape.</li>
      </ul>
      <h5>How It Works</h5>
      <ul>
        <li><strong>Secure Voting Technology:</strong>
          Citizens can vote on issues using secure mobile applications or other accessible technology platforms.</li>
        <li><strong>Public Debates:</strong>
          The lower house facilitates public debates where citizens can discuss and deliberate on issues in an engaging,
          fun but respectful environment.</li>
        <li><strong>Scientific Analysis:</strong> The upper house of scientific advisors reviews the outcomes of these debates,
          providing evidence-based analysis and potential consequences.
          This analysis is shared with the public to inform their voting.
          The ONS transforms from an organisation publishing political opinions, to an organistaion publishing scientific information.</li>
        <li><strong>Direct Voting:</strong>
          Citizens cast their votes on each issue through secure electronic systems,
          with the requirement that a two-thirds majority (of the electorate not just those voting) is needed for any action to be taken.</li>
      </ul>
      <h5>The Benefits of True Democracy</h5>
      <ul>
        <li><strong>Greater Representation:</strong>
          Every vote counts equally, ensuring true representation of the people's will.</li>
        <li><strong>Informed Choices:</strong>
          With expert analysis and clear communication, citizens are better equipped to make decisions that benefit society as a whole.</li>
        <li><strong>Reduced Partisanship:</strong>
          By eliminating the dominance of political parties, decisions are made based on merit and broad consensus, not political strategy.</li>
        <li><strong>Empowered Citizens:</strong>
          Direct participation empowers individuals to take an active role in governance, fostering a sense of responsibility and engagement.</li>
        <li><strong>Engaging Public Discourse:</strong>
          By maintaining the historic institutions of the lower and upper house as fun and educational forums,
          we keep public engagement lively and interesting.</li>
      </ul>
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