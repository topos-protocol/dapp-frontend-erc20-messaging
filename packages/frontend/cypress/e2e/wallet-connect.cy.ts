describe('connect wallet spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  before(() => {
    cy.visit('/')
    cy.get('#connectButton').click()
    cy.acceptMetamaskAccess()
  })

  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
  })

  it('should connect wallet with success', () => {
    cy.get('#account').should(
      'have.text',
      // Set by PRIVATE_KEY in env which synpress uses to import the account in general before() init function call
      // This address is the Topos Deployer address
      '0x4aab25b4fad0beaac466050f3a7142a502f4cf0a'
    )
  })

  it('should list Topos, Incal, and Edena', () => {
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').should('exist')
    cy.get('.ant-select-item-option-content').contains('Incal').should('exist')
    cy.get('.ant-select-item-option-content').contains('Edena').should('exist')
  })

  it('should have all three visible on click', () => {
    cy.get('#sendingSubnet').click()

    cy.get('.ant-select-item-option-content')
      .contains('Topos')
      .should('be.visible')
    cy.get('.ant-select-item-option-content')
      .contains('Incal')
      .should('be.visible')
    cy.get('.ant-select-item-option-content')
      .contains('Edena')
      .should('be.visible')
  })
})
