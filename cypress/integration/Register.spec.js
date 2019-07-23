import {setup,read_email} from './setup'
// add tests for adding deleting etc
// add tests for clicking on log
describe('Register', function() {
    let tester={name:'test register',email:'epdarnell+freevote@gmail.com',postcode:'HA1 1XR'}
    it("Register", function() {
        console.log('Register')
        setup(cy)
        cy.get('a[name=join]').click()
        cy.get('div[name=register]').within(()=>{
        cy.get('input[name=name]').should(n=>{
            expect(n.get(0).checkValidity()).to.equal(false)
            expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
        })
        cy.get('input[name=name]').type(tester.name).should(n=>{
            expect(n.get(0).checkValidity()).to.equal(true)
            expect(n.get(0).validationMessage).to.equal('')
        })
        cy.get('input[name=email]').should(n=>{
            expect(n.get(0).checkValidity()).to.equal(false)
            expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
        })
        cy.get('input[name=email]').type('invalidemail').should(n=>{
            expect(n.get(0).checkValidity()).to.equal(false)
            expect(n.get(0).validationMessage).to.equal("Please include an '@' in the email address. 'invalidemail' is missing an '@'.")
        })
        cy.get('input[name=email]').clear().type(tester.email).should(n=>{
            expect(n.get(0).checkValidity()).to.equal(true)
            expect(n.get(0).validationMessage).to.equal('')
        })
        cy.get('input[name=postCode]').type('invalidpostcode').should(n=>{
            expect(n.get(0).checkValidity()).to.equal(false)
            expect(n.get(0).validationMessage).to.equal("Please match the format requested.")
        })
        cy.get('input[name=postCode]').clear().should(n=>{
            expect(n.get(0).checkValidity()).to.equal(true)
        })
        cy.get('input[name=postCode]').type('HA1 1XR').should(n=>{
            expect(n.get(0).checkValidity()).to.equal(true)
        })
        cy.get('button[name=register]').click()
      })
      cy.wait(1000)
      //cy.get('div[name=alert]').should('contain','Account registered. Please check your email to confirm.')
      //cy.get('div[name=alert]').should('contain','Account re-registered. Please check your email to confirm.')
      cy.get('div[name=alert]').should('contain','Details updated. Please check your email to confirm changes.')
    })

    it("Confirm Changes", function() {
        read_email('update_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Confirm Changes')
            expect(r.message).to.have.string('Please confirm your updated details.')
            expect(r.button.title).to.equal('Confirm Changes')
            expect(r.button.text).to.equal('link will expire in 48 hours')
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail='+link[1],{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.get('div[name=alert]').should('contain','Registration confirmed.')
        })     
    })
    it.only("Welcome", function() {
        read_email('confirmed_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Welcome')
            expect(r.message).to.have.string('Welcome to the start of true democracy.')
            expect(r.button.title).to.equal('Contact Us')
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail='+link[1],{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.get('div[name=contact]').within(()=>{
                cy.contains('Contact Us')
                cy.get('textarea[id=formMessage]').should(n=>{
                    expect(n.get(0).checkValidity()).to.equal(false)
                    expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
                }).type("A test message").should(n=>{
                    expect(n.get(0).checkValidity()).to.equal(true)
                    expect(n.get(0).validationMessage).to.equal('')
                })
                cy.get('button[name=send]').click()
            })
            cy.get('div[name=alert]').should('contain','Message sent. We aim to respond within 24 hours.')
        })     
    })
})
