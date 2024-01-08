import { ERROR, INFO } from '../../../src/constants/wordings'

describe('Multistep form step-0 without MetaMask connect', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(500)
  })

  it('should have form field disabled with helper message', () => {
    cy.get('#sendingSubnet').should('be.disabled')
    cy.get('#nextButton').should('be.disabled')
  })
})

describe('Multistep form step-0 after MetaMask connect', () => {
  before(() => {
    cy.visit('/')
    cy.wait(500)
    cy.get('#connectButton').click()
    cy.acceptMetamaskAccess()
  })

  beforeEach(() => {
    cy.visit('/')
    cy.wait(500)
  })

  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
  })

  it('should have form field enabled', () => {
    cy.get('#sendingSubnet').should('not.be.disabled')
    cy.get('#nextButton').should('not.be.disabled')
  })

  it('should connect wallet with success', () => {
    cy.get('#account').should(
      'have.text',
      // Set by PRIVATE_KEY in env which synpress uses to import
      // the account in general before() init function call
      // This address is the Topos Deployer address
      '0x4aab25b4fad0beaac466050f3a7142a502f4cf0a'
    )
  })

  it('should list Topos, and Incal', () => {
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content')
      .contains('Topos')
      .and('be.visible')
    cy.get('.ant-select-item-option-content')
      .contains('Incal')
      .should('be.visible')
  })

  it('should open MetaMask to add Topos network when click on Topos', () => {
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.get('.ant-select-selection-item').should('have.text', 'Topos')
    cy.allowMetamaskToAddAndSwitchNetwork()
  })

  it('should open MetaMask to add Incal network when click on Incal', () => {
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Incal').click()
    cy.get('.ant-select-selection-item').should('have.text', 'Incal')
    cy.allowMetamaskToAddAndSwitchNetwork()
  })

  it('should not ask to add networks when switching back to them', () => {
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.allowMetamaskToSwitchNetwork()

    cy.get('#sendingSubnet').click({ force: true })
    cy.get('.ant-select-item-option-content').contains('Incal').click()
    cy.allowMetamaskToSwitchNetwork()
  })

  it('should invalidate form if trying to next without sending subnet', () => {
    cy.get('#nextButton').click()
    cy.get('#sendingSubnet')
      .parents('.ant-form-item')
      .should('have.class', 'ant-form-item-has-error')
    cy.get('#sendingSubnet_help').should(
      'have.text',
      ERROR.MISSING_SENDING_SUBNET
    )
  })

  it('should go to next step if a sending subnet was selected', () => {
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.allowMetamaskToSwitchNetwork()
    cy.get('#nextButton').click()
    cy.get('#sendingSubnet').should('not.exist')
    cy.get('#token').should('exist')
  })
})
