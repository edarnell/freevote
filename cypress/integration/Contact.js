import { setup, read_email } from './setup'
// add tests for adding deleting etc
// add tests for clicking on log
describe('Contact', function () {
    let tester = { name: 'test register', email: 'epdarnell+freevote@gmail.com', postcode: 'HA1 1XR' }
    it.only("Contact Us", function () {
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
    })
    it("Confirm Send", function () {
        read_email('send_' + tester.email, r => {
            expect(r.greet).to.equal('Dear ' + tester.name + ',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Confirm Send')
            expect(r.message).to.have.string('Thank you for your message. Please use the send button below to confirm sending.')
            expect(r.button.title).to.equal('Send')
            expect(r.button.text).to.equal('to send your message')
            let link = r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail=' + link[1], { onBeforeLoad: (win) => { win.fetch = null } })
            cy.wait(1000)
            cy.get('div[name=contact]').within(() => {
                cy.contains('Contact Us')
                cy.get('button[name=send]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain', 'Message sent. We aim to respond within 24 hours.')
        })
    })
    it("Contact2", function () {
        read_email('contact_' + tester.email, r => {
            expect(r.greet).to.equal('')
            expect(r.to).to.be.null
            expect(r.from.name).to.equal(tester.name)
            expect(r.from.email).to.equal(tester.email)
            expect(r.title).to.equal('Message from ' + tester.name)
            expect(r.message).to.have.string('A test message')
            expect(r.button.title).to.equal("Reply")
            let link = r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail=' + link[1], { onBeforeLoad: (win) => { win.fetch = null } })
            cy.wait(1000)
            cy.get('div[name=contact]').within(() => {
                cy.contains('Reply')
                cy.get('textarea[id=formMessage]').type(" - reply")
                cy.get('button[name=send]').click()
            })
            cy.wait(2000)
            cy.get('div[name=alert]').should('contain', 'Message sent. We aim to respond within 24 hours.')
        })
    })
    it("Reply2", function () {
        read_email('reply_' + tester.email, r => {
            expect(r.greet).to.equal('Dear ' + tester.name + ',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Reply from Ed Darnell')
            expect(r.message).to.have.string('A test message - reply')
            expect(r.button.title).to.equal('Reply')
            expect(r.button.text).to.equal('to view online and reply')
        })
    })
    it("Contact", function () {
        read_email('contact_' + tester.email, r => {
            expect(r.greet).to.equal('')
            expect(r.to).to.be.null
            expect(r.from.name).to.equal(tester.name)
            expect(r.from.email).to.equal(tester.email)
            expect(r.title).to.equal('Message from ' + tester.name)
            expect(r.message).to.have.string('A test message')
            expect(r.button.title).to.equal("Reply")
            let link = r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail=' + link[1], { onBeforeLoad: (win) => { win.fetch = null } })
            cy.wait(1000)
            cy.get('div[name=contact]').within(() => {
                cy.contains('Reply')
                cy.get('textarea[id=formMessage]').type(" - reply")
                cy.get('button[name=send]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain', 'Message sent. We aim to respond within 24 hours.')
        })
    })
    it("Reply", function () {
        read_email('reply_' + tester.email, r => {
            expect(r.greet).to.equal('Dear ' + tester.name + ',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Reply from Ed Darnell')
            expect(r.message).to.have.string('A test message - reply')
            expect(r.button.title).to.equal('Reply')
            expect(r.button.text).to.equal('to view online and reply')
        })
    })
})
