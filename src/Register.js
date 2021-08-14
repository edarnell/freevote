import React, { Component } from 'react'
import { Modal, Form, Col, Row, Button } from 'react-bootstrap'
import { ajax } from './ajax'
import { debug } from './debug'
class Register extends Component {
  state = { name: '', email: '', postcode: '', message: '', error: {}, why: false }
  register = (e) => {
    e.preventDefault()
    ajax({ req: 'register', name: this.state.name, email: this.state.email, postcode: this.state.postcode }).then(r => {
      const m = r && r.send && r.send.type
      let message = 'error'
      switch (m) {
        case 'update':
        case 'register':
        case 'reregister':
        case 'registered':
          message = 'Please check your email to confirm (check spam and mark as not spam if misdirected).'
          break
        default:
          debug('error')({ Register: { m, r } })
          message = "error: unknown case."
      }
      this.props.close({ type: 'success', text: message }, r.send.token)
    })
      .catch(r => this.props.close({ type: 'danger', text: 'Error. Our technical team will automatically notified of any server errors. Please try later and contact us if the problem persists.' }))
    return false
  }
  update = (field, value) => {
    let s = this.state
    s[field] = value
    this.setState(s)
  }
  render() {
    return (<div>
      <Modal name='register' animation={false} show={true} onHide={() => this.props.close()}>
        <Modal.Header closeButton><Modal.Title>Join</Modal.Title></Modal.Header>
        <Modal.Body>
          {this.state.error.error ? <div className="alert alert-danger"><strong>Error: {this.state.error.error}</strong></div> : null}
          <Form onSubmit={this.register}>
            <Form.Group as={Row} controlId="formName">
              <Form.Label column sm={3}>Name</Form.Label>
              <Col sm={9}><Form.Control required type="name" name="name" value={this.state.name} placeholder="First Last" onChange={(e) => this.update('name', e.target.value)} /></Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formEmail">
              <Form.Label column sm={3}>Email</Form.Label>
              <Col sm={9}><Form.Control required type="email" name="email" value={this.state.email} placeholder="Email" onChange={(e) => this.update('email', e.target.value)} /></Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Col sm={{ span: 4, offset: 3 }}><Button name="register" variant="primary" type="submit"><i className="fa fa-btn fa-user"></i> Register</Button></Col>
            </Form.Group>
          </Form>
          <p>FreeVote.uk has no advertising or commercial activities. Your details will be kept private and not shared with any third parties.</p>
        </Modal.Body></Modal>
      {this.state.why ? <Why close={() => this.setState({ why: false })} /> : null}</div>)
  }
  /*
  <Form.Group as={Row} controlId="formPostCode">
  <Form.Label column sm={3}>Post Code</Form.Label>
  <Col sm={6}><Form.Control type="text" name="postCode" value={this.state.postcode} placeholder="optional" onChange={(e) => this.update('postcode', e.target.value)} pattern="[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]? [0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}" /></Col>
  <Col sm={3}><a href='#whyPC' onClick={(e) => { e.preventDefault(); this.setState({ why: true }) }}>why?</a></Col>
</Form.Group>*/
}

class Why extends Component {
  render() {
    return (
      <Modal animation={false} name="about" show={true} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Post Code</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>Enter a valid UK post code or leave blank.</p>
          <p>True democracy is non-political so will not stand for election unless supported by a democratic majority. Post codes will be used to identify constituencies where true democracy should stand for election.</p>
        </Modal.Body>
      </Modal>)
  }
}
export default Register