import React, { Component } from 'react'
import {Modal,Form,Col,Row,Button} from 'react-bootstrap'

class Contact extends Component {
    state={name:'',email:'',message:'',error:{}}
    contact=()=>{
      return false
    }
    update=(field,value)=>{
      let s=this.state
      s[field]=value
      this.setState(s)
    }
    render() {
      return (<Modal name='contact' show={true} onHide={()=>this.props.close()}>
        <Modal.Header closeButton><Modal.Title>Contact Us</Modal.Title></Modal.Header>
        <Modal.Body>
        {this.state.error.error?<div className="alert alert-danger"><strong>Server Error: {this.state.error.error}</strong></div>:null}
        <Form onSubmit={this.contact}>
        <Form.Group as={Row} controlId="formName">
        <Form.Label column sm={3}>Name</Form.Label>
          <Col sm={9}><Form.Control required type="name" name="name" value={this.state.name} placeholder="First Last" onChange={(e)=>this.update('name',e.target.value)}/></Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formEmail">
          <Form.Label column sm={3}>Email</Form.Label>
          <Col sm={9}><Form.Control required type="email" name="email" value={this.state.email} placeholder="Email" onChange={(e)=>this.update('email',e.target.value)}/></Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formMessage">
          <Form.Label column sm={3}>Message</Form.Label>
          <Col sm={9}><Form.Control required as="textarea" value={this.state.message} placeholder="message" rows="3" onChange={(e)=>this.update('message',e.target.value)}/></Col>
        </Form.Group>
        <Form.Group>
          <Col smOffset={2} sm={4}><Button name="register" bsStyle="primary" type="submit"><i className="fa fa-envelope-o"></i> Send</Button></Col>
        </Form.Group>
        </Form>
        </Modal.Body></Modal>)
    }
}

export default Contact