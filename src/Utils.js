import FV from './FV'

let fv=new FV()
let debugs={}
function debug(func) {
  if (debugs[func]) debugs[func].n++
  else {
    debugs[func]={n:1}
    Object.keys(debugs).forEach(k=>{
      if (k!==func && func.startsWith(k) && debugs[k].show) debugs[func].show=true
    })
  }
  if (debugs[func].show) return true
}
function set_debug() {
  // fm.user.debug - use to set for automated tests
  for (var i = 0; i < arguments.length; i++) {
    let val=arguments[i]
    if (debugs[val]) debugs[val].show=!debugs[val].show
    else debugs[val]={n:0,show:true}
    Object.keys(debugs).forEach(k=>{if (k!==val && k.startsWith(val)) debugs[k].show=true})
  }
}
function copy(x)
{
  return x===Object(x)?JSON.parse(JSON.stringify(x)):x
}

export {copy,debug,set_debug,fv}
