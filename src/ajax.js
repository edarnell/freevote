import {debug,copy} from './Utils'
import 'whatwg-fetch'

function ajax(url,action,data,token) // token used when state not yet set
{
  if (debug('ajax')) console.log('ajax',url,copy(data))
  let error=false
  fetch(url,params(data,token))
  .then(res=>{
    if (!res.ok) {
      if (debug('ajax')) console.error(url,data,res.statusText)
      error=res.statusText
    }
    return url.endsWith('.gz')?res.text():res.json()
  })
  .then(json=>{
    //error?console.log(url,error,json):console.log(url,json)
    if (action) action({error:error,data:json})
  })
  .catch(e=>{
    if (debug('ajax')) console.error(url,error,data)
    if (action) action({error:e,data:{error:error?error:e.message}})
  })
}

function params(data,token)
{
  let ret
  if (!data) ret = {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'FV-Origin':window.location.origin?window.location.origin:null,
    },
    method: 'get',
    cache: 'no-cache'
    //cache: 'default'
  }
  else {
    ret = {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'FV-Origin':window.location.origin?window.location.origin:null,
      },
      method: 'post',
      cache: 'no-cache',
      body: JSON.stringify(data)
    }
  }
  //console.log('params',data,ret.body)
  return ret
}
export {ajax,params}
