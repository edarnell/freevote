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
            cy.get('input[name=postCode]').type(tester.postcode).should(n=>{
                expect(n.get(0).checkValidity()).to.equal(true)
            })
            cy.get('button[name=register]').click()
        })
        //cy.wait(2000)
        cy.get('div[name=alert]').should('contain','Registered. Please check your email to confirm.')
        cy.get('a[name=signup]').click()
        cy.get('div[name=register]').within(()=>{
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('input[name=postCode]').type('HA1 1XR')
            cy.get('button[name=register]').click()
        })
        //cy.wait(2000)
        cy.get('div[name=alert]').should('contain','Registered. Please check your email to confirm.')
        cy.get('button[name=join]').click()
        cy.get('div[name=register]').within(()=>{
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').type(tester.email)
            cy.get('input[name=postCode]').clear()
            cy.get('button[name=register]').click()
        })
        //cy.wait(2000)
        cy.get('div[name=alert]').should('contain','Please check your email to confirm changes.')
    })
    it("Confirm", function() {
        read_email('register_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Confirm Registration')
            expect(r.message).to.have.string('Thank you for registering. Please confirm using the button below.')
            expect(r.button.title).to.equal('Confirm Registration')
            expect(r.button.text).to.equal('link will expire in 48 hours')
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail='+link[1],{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.get('div[name=alert]').should('contain','Registration confirmed.')
            cy.get('button[name=join]').click()
            cy.get('div[name=register]').within(()=>{
                cy.get('input[name=name]').type(tester.name)
                cy.get('input[name=email]').type(tester.email)
                cy.get('input[name=postCode]').type(tester.postcode)
                cy.get('button[name=register]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain','Registered.')
        })     
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
            cy.get('div[name=alert]').should('contain','Details updated.')
            cy.get('button[name=join]').click()
            cy.get('div[name=register]').within(()=>{
                cy.get('input[name=name]').type(tester.name)
                cy.get('input[name=email]').type(tester.email)
                cy.get('input[name=postCode]').clear()
                cy.get('button[name=register]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain','Registered.')
        })     
    })
    it("Updated", function() {
        read_email('updated_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Details Updated')
            expect(r.message).to.have.string('Name: test register')
            expect(r.message).to.have.string('Email: epdarnell+freevote@gmail.com')
            expect(r.message).to.have.string('Post Code: ')
            expect(r.button.title).to.equal('Contact Us')
            expect(r.button.text).to.equal('')
        })     
    })
    it("Welcome", function() {
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
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain','Message sent. We aim to respond within 24 hours.')
        })     
    })
    it("Contact", function() {
        read_email('contact_'+tester.email,r=>{
            expect(r.greet).to.equal('')
            expect(r.to).to.be.null
            expect(r.from.name).to.equal(tester.name)
            expect(r.from.email).to.equal(tester.email)
            expect(r.title).to.equal('Message from '+tester.name)
            expect(r.message).to.have.string('A test message')
            expect(r.button.title).to.equal("Reply")
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail='+link[1],{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.wait(1000)
            cy.get('div[name=contact]').within(()=>{
                cy.contains('Reply')
                cy.get('textarea[id=formMessage]').type(" - reply")
                cy.get('button[name=send]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain','Message sent. We aim to respond within 24 hours.')
        })     
    })
    it("Reply", function() {
        read_email('reply_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Reply from Ed Darnell')
            expect(r.message).to.have.string('A test message - reply')
            expect(r.button.title).to.equal('Reply')
            expect(r.button.text).to.equal('to view online and reply')
        })     
    })
    it("Unsubscribe", function() {
        read_email('confirmed_'+tester.email,r=>{
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            let unsub='X'+link[1].substr(1)
            cy.visit('/?mail='+unsub,{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.get('div[name=unsubscribe]').within(()=>{
                cy.contains('Delete Account')
                cy.get('button[name=unsubscribe]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain','You have been unsubscribed.')
        })     
    })
    it("Unsubscribed", function() {
        read_email('unsubscribe_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Account Deleted')
            expect(r.message).to.have.string('Your account has now been unsubscribed and your details removed from our database.')
            expect(r.button.title).to.equal('Contact Us')
            expect(r.button.text).to.equal('contact FreeVote.uk')
        })     
    })
    it("Contact Us", function() {
        setup(cy)
        cy.get('a[name=contact]').click()
        cy.get('div[name=contact]').within(()=>{
            cy.contains('Contact Us')
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
            cy.get('textarea[id=formMessage]').should(n=>{
                expect(n.get(0).checkValidity()).to.equal(false)
                expect(n.get(0).validationMessage).to.equal('Please fill in this field.')
            }).type("A test message").should(n=>{
                expect(n.get(0).checkValidity()).to.equal(true)
                expect(n.get(0).validationMessage).to.equal('')
            })
            cy.get('button[name=send]').click()
        })
        cy.get('div[name=alert]').should('contain','Not sent: anti-spam check failed.')
        
        cy.get('a[name=contact]').click()
        cy.get('div[name=contact]').within(()=>{
            cy.get('input[name=name]').type(tester.name)
            cy.get('input[name=email]').clear().type(tester.email)
            cy.get('textarea[id=formMessage]').type("A test message")
            cy.get('input[name=cb2]').click()
            cy.get('button[name=send]').click()
        })
        //cy.wait(2000)
        cy.get('div[name=alert]').should('contain','Please check your email to confirm sending.')
    })
    it("Confirm Send", function() {
        read_email('send_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
            expect(r.to.name).to.equal(tester.name)
            expect(r.to.email).to.equal(tester.email)
            expect(r.from).to.be.null
            expect(r.title).to.equal('Confirm Send')
            expect(r.message).to.have.string('Thank you for your message. Please use the send button below to confirm sending.')
            expect(r.button.title).to.equal('Send')
            expect(r.button.text).to.equal('to send your message')
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail='+link[1],{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.wait(1000)
            cy.get('div[name=contact]').within(()=>{
                cy.contains('Contact Us')
                cy.get('button[name=send]').click()
            })
            //cy.wait(2000)
            cy.get('div[name=alert]').should('contain','Message sent. We aim to respond within 24 hours.')
        })     
    })
    it("Contact2", function() {
        read_email('contact_'+tester.email,r=>{
            expect(r.greet).to.equal('')
            expect(r.to).to.be.null
            expect(r.from.name).to.equal(tester.name)
            expect(r.from.email).to.equal(tester.email)
            expect(r.title).to.equal('Message from '+tester.name)
            expect(r.message).to.have.string('A test message')
            expect(r.button.title).to.equal("Reply")
            let link=r.button.url.match(/http:\/\/.*\?mail=(.*)/)
            cy.visit('/?mail='+link[1],{onBeforeLoad:(win)=>{win.fetch = null}})
            cy.wait(1000)
            cy.get('div[name=contact]').within(()=>{
                cy.contains('Reply')
                cy.get('textarea[id=formMessage]').type(" - reply")
                cy.get('button[name=send]').click()
            })
            cy.wait(2000)
            cy.get('div[name=alert]').should('contain','Message sent. We aim to respond within 24 hours.')
        })     
    })
    it("Reply2", function() {
        read_email('reply_'+tester.email,r=>{
            expect(r.greet).to.equal('Dear '+tester.name+',')
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
