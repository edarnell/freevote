import React, { Component } from 'react'
import {Navbar,Nav,Modal} from 'react-bootstrap'
import logo from './agilelogo3.png'
import Register from './Register'
import Contact from './Contact'
import {ajax} from './ajax'
import { set_debug } from './Utils';

class FreeVote extends Component {
  state={nav:'home',message:null}
  componentWillMount()
  {
    set_debug('ajax')
    if (window.location.search && window.location.search.startsWith('?mail=')) {
        // R=register
      let type=window.location.search.substr(6,1)
      let id=window.location.search.substr(7,window.location.search.indexOf('_'))
      let token=window.location.search.substr(window.location.search.indexOf('_')+1)
      if (type==='R') ajax({req:'confirm',token:token},
        (r)=>{
          if (r.error)  this.setState({message:{type:'danger',text:'Error: '+r.error}})
          else this.setState({message:{type:'success',text:'Registration confirmed.'}})
        }
      )
        //else if (type==='E') this.setState({modal:'emailUpdate',token:token,uid:id})
        //else if (type==='P') this.setState({modal:'reset',token:token,uid:id})
        //else if (type==='R') this.setState({modal:'reset',token:token,uid:id}) // re-use reset code
        //else if (type==='X') this.setState({modal:'contact',token:token,uid:id})
    }
    if (window.location.search && window.location.search!=='') window.history.pushState("object or string","Title","/")
  }
  close=(m)=>{
      // message may be e - so treat e as null
      if (m && m.text) this.setState({nav:'home',message:m})
      else this.setState({nav:'home',message:null})
  }
  render() {
    let page,modal
    switch (this.state.nav)
    {
      case 'about':
        page=<Home nav={(n)=>this.setState({nav:n})}/>
        modal=<About close={()=>this.setState({nav:'home'})}/>
        break
      case 'join':
        page=<Home nav={(n)=>this.setState({nav:n})}/>
        modal=<Register close={this.close}/>
        break
      case 'contact':
        page=<Home nav={(n)=>this.setState({nav:n})}/>
        modal=<Contact close={()=>this.close}/>
        break
      default:
        page=<Home nav={(n)=>this.setState({nav:n})}/>
        modal=null
    }
    return (<div><FVNav nav={(n)=>this.setState({nav:n})} page={this.state.nav} het={this.state.het}/>
      <div className="navbarSpacer"></div>
      <div id="page" className='container'>
      {this.state.message?<div name="alert" className={"alert alert-dismissible alert-"+this.state.message.type}>
      <button type="button" className="close" onClick={this.state.message.close?this.state.message.close:()=>this.setState({message:null})} data-dismiss="alert">&times;</button>
      <strong>{this.state.message.text}</strong></div>:null}
      {page}
      {modal}
      </div>
      </div>)
  }
}

