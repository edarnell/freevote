import React, { Component } from 'react'
import {Modal,Form,Col,Row,Button} from 'react-bootstrap'
import {ajax} from './ajax'
class Register extends Component {
  state={name:'',email:'',postcode:'',message:'',error:{},why:false}
  register=(e)=>{
    e.preventDefault()
    ajax({req:'register',name:this.state.name,email:this.state.email,postcode:this.state.postcode},
    (r)=>{
      if (r.error) this.props.close({type:'danger',text:'Error. Our technical team have been notified. Please try later.'})
      else {
        this.props.close({type:'success',text: JSON.stringify(r.data)}) //'Registed. Please check your email to confirm.'})
      }
    })
    return false
  }
  update=(field,value)=>{
    let s=this.state
    s[field]=value
    this.setState(s)
  }
  render() {
    return (<div>
      <Modal name='register' show={true} onHide={()=>this.props.close()}>
      <Modal.Header closeButton><Modal.Title>Register</Modal.Title></Modal.Header>
      <Modal.Body>
      {this.state.error.error?<div className="alert alert-danger"><strong>Error: {this.state.error.error}</strong></div>:null}
      <Form onSubmit={this.register}>
      <Form.Group as={Row} controlId="formName">
      <Form.Label column sm={3}>Name</Form.Label>
        <Col sm={9}><Form.Control required type="name" name="name" value={this.state.name} placeholder="First Last" onChange={(e)=>this.update('name',e.target.value)}/></Col>
      </Form.Group>
      <Form.Group as={Row} controlId="formEmail">
        <Form.Label column sm={3}>Email</Form.Label>
        <Col sm={9}><Form.Control required type="email" name="email" value={this.state.email} placeholder="Email" onChange={(e)=>this.update('email',e.target.value)}/></Col>
      </Form.Group>
      <Form.Group as={Row} controlId="formPostCode">
        <Form.Label column sm={3}>Post Code</Form.Label>
        <Col sm={6}><Form.Control type="text" name="postCode" value={this.state.postcode} placeholder="optional" onChange={(e)=>this.update('postcode',e.target.value)} pattern="[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]? [0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}"/></Col>
        <Col sm={3}><a href='#whyPC' onClick={(e)=>{e.preventDefault();this.setState({why:true})}}>why?</a></Col>
      </Form.Group>
      <Form.Group as={Row} controlId="formMessage">
        <Form.Label column sm={3}>Message</Form.Label>
        <Col sm={9}><Form.Control as="textarea" value={this.state.message} placeholder="optional" rows="3" onChange={(e)=>this.update('message',e.target.value)}/></Col>
      </Form.Group>
      <Form.Group>
        <Col sm={{span:4, offset:2}}><Button name="register" varient="primary" type="submit"><i className="fa fa-btn fa-user"></i> Register</Button></Col>
      </Form.Group>
      </Form>
      <p>Your help in developing true democracy is appreciated. FreeVote.uk has no advertising or commercial activities. Your details will be kept private and not shared with any third parties.</p>
    </Modal.Body></Modal>
    {this.state.why?<Why close={()=>this.setState({why:false})}/>:null}</div>)
  }
}

class Why extends Component {
  render() {
    return(
      <Modal name="about" show={true} onHide={this.props.close}>
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