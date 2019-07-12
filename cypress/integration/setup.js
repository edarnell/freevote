function setup(cy,url) {
  if (!url) url='/'
  check_log(cy)
  cy.visit(url,{onBeforeLoad:(win)=>{win.fetch = null}})
  cy.get('#page').should('exist')
  
}
function read_email(name,done) {
  cy.readFile('server/storage/emails/'+name).then(f=>{
    let m=JSON.parse(f)
    console.log('email',m)
    done(m)
  })
}
function check_log(cy) {
  cy.readFile('server/storage/error.log').then(f=>{
    let PHP_errors=false
    if (f.indexOf('PHP')!==-1) {
      console.error('error.log contains PHP errors - please check and clear')
      PHP_errors=true
    }
    expect(PHP_errors).to.be.false
  })
}
export {setup,check_log,read_email}
