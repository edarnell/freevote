import React, { Component } from 'react'
import {Modal,Form,Col,Row,Button} from 'react-bootstrap'
import {ajax} from './ajax'

class Contact extends Component {
    state={name:'',email:'',message:'',error:{},tick:[]}
    componentWillMount()
    {
      if (this.props.type==='V' || this.props.type==='M') ajax({req:'message',token:this.props.token},r=>{
        console.log('message',r)
        if (r.error) this.props.close({type:'danger',text:'Error: '+r.error})
        else this.setState({message:r.message,name:r.name,email:r.email})
      })
    }
    tickbox=(c)=>{
      let t=this.state.tick
      t[c]=!t[c]
      this.setState({tick:t})
    }
    contact=(e)=>{
      e.preventDefault()
      if (this.props.token) ajax({req:this.props.type==='M'?'reply':'send',message:this.state.message,name:this.state.name,email:this.state.email,token:this.props.token},r=>{
        if (r.error) this.props.close({type:'danger',text:'Error: '+r.error})
        else this.props.close({type:'success',text:'Message sent. We aim to respond within 24 hours.'})
      })
      else if (this.state.tick[1]||this.state.tick[3]||!this.state.tick[2]) this.props.close({type:'danger',text:'Not sent: anti-spam check failed.'})
      else ajax({req:'contact',email:this.state.email,name:this.state.name,message:this.state.message},r=>{
        if (r.error) this.props.close({type:'danger',text:'Error: '+r.error})
        else this.props.close({type:'success',text:'Please check your email to confirm sending.'})
      })
    }
    update=(field,value)=>{
      let s=this.state
      s[field]=value
      this.setState(s)
    }
    render() {
      return (<Modal name='contact' show={true} onHide={()=>this.props.close()}>
        <Modal.Header closeButton><Modal.Title>{this.props.type==='M'?'Reply':'Contact Us'}</Modal.Title></Modal.Header>
        <Modal.Body>
        {this.state.error.error?<div className="alert alert-danger"><strong>Server Error: {this.state.error.error}</strong></div>:null}
        <Form onSubmit={this.contact}>
        {this.props.token?null:<div>
        <Form.Group as={Row} controlId="formName">
        <Form.Label column sm={3}>Name</Form.Label>
          <Col sm={9}><Form.Control required type="name" name="name" value={this.state.name} placeholder="First Last" onChange={(e)=>this.update('name',e.target.value)}/></Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formEmail">
          <Form.Label column sm={3}>Email</Form.Label>
          <Col sm={9}><Form.Control required type="email" name="email" value={this.state.email} placeholder="Email" onChange={(e)=>this.update('email',e.target.value)}/></Col>
        </Form.Group>
        </div>}
        <Form.Group as={Row} controlId="formMessage">
          <Form.Label column sm={3}>Message</Form.Label>
          <Col sm={9}><Form.Control required as="textarea" value={this.state.message} placeholder="message" rows="3" onChange={(e)=>this.update('message',e.target.value)}/></Col>
        </Form.Group>
        {this.props.token?null:<div>Anti-spam please tick the middle box.</div>}
        <Form.Group as={Row}>
          <Col sm={3}>
          {this.props.token?null:['1','2','3'].map(c=><Form.Check name={'cb'+c} key={c} type='checkbox' inline onClick={()=>this.tickbox(c)}/>)}
          </Col>
          <Col offset={3} sm={4}><Button name="send" variant="primary" type="submit"><i className="fa fa-envelope-o"></i> {this.props.type==='M'?'Reply':'Send'}</Button></Col>
        </Form.Group>
        </Form>
        </Modal.Body></Modal>)
    }
}

export default Contact