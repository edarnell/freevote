import { setup } from './setup'
describe('Register', function () {
    let tester = { name: 'test register', email: 'epdarnell+register@gmail.com', postcode: 'HA1 1XR' }
    let token = '', token2 = ''
    it("Setup", function () {
        console.log('Setup')
        setup(cy)
        cy.get('#join').click()
        cy.get('div[name=register]').within(() => {
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('button[name=register]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm')
        cy.get('#token').invoke('text').then(l => {
            token = l
            cy.visit('/?mail=X' + token, { onBeforeLoad: (win) => { win.fetch = null } })
            cy.get('div[name=unsubscribe]').within(() => {
                cy.contains('Delete Account')
                cy.get('button[name=unsubscribe]').click()
            })
            cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'You have been unsubscribed.')
        })
    })
    it("Register", function () {
        console.log('Register')
        setup(cy)
        cy.get('#join').click()
        cy.get('div[name=register]').within(() => {
            cy.get('input[name=name]').should(n => {
                expect(n.get(0).checkValidity()).to.equal(false)
                expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
            })
            cy.get('input[name=name]').type(tester.name).should(n => {
                expect(n.get(0).checkValidity()).to.equal(true)
                expect(n.get(0).validationMessage).to.equal('')
            })
            cy.get('input[name=email]').should(n => {
                expect(n.get(0).checkValidity()).to.equal(false)
                expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
            })
            cy.get('input[name=email]').type('invalidemail').should(n => {
                expect(n.get(0).checkValidity()).to.equal(false)
                expect(n.get(0).validationMessage).to.equal("Please include an '@' in the email address. 'invalidemail' is missing an '@'.")
            })
            cy.get('input[name=email]').clear().type(tester.email).should(n => {
                expect(n.get(0).checkValidity()).to.equal(true)
                expect(n.get(0).validationMessage).to.equal('')
            })
            cy.get('button[name=register]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm')
        cy.get('#join').click()
        cy.get('div[name=register]').within(() => {
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('button[name=register]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Confirm", function () {
        cy.visit('/?mail=R' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Registration confirmed.')
        cy.get('#join').click()
        cy.get('div[name=register]').within(() => {
            cy.get('input[name=name]').type('Test Update')
            cy.get('input[name=email]').type(tester.email)
            cy.get('button[name=register]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Confirm Changes", function () {
        cy.visit('/?mail=U' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Details updated.')
        cy.get('#join').click()
        cy.get('div[name=register]').within(() => {
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('button[name=register]').click()
        })
        cy.get('div[name=alert]').should('contain', 'Please check your email to confirm')
        cy.get('#token').invoke('text').then(l => token2 = l)
    })
    it("Updated", function () {
        cy.visit('/?mail=U' + token2, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Details updated.')
        cy.visit('/?mail=U' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'timeout')
    })
    it("Unsubscribe", function () {
        cy.visit('/?mail=X' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=unsubscribe]').within(() => {
            cy.contains('Delete Account')
            cy.get('button[name=unsubscribe]').click()
        })
        //cy.wait(2000)
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'You have been unsubscribed.')
    })
})
