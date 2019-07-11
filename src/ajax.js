import {debug,copy} from './Utils'
import 'whatwg-fetch'

function ajax(req,done) // token used when state not yet set
{
  if (debug('ajax')) console.log('ajax',copy(req))
  let error=false
  fetch('/ajax',params(req))
  .then(res=>{
    if (!res.ok) {
      if (debug('ajax')) console.error(req,res.statusText)
      error=res.statusText
    }
    return res.json()
  })
  .then(json=>{
    //error?console.log(url,error,json):console.log(url,json)
    if (debug('ajax')) console.debug('ajax',json,error)
    if (done) done({error:error,data:json})
  })
  .catch(e=>{
    if (debug('ajax')) console.error(req,error)
    if (done) done({error:e,data:{error:error?error:e.message}})
  })
}

function params(req)
{
  let ret = {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'FV-Origin':window.location.origin?window.location.origin:null,
      },
      method: 'post',
      cache: 'no-cache',
      body: JSON.stringify(req)
  }
  if (debug('params')) console.log('params',req,ret.body)
  return ret
}
export {ajax}
