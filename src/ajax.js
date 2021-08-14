import { debug } from './debug'
import 'whatwg-fetch'

function ajax(req) // token used when state not yet set
{
  debug('ajax')({ req })
  return new Promise((resolve, reject) => {
    let ok = true
    fetch('/ajax', params(req))
      .then(res => {
        ok = res.ok
        debug('ajax')({ req, res })
        return req.gz ? res.text() : res.json()
      })
      .then(json => {
        debug('ajax')({ req_req: req.req, json })
        if (!ok) {
          console.error('ajax', json)
          reject(json)
        }
        else resolve(json)
      })
      .catch(e => {
        console.error('ajax', req, e)
        reject({ error: e.message })
      })
  })
}

function params(data) {
  let ret
  if (!data) ret = {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    method: 'get',
    cache: 'no-cache'
  }
  //cache: 'default'
  //'FM-Token': fm.user ? fm.user.token : null,
  //'FM-Origin': fm.origin
  else {
    ret = {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'FV-Origin': window.location.origin
      },
      method: 'post',
      cache: 'no-cache',
      body: JSON.stringify(data)
    }
    //'FM-Token': fm.user ? fm.user.token : null,
    //  'FM-Last': JSON.stringify(fm.last()),
    //    'FM-Origin': fm.origin,
  }
  //console.log('params',data,ret.body)
  return ret
}

export { ajax }
