import { setup } from './setup'
// add tests for adding deleting etc
// add tests for clicking on log
describe('Contact', function () {
    let tester = { name: 'test contact', email: 'epdarnell+contact@gmail.com' }, token
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
    it("Contact Us", function () {
        setup(cy)
        cy.get('#contact').click()
        cy.get('div[name=contact]').within(() => {
            cy.contains('Contact FreeVote.uk')
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
            cy.get('textarea[id=formMessage]').should(n => {
                expect(n.get(0).checkValidity()).to.equal(false)
                expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
            }).type("A test message").should(n => {
                expect(n.get(0).checkValidity()).to.equal(true)
                expect(n.get(0).validationMessage).to.equal('')
            })
            cy.get('button[name=send]').click()
            cy.get('div[name=spam]').should('contain', 'Spam check failed')
            cy.get('input[name=cb2]').click()
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm sending')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Confirm Send", function () {
        cy.visit('/?mail=V' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=contact]').within(() => {
            cy.contains('Contact FreeVote.uk')
            cy.get('textarea[id=formMessage]').contains("A test message")
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Message sent. We aim to respond within 24 hours.')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Reply", function () {
        cy.visit('/?mail=M' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=contact]').within(() => {
            cy.contains('Reply')
            cy.get('textarea[id=formMessage]').contains("A test message")
            cy.get('textarea[id=formMessage]').type(" - reply")
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]').should('contain', 'Reply sent.')
    })
    it("Setup 2", function () {
        console.log('Setup')
        setup(cy)
        cy.get('#join').click()
        cy.get('div[name=register]').within(() => {
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('button[name=register]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm')
    })
    it("Contact Us 2", function () {
        setup(cy)
        cy.get('#contact').click()
        cy.get('div[name=contact]').within(() => {
            cy.contains('Contact FreeVote.uk')
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('textarea[id=formMessage]').type("A 2nd test message")
            cy.get('input[name=cb2]').click()
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm sending')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Confirm Send 2", function () {
        cy.visit('/?mail=V' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=contact]').within(() => {
            cy.contains('Contact FreeVote.uk')
            cy.get('textarea[id=formMessage]').contains("A 2nd test message")
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Message sent. We aim to respond within 24 hours.')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Reply 2", function () {
        cy.visit('/?mail=M' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=contact]').within(() => {
            cy.contains('Reply')
            cy.get('textarea[id=formMessage]').contains("A 2nd test message")
            cy.get('textarea[id=formMessage]').type(" - reply")
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]').should('contain', 'Reply sent.')
    })
    it("Setup 3", function () {
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
            cy.visit('/?mail=R' + token, { onBeforeLoad: (win) => { win.fetch = null } })
            cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Registration confirmed')
        })
    })
    it("Contact Us 3", function () {
        setup(cy)
        cy.get('#contact').click()
        cy.get('div[name=contact]').within(() => {
            cy.contains('Contact FreeVote.uk')
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('textarea[id=formMessage]').type("A 3rd test message")
            cy.get('input[name=cb2]').click()
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Please check your email to confirm sending')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Confirm Send 3", function () {
        cy.visit('/?mail=V' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=contact]').within(() => {
            cy.contains('Contact FreeVote.uk')
            cy.get('textarea[id=formMessage]').contains("A 3rd test message")
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]', { timeout: 5000 }).should('contain', 'Message sent. We aim to respond within 24 hours.')
        cy.get('#token').invoke('text').then(l => token = l)
    })
    it("Reply 3", function () {
        cy.visit('/?mail=M' + token, { onBeforeLoad: (win) => { win.fetch = null } })
        cy.get('div[name=contact]').within(() => {
            cy.contains('Reply')
            cy.get('textarea[id=formMessage]').contains("A 3rd test message")
            cy.get('textarea[id=formMessage]').type(" - reply")
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]').should('contain', 'Reply sent.')
    })
})
