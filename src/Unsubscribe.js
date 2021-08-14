import React, { Component } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { ajax } from './ajax'
import { debug } from './debug'

class Unsubscribe extends Component {
  unsubscribe = (e) => {
    e.preventDefault()
    if (this.props.token) {
      ajax({ req: 'unsubscribe', token: this.props.token }).then(r => {
        debug('unsubscribe')({ r })
        this.props.close({ type: 'success', text: 'You have been unsubscribed.' })
      }).catch(r => this.props.close({ type: 'danger', text: 'Error: ' + r.error }))
    }
    else this.props.close({ type: 'danger', text: 'Invalid token.' })
  }
  render() {
    return (<Modal name='unsubscribe' animation={false} show={true} onHide={() => this.props.close()}>
      <Modal.Header closeButton><Modal.Title>Delete Account</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>Unsubscribing will completely remove your account.
          <br />You will need to re-register if you wish to join FreeVote.uk again.
          <br />Close this window without confirming if this is not what you want to do.</p>
        <Form onSubmit={this.unsubscribe}>
          <Button name="unsubscribe" variant="danger" type="submit"><i className="fa fa-btn fa-user"></i> Unsubscribe</Button>
        </Form>
      </Modal.Body></Modal>)
  }
}

export default Unsubscribe