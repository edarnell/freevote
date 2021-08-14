
import { setup, check_log } from './setup'
describe('Home', function () {

  it("Home", function () {
    console.log('Home', "Home Page")
    setup(cy)
    cy.get('#nav a[class=navbar-brand]').should('contain', 'FreeVote.')
    //cy.get('#nav a[class=navbar-brand]').should('contain', 'tick.svg') TODO add test
    cy.get('#basic-navbar-nav a').should(as => {
      expect(as).to.have.length(3)
      expect(as.eq(0)).to.contain('Join')
      expect(as.eq(1)).to.contain('About')
      expect(as.eq(2)).to.contain('Contact')
    })
    cy.get('#page').should('contain', 'Every vote is however one step closer to a fair and sustainable future.')

    cy.get('#join').click()
    cy.get('div[name=register]').should('contain', 'Join')
    cy.get('div[name=register]').contains('×').click()
    cy.get('#about').click()
    cy.get('div[name=about]').should('contain', 'About')
    cy.get('div[name=about]').contains('×').click()
    cy.get('#contact').click()
    cy.get('div[name=contact]').should('contain', 'Contact')
    cy.get('div[name=contact]').contains('×').click()
    check_log(cy)
  })
})
