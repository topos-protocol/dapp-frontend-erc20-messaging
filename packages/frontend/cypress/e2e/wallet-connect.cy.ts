describe('connect wallet spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
  })

  it('should connect wallet with success', () => {
    cy.get('#connectButton').click()
    cy.acceptMetamaskAccess()
    cy.get('#account').should(
      'have.text',
      // Set by PRIVATE_KEY in env which synpress uses to import the account in general before() init function call
      // This address is the Topos Deployer address
      '0x4aab25b4fad0beaac466050f3a7142a502f4cf0a'
    )
  })
})
