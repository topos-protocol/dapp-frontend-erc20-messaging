import { shortenAddress } from '../../../src/utils'

describe('Multistep form step-2', () => {
  before(() => {
    cy.visit('/')
    cy.wait(500)
    cy.get('#connectButton').click()
    cy.acceptMetamaskAccess()
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.allowMetamaskToSwitchNetwork()
  })

  beforeEach(() => {
    cy.visit('/')
    cy.wait(500)
    cy.get('#sendingSubnet').click()
    cy.get('.ant-select-item-option-content').contains('Topos').click()
    cy.get('#nextButton').click()
    cy.get('#token').click()
    cy.wait(500)
    cy.get('#token_list')
      .parent()
      .find('.ant-select-item-option-content')
      .contains('TST')
      .click()
    cy.get('#receivingSubnet').click()
    cy.wait(500)
    cy.get('#receivingSubnet_list')
      .parent()
      .find('.ant-select-item-option-content')
      .contains('Incal')
      .click()
    cy.get('#recipientAddress').type(
      '0x4aab25b4fad0beaac466050f3a7142a502f4cf0a'
    )
    cy.get('#amount').type('1')
    cy.get('#nextButton').click()
  })

  it('should have all information in summary', () => {
    cy.get('#summary0SendingSubnet').should('have.text', 'Topos')
    cy.get('#summary1ReceivingSubnet').should('have.text', 'Incal')
    cy.get('#summary1Token').should('have.text', 'TST')
    cy.get('#summary1RecipientAddress').should(
      'have.text',
      shortenAddress('0x4aab25b4fad0beaac466050f3a7142a502f4cf0a')
    )
  })

  it('should show the right execution steps', () => {
    cy.get('#executeStep0')
      .find('div')
      .contains('Requesting TST allowance approval')
    cy.get('#executeStep0').find('h4').should('have.text', 'Topos')
    cy.get('#executeStep1').find('div').contains('Requesting TST transfer')
    cy.get('#executeStep1').find('h4').should('have.text', 'Topos')
    cy.get('#executeStep2')
      .find('div')
      .contains('Waiting for transaction execution')
    cy.get('#executeStep2').find('h4').should('have.text', 'Incal')
  })

  it('should be working on first execution step', () => {
    cy.get('#executeStep0').find('.ant-spin').should('be.visible')
    cy.get('#executeStep1').find('.ant-spin').should('not.exist')
    cy.get('#executeStep2').find('.ant-spin').should('not.exist')
  })

  it('should request allowance approval and sendToken transaction signature', () => {
    cy.confirmMetamaskPermissionToSpend('1')
    cy.get('#executeStep1').find('.ant-spin').should('be.visible')
    cy.get('#executeStep0').find('.ant-spin').should('not.exist')
    cy.get('#executeStep2').find('.ant-spin').should('not.exist')
    cy.confirmMetamaskTransaction()
    cy.get('#executeStep2').find('.ant-spin').should('be.visible')
    cy.get('#executeStep0').find('.ant-spin').should('not.exist')
    cy.get('#executeStep1').find('.ant-spin').should('not.exist')
    cy.get('.ant-result-success', { timeout: 60000 })
      .find('.ant-result-subtitle')
      .should('be.visible')
      .and('have.text', 'Transaction was submitted on Incal')
    cy.get('#resetButton').should('be.visible').and('not.be.disabled')
    cy.get('#resetButton').click()
    cy.get('#sendingSubnet').should('exist')
    cy.get('.ant-result-success').should('not.exist')
    cy.get('#summary0SendingSubnet').should('not.exist')
    cy.get('#executeStep1').should('not.exist')
  })
})