class Home extends Component {
  render() {
    return <div> 
  <div><img src={logo} alt="AgileLogo"/><button onClick={(e)=>{e.preventDefault();this.props.nav('join')}} className='btn btn-primary btn-lg'>Sign Up</button></div>
  <h1>Direct Democracy</h1>
  <p><a  target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Direct_democracy">Democracy</a> has no political beliefs beyond democracy itself. The electorate not politicians form and decide on the priorities. There are no manifestos or political ideologies.  The electorate are in charge, if something is not working it can be changed. The electorate decide what, how and when.</p>
  <p>Our political systems are driving environmental destruction, inequality and extremism. We can do far better, harnessing the <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Wisdom_of_the_crowd">wisdom of the crowd</a> to deliver 21st century solutions to 21st century problems. <a target="_blank"  rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Universal_suffrage">Universal suffrage</a> was the start not the end of the fight for true <a  target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Direct_democracy">democracy</a>.
  We no longer need <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Representative_democracy">representatives</a>. Democracy is about everyone being able to learn and decide for themselves.</p>
  <p>Change is urgently needed if we are to build a fair society whilst preserving our precious world for future generations.</p>
  <ul><li>The aim is to democratically propose, validate, improve and deliver ideas.</li></ul>	
  <p>True democracy has not been technically possible until recently, but it is now. We no longer need to be ruled by political parties and powerful individuals. We can democratically agree what needs to change. We live in a <a rel="noopener noreferrer" target="_blank" href="https://en.wikipedia.org/wiki/Representative_democracy">representative democracy</a> but transitioning to <a  target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Direct_democracy">direct democracy</a> is only a matter of voting for it.</p>
  <p>Do not expect politicians to deliver this for us.  We must do it for ourselves, democratically. If you would like to help please <a href="#join" onClick={(e)=>{e.preventDefault();this.props.nav('join')}}>sign up</a>.</p>
  <h3>Guiding principles for true democracy</h3>
  <ul>
  <li>Democracy is primarily about freedom rather than control. Invest in the good, tax, ban or ration the bad, and only set laws which are clear and necessary.</li>
  <li>Everyone has an equal right to propose changes to taxation, investment, laws or anything else. We all have an equal say in what is fair and reasonable and what needs to change.</li>
  <li>For an idea to be implemented at least 50% of the electorate must support it. Abstaining is a lack of support. Nothing is implemented until everyone has had the opportunity to review. Anyone can change their mind at any time.</li>
  <li>Ideas should be validated and improved, not marketed. All input and review should be anonymous and transparent. Submitted ideas are owned by the electorate not individuals.</li>
  <li>Ideas should be concrete, measurable and deliverable. The review process should refine ideas and add to evidence and measures. Evidence should be kept as balanced, clear and succinct as possible. Any lack of certainty should be expressed with statistical rigour.</li>
  <li>Validation of ideas should be based on evidence not rhetoric. Half-truths and logical or factual errors should be highlighted and corrected. Specialists should aim to educate not indoctrinate. Ideas gaining the most local/national support will be automatically distributed for wider local/national review. </li> 
  <li>The electorate are responsible for the prioritisation process. Ideas with most support should be implemented first unless the electorate decide otherwise.</li>
  <li>Delivery should be <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Test-driven_development">test driven</a>. The electorate must be kept regularly informed on progress against agreed measures. The electorate may re-direct or re-prioritise at any time.</li>
  </ul>
  <br/><br/>
  </div>
  }
}
//          <a href="#" className="navbar-left"><img src={logo} height="50" alt="AgileLogo"/></a>

class FVNav extends Component {
    state={in:false}
    render() {
    return(<Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <div className='container'>
      <Navbar.Brand href="#home">FreeVote.uk</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
        <Nav.Link href="#home" onClick={(e)=>{e.preventDefault();this.props.nav('home')}}>Home</Nav.Link>
      </Nav>
      <Nav className="justify-content-end">
        <Nav.Link href="#join" onClick={(e)=>{e.preventDefault();this.props.nav('join')}}>Join</Nav.Link>
        <Nav.Link href="#about" onClick={(e)=>{e.preventDefault();this.props.nav('about')}}>About</Nav.Link>
        <Nav.Link href="#contact" onClick={(e)=>{e.preventDefault();this.props.nav('contact')}}>Contact</Nav.Link>
      </Nav>
      </Navbar.Collapse>
      </div>
      </Navbar>)
    }
    // <Nav className="justify-content-end">
}

class About extends Component {
  render() {
    return(
      <Modal name="about" show={true} onHide={this.props.close}>
      <Modal.Header closeButton>
      <Modal.Title>About</Modal.Title></Modal.Header>
      <Modal.Body>
      <p>The world is a wonderful place which we must learn to share and look after. <a href="https://en.wikipedia.org/wiki/Direct_democracy">Direct democracy</a> is the only obvious way to deliver a fair, sustainable, secure and enjoyable life for all.</p>
      <p>FreeVote.uk was created by <a href="https://www.linkedin.com/in/eddarnell/">Ed Darnell</a>. It has no political affiliation. If you would like to help, please join.</p>
      </Modal.Body>
      </Modal>)
  }
}


export default FreeVote