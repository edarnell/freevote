//import {debug,set_debug} from './Utils'
import {ajax} from './ajax'
class FV {
	constructor() {
        this.parent=null
        this.mobile=(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)
        this.iPhone=(/iPhone|iPad|iPod/i).test(navigator.userAgent)
        this.origin=window.location.origin?window.location.origin:null
    }
    serviceWorker(parent,app,update)
    {
        //Learn more about service workers: http://bit.ly/CRA-PWA
        this.parent=parent
        this.app=app
        this.update=update
        //console.log("FM",this.migrate())
    }
    onUpdate(registration)
    {
        // At this point, the old content will have been purged and
        // the fresh content will have been added to the cache.
        // It's the perfect time to display a "New content is
        // available; please refresh." message in your web app.
        // console.log('New content is available; please refresh.');
        // fm.swState('newcontent')
        this.parent.setState({log:null,message:{type:'danger',text:'Software Updating - page will reload'}})
        setTimeout(function(){window.location.reload()}, 2000)
    }
    onSuccess(registration) {
    // At this point, everything has been precached.
      // It's the perfect time to display a
      // "Content is cached for offline use." message.
      //console.log('Content is cached for offline use.');
      //fm.swState('cached')
      this.parent.setState({type:'success',text:'Content is cached for offline use.'})
      this.ready()
    }
    req_unsubscribe=(req,done,error)=>{
        req.req='unsubscribe'
        ajax('/ajax',(r)=>{
          if (r.error) error(r.data)
          else {
              this.clear_user()
              this.user=null
              this.parent.setState({log:null})
              done()
          }
        },req)
    }
    req_register=(details,done,error)=>{
      let req={req:'register'}
      ;['email','name','postcode'].forEach(k=>{if (details[k]) req[k]=details[k]})
      ajax('/ajax',(r)=>{
        if (r.error) error(r.data)
        else done()
      },req)
    }
    req_confirm=(token,done)=>{
      ajax('/ajax',(r)=>{
        if (r.error)  done({type:'danger',text:'Error: '+r.error})
        else done({type:'success',text:'Registration confirmed.'})
      },{req:'confirm',token:token})  
    }
    req_mail=(details,done,error)=>{
        let req={req:'mail'}
        ;['message','maths','log','to','from','qkey','r_token'].forEach(k=>{if (details[k]) req[k]=details[k]})
        ajax('/ajax',(r)=>{
          if (r.error) error(r.data)
          else {
              if (this.user) this.addLog(r)
              done({type:'success',text:req.reply?'Reply sent.':'Message sent. We aim to respond within 24 hours.'})
          }
        },req)
    }
}
export default FV