import React, { Component } from 'react'
import { Modal, Form, Col, Row, Button } from 'react-bootstrap'
import { ajax } from './ajax'

class Contact extends Component {
  state = { name: '', email: '', message: '', error: {}, tick: [] }
  componentDidMount() {
    if (this.props.type === 'V' || this.props.type === 'M') ajax({ req: 'message', token: this.props.token })
      .then(r => this.setState({ message: r.message, name: r.name, email: r.email }))
      .catch(r => this.props.close({ type: 'danger', text: 'Error: ' + r.error }))
  }
  tickbox = (c) => {
    let t = this.state.tick
    t[c] = !t[c]
    this.setState({ tick: t, spam: false })
  }
  contact = (e) => {
    e.preventDefault()
    if (this.props.token) {
      const reply = this.props.type === 'M'
      ajax({ req: reply ? 'reply' : 'send', message: this.state.message, name: this.state.name, email: this.state.email, token: this.props.token })
        .then(r => {
          const token = r.send && r.send.token
          this.props.close({ type: 'success', text: reply ? 'Reply sent.' : 'Message sent. We aim to respond within 24 hours.' }, token)
        })
        .catch(r => this.props.close({ type: 'danger', text: 'Error: ' + r.error }))
    }
    else if (this.state.tick[1] || this.state.tick[3] || !this.state.tick[2]) this.setState({ spam: true })
    else ajax({ req: 'contact', email: this.state.email, name: this.state.name, message: this.state.message })
      .then(r => {
        const token = r.send && r.send.token
        this.props.close({ type: 'success', text: 'Please check your email to confirm sending (check spam and mark as not spam if misdirected).' }, token)
      })
      .catch(r => this.props.close({ type: 'danger', text: 'Error: ' + r.error }))
  }
  update = (field, value) => {
    let s = this.state
    s[field] = value
    this.setState(s)
  }
  render() {
    return (<Modal name='contact' animation={false} show={true} onHide={() => this.props.close()}>
      <Modal.Header closeButton><Modal.Title>{this.props.type === 'M' ? 'Reply' : 'Contact FreeVote.uk'}</Modal.Title></Modal.Header>
      <Modal.Body>
        {this.state.error.error ? <div name='error' className="alert alert-danger"><strong>Server Error: {this.state.error.error}</strong></div> : null}
        {this.state.spam ? <div name='spam' className="alert alert-danger"><strong>Spam check failed</strong></div> : null}
        <Form onSubmit={this.contact}>
          {this.props.token ? null : <div>
            <Form.Group as={Row} controlId="formName">
              <Form.Label column sm={3}>Name</Form.Label>
              <Col sm={9}><Form.Control required type="name" name="name" value={this.state.name} placeholder="First Last" onChange={(e) => this.update('name', e.target.value)} /></Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formEmail">
              <Form.Label column sm={3}>Email</Form.Label>
              <Col sm={9}><Form.Control required type="email" name="email" value={this.state.email} placeholder="Email" onChange={(e) => this.update('email', e.target.value)} /></Col>
            </Form.Group>
          </div>}
          <Form.Group as={Row} controlId="formMessage">
            <Form.Label column sm={3}>Message</Form.Label>
            <Col sm={9}><Form.Control required as="textarea" value={this.state.message} placeholder="message" rows="3" onChange={(e) => this.update('message', e.target.value)} /></Col>
          </Form.Group>
          {this.props.token ? null : <div>Anti-spam please tick the middle box.</div>}
          <Form.Group as={Row}>
            <Col sm={3}>
              {this.props.token ? null : ['1', '2', '3'].map(c => <Form.Check name={'cb' + c} key={c} type='checkbox' inline onClick={() => this.tickbox(c)} />)}
            </Col>
            <Col offset={3} sm={4}><Button name="send" variant="primary" type="submit"><i className="fa fa-envelope-o"></i> {this.props.type === 'M' ? 'Reply' : 'Send'}</Button></Col>
          </Form.Group>
        </Form>
      </Modal.Body></Modal>)
  }
}

export default Contact